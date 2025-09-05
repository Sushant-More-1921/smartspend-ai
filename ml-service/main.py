# ml-service/main.py
import os
import joblib
import pandas as pd
import psycopg2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
MODEL_DIR = os.getenv("MODEL_DIR", "model")
MIN_USER_TRANSACTIONS = int(os.getenv("MIN_USER_TRANSACTIONS", 10))
MIN_USER_MONTHS = int(os.getenv("MIN_USER_MONTHS", 3))

app = FastAPI()

# allow cross origin for local dev (frontend might directly call ML service in some setups)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model artifacts if present
model = None
categories = []
global_ratios = None
if os.path.exists(os.path.join(MODEL_DIR, "budget_predictor.pkl")):
    model = joblib.load(os.path.join(MODEL_DIR, "budget_predictor.pkl"))
if os.path.exists(os.path.join(MODEL_DIR, "categories.csv")):
    categories = pd.read_csv(os.path.join(MODEL_DIR, "categories.csv"), header=None)[0].tolist()
if os.path.exists(os.path.join(MODEL_DIR, "global_ratios.pkl")):
    global_ratios = joblib.load(os.path.join(MODEL_DIR, "global_ratios.pkl"))['ratios']

class RecommendRequest(BaseModel):
    email: str
    total_budget: float

def fetch_user_transactions(email):
    if DATABASE_URL is None:
        return None, "No DATABASE_URL provided."
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        # find user id (try a few column names)
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        if not row:
            # try userId column
            cur.execute("SELECT userId FROM users WHERE email = %s", (email,))
            row = cur.fetchone()
            if not row:
                conn.close()
                return pd.DataFrame(), None
        user_id = row[0]

        # try transactions then expenses
        for table in ("transactions", "expenses"):
            try:
                cur.execute(f"SELECT date, category, amount FROM {table} WHERE userId = %s", (user_id,))
                rows = cur.fetchall()
                if rows:
                    df = pd.DataFrame(rows, columns=["date", "category", "amount"])
                    conn.close()
                    return df, None
            except Exception:
                continue
        conn.close()
        return pd.DataFrame(), None
    except Exception as e:
        return None, str(e)

@app.post("/recommend")
def recommend(req: RecommendRequest):
    email = req.email
    total_budget = float(req.total_budget or 0)

    df, err = fetch_user_transactions(email)
    if df is None:
        raise HTTPException(status_code=500, detail=f"DB error: {err}")

    # normalize and validate df
    if df.empty:
        # new user — fallback to model or global ratios or default heuristic
        if model is not None and categories:
            pred = model.predict([[total_budget]])[0]
            result = []
            for cat, amt in zip(categories, pred):
                result.append({"category": cat, "limit": round(float(amt), 2), "percent": round(float(amt)/total_budget*100 if total_budget else 0, 2)})
            # normalize to exactly total_budget
            total_pred = sum([r["limit"] for r in result])
            if total_pred > 0 and total_budget:
                factor = total_budget / total_pred
                for r in result:
                    r["limit"] = round(r["limit"] * factor, 2)
                    r["percent"] = round(r["limit"] / total_budget * 100, 2)
            return {"monthlyLimit": total_budget, "suggestedCategories": result}
        elif global_ratios:
            # apply global proportions
            result = []
            for cat, ratio in global_ratios.items():
                amt = round(total_budget * ratio, 2)
                result.append({"category": cat, "limit": amt, "percent": round(ratio*100, 2)})
            return {"monthlyLimit": total_budget, "suggestedCategories": result}
        else:
            # default heuristic
            defaults = {
                "housing": 0.30, "food": 0.20, "transportation": 0.12,
                "entertainment": 0.08, "savings": 0.30
            }
            # respect only top 5
            result = []
            for cat, pct in defaults.items():
                amt = round(total_budget * pct, 2)
                result.append({"category": cat, "limit": amt, "percent": round(pct*100, 2)})
            return {"monthlyLimit": total_budget, "suggestedCategories": result}

    # user has history -> compute personal proportions
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
    # if 'date' column missing, assume every row is same month
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df['month'] = df['date'].dt.to_period('M')
        months = df['month'].nunique()
    else:
        months = 1

    total_transactions = len(df)
    user_category_totals = df.groupby(df['category'].astype(str))['amount'].sum()
    total_spent = user_category_totals.sum()
    if total_spent == 0:
        # fallback to global model / ratios same as new user
        return recommend(RecommendRequest(email=email, total_budget=total_budget))

    # Decide whether to use personal split or fallback:
    if (total_transactions >= MIN_USER_TRANSACTIONS) or (months >= MIN_USER_MONTHS):
        # Use personal proportions
        proportions = (user_category_totals / total_spent).to_dict()
        result = []
        for cat, prop in proportions.items():
            amt = round(total_budget * prop, 2)
            result.append({"category": cat, "limit": amt, "percent": round(prop*100, 2)})
        # Normalize to total_budget (rounding fixes)
        s = sum([r["limit"] for r in result])
        if s > 0 and total_budget:
            factor = total_budget / s
            for r in result:
                r["limit"] = round(r["limit"] * factor, 2)
                r["percent"] = round(r["limit"] / total_budget * 100, 2)
        return {"monthlyLimit": total_budget, "suggestedCategories": result}
    else:
        # fallback to global model if exists
        if model is not None and categories:
            pred = model.predict([[total_budget]])[0]
            result = []
            for cat, amt in zip(categories, pred):
                result.append({"category": cat, "limit": round(float(amt), 2), "percent": round(float(amt)/total_budget*100 if total_budget else 0, 2)})
            total_pred = sum([r["limit"] for r in result])
            if total_pred > 0 and total_budget:
                factor = total_budget / total_pred
                for r in result:
                    r["limit"] = round(r["limit"] * factor, 2)
                    r["percent"] = round(r["limit"] / total_budget * 100, 2)
            return {"monthlyLimit": total_budget, "suggestedCategories": result}
        elif global_ratios:
            result = []
            for cat, ratio in global_ratios.items():
                amt = round(total_budget * ratio, 2)
                result.append({"category": cat, "limit": amt, "percent": round(ratio*100, 2)})
            return {"monthlyLimit": total_budget, "suggestedCategories": result}
        else:
            # default heuristic
            defaults = {
                "housing": 0.30, "food": 0.20, "transportation": 0.12,
                "entertainment": 0.08, "savings": 0.30
            }
            result = []
            for cat, pct in defaults.items():
                amt = round(total_budget * pct, 2)
                result.append({"category": cat, "limit": amt, "percent": round(pct*100, 2)})
            return {"monthlyLimit": total_budget, "suggestedCategories": result}
