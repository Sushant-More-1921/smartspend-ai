# ml-service/train_global.py
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
import psycopg2
from dotenv import load_dotenv
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
MODEL_DIR = os.getenv("MODEL_DIR", "model")
os.makedirs(MODEL_DIR, exist_ok=True)

DEFAULT_SPLIT = {
    "food": 0.25,
    "transport": 0.15,
    "bills & fees": 0.20,
    "personal": 0.15,
    "shopping": 0.15,
    "other": 0.10
}

def fetch_all_transactions():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        for table in ("transactions", "expenses"):
            try:
                cur.execute(f"SELECT date, category, amount, type FROM {table}")
                rows = cur.fetchall()
                if rows:
                    df = pd.DataFrame(rows, columns=["date", "category", "amount", "type"])
                    conn.close()
                    return df
            except Exception:
                continue
        conn.close()
    except Exception as e:
        print("DB fetch failed:", e)

    if os.path.exists("expense.csv"):
        df = pd.read_csv("expense.csv", parse_dates=["Date", "date"], dayfirst=True)
        if "Date" in df.columns:
            df = df.rename(columns={"Date": "date"})
        df = df.rename(columns={c.lower(): c for c in df.columns})
        return df

    raise FileNotFoundError("No transactions found in DB and expense.csv not present.")

def preprocess(df):
    df['date'] = pd.to_datetime(df['date'])
    df['category'] = df['category'].astype(str).str.lower().str.strip()
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)

    category_map = {
        "bills": "bills & fees",
        "bill": "bills & fees",
        "personal care": "personal"
    }
    df['category'] = df['category'].replace(category_map)

    # Only keep expenses (ignore income)
    if "type" in df.columns:
        df = df[df['type'].str.lower() == "expense"]

    return df

def build_monthly(df):
    df = df.copy()
    df['month'] = df['date'].dt.to_period('M').dt.to_timestamp()
    monthly = df.groupby(['month', 'category'])['amount'].sum().unstack(fill_value=0)

    all_categories = sorted(set(monthly.columns) | set(DEFAULT_SPLIT.keys()))
    monthly = monthly.reindex(columns=all_categories, fill_value=0)

    monthly['total_budget'] = monthly.sum(axis=1)
    return monthly, all_categories

def train_save_model(monthly, categories):
    X = monthly[['total_budget']]
    y = monthly[categories]

    if len(X) < 2:
        print("Not enough monthly data. Using default split.")
        joblib.dump({"ratios": DEFAULT_SPLIT}, os.path.join(MODEL_DIR, "global_ratios.pkl"))
        pd.Series(categories).to_csv(os.path.join(MODEL_DIR, "categories.csv"), index=False, header=False)
        return

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=14)
    model = MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=14))

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred, multioutput='uniform_average')
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    accuracy_percent = max(0.0, min(1.0, r2)) * 100

    print(f"Model R² score: {r2:.4f}")
    print(f"Model Accuracy (approx): {accuracy_percent:.2f}%")
    print(f"MAE: {mae:.2f}, RMSE: {rmse:.2f}")

    joblib.dump(model, os.path.join(MODEL_DIR, "budget_predictor.pkl"))
    pd.Series(categories).to_csv(os.path.join(MODEL_DIR, "categories.csv"), index=False, header=False)
    print("Saved model to", MODEL_DIR)

def main():
    df = fetch_all_transactions()
    df = preprocess(df)

    if df.empty:
        print("No expense transactions found. Using default split.")
        joblib.dump({"ratios": DEFAULT_SPLIT}, os.path.join(MODEL_DIR, "global_ratios.pkl"))
        return

    monthly, categories = build_monthly(df)
    print("Monthly data shape:", monthly.shape)
    train_save_model(monthly, categories)

if __name__ == "__main__":
    main()
