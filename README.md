# SmartSpend AI 💸🤖
**Personal Finance AI Assistant built with Next.js, Supabase, Prisma, Tailwind, Inngest, ArcJet, and Shadcn UI** 🔥🔥  

SmartSpend AI helps you **track, analyze, and optimize your spending** with the power of AI.  
This repo includes both the **frontend (Next.js)** and a **machine learning microservice (FastAPI)**.  

![Main Screenshot](public/Main%20SS.png)  

---

## 📚 Features  
✅ AI-powered spending recommendations  
✅ Budget tracking with Supabase  
✅ Real-time alerts via Inngest  
✅ Secure authentication (clerk Auth)  
✅ Beautiful Shadcn UI  
✅ Background tasks for expense analysis  
✅ Extensible ML API with FastAPI  

---

## 🚀 Tech Stack
- **Next.js 14** – frontend framework  
- **Tailwind CSS** – modern styling  
- **Prisma** – ORM for DB management  
- **Supabase** – Postgres + Storage  
- **clerk** - Auth
- **Inngest** – background jobs & workflows  
- **ArcJet** – security & fraud protection  
- **Shadcn UI** – beautiful UI components  
- **FastAPI (Python)** – ML microservice  

---



## ⚙️ Installation & Setup  

### 1. Clone the Repo  
```bash
git clone https://github.com/your-username/smartspend-ai.git
cd smartspend-ai
```

### 2. Install Dependencies  
```bash
npm install
```

### 3. Run Development Server  
```bash
npm run dev
```
App will be available at: [http://localhost:3000](http://localhost:3000) 🎉  

---

## 🤖 ML Service Setup  

1. Navigate to the ML folder  
```bash
cd ml-service
```

2. Create a Python virtual environment (recommended)  
```bash
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows
```

3. Install dependencies  
```bash
pip install -r requirements.txt
```

4. Run FastAPI service  
```bash
uvicorn main:app --reload --port 8000
```

API will be live at: [http://localhost:8000](http://localhost:8000) 🚀  

---

## 🛠️ Environment Variables  

Create a `.env` file in the root and add:  
```
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=

RESEND_API_KEY=

ARCJET_KEY=
```
---
