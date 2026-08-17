# SmartSpend AI

An AI-powered personal finance management platform designed to track expenses, analyze spending behaviors, predict future financial trends, scan receipts automatically, and deliver intelligent budget insights using Next.js and a Python FastAPI machine learning microservice.


![SmartSpend AI Dashboard Preview](public/Main%20SS.png)
---

## Key Features

- **AI Receipt Scanner**: Automatically extract transaction details from receipt images using Google Gemini AI.
- **Intelligent Financial Dashboard**: Visual analytics, expense categorizations, interactive charts, and account summaries.
- **Smart Budget Management**: Set custom monthly budgets, monitor thresholds, receive alert notifications, and access AI-driven optimization advice.
- **Future Expense Prediction**: Machine learning microservice for forecasting upcoming expenses based on historical user data.
- **Multi-Account Tracking**: Manage multiple financial accounts (Savings, Current) and support for recurring transactions.
- **Automated Background Workflows**: Scheduled financial checkups, recurring transaction execution, and email notifications using Inngest and Resend.
- **Bot Protection and Rate Limiting**: Application security and fraud protection powered by ArcJet.
- **Authentication and User Management**: Secure user onboarding, authentication, and session security using Clerk.

---

## Tech Stack

### Web Application
- **Framework**: Next.js (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Database & ORM**: PostgreSQL (Supabase), Prisma ORM
- **Authentication**: Clerk Auth
- **AI Models**: Google Gemini API
- **Background Jobs**: Inngest
- **Email Notifications**: Resend, React Email
- **Security**: ArcJet

### Machine Learning Service
- **Framework**: Python FastAPI, Uvicorn
- **Data & Analytics**: Scikit-learn, Pandas, Joblib
- **Database Driver**: Psycopg2-binary

---

## Repository Structure

```
ai-finance-platform/
├── actions/             # Server actions for transactions, accounts, and budgets
├── app/                 # Next.js App Router structure
│   ├── (auth)/          # Authentication routes (Sign-in / Sign-up)
│   ├── (main)/          # Dashboard, Account, and Transaction pages
│   ├── api/             # API routes and webhooks
│   ├── future-spend/    # Expense prediction interface
│   ├── know-more/       # Educational and informational pages
│   ├── reports/         # Detailed financial report generation
│   └── smart-budget/    # Budget planning workspace
├── components/          # Reusable UI components
├── data/                # Data models and constants
├── emails/              # React Email notification templates
├── hooks/               # Custom React hooks
├── lib/                 # Client initializations (Prisma, Inngest, ArcJet, Gemini)
├── ml-service/          # Python FastAPI microservice for ML predictions
├── prisma/              # Schema definitions and migrations
└── public/              # Static assets and images
```

---

## Environment Variables

Create a `.env` file in the root project directory with the following variables:

```env
# Database Settings
DATABASE_URL=postgresql://user:password@host:5432/dbname
DIRECT_URL=postgresql://user:password@host:5432/dbname

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Google Gemini AI API
GEMINI_API_KEY=your_gemini_api_key

# Resend Email API
RESEND_API_KEY=your_resend_api_key

# ArcJet Security
ARCJET_KEY=your_arcjet_key
```

If necessary, configure the `.env` inside `ml-service/`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

---

## Getting Started

### Prerequisites
- Node.js 20.0.0 or higher
- Python 3.9 or higher
- PostgreSQL Database instance

### 1. Installation

Clone the repository:
```bash
git clone https://github.com/your-username/smartspend-ai.git
cd smartspend-ai
```

Install Node.js dependencies:
```bash
npm install
```

### 2. Database Configuration

Generate the Prisma client and sync the schema with your database:
```bash
npx prisma generate
npx prisma db push
```

### 3. Running the Next.js Application

Start the development server:
```bash
npm run dev
```

Access the application in your browser at `http://localhost:3000`.

### 4. Running the Machine Learning Service

Navigate to the `ml-service` directory:
```bash
cd ml-service
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Launch the FastAPI service:
```bash
uvicorn main:app --reload --port 8000
```

The ML API server will run at `http://localhost:8000`.

---

## Available Scripts

In the project directory, you can run:

- `npm run dev` - Starts the Next.js development server.
- `npm run build` - Builds the application for production.
- `npm run start` - Runs the compiled production build.
- `npm run lint` - Runs ESLint code quality checks.
- `npm run email` - Starts the React Email development preview server.

---

## License

This project is licensed under the MIT License.
