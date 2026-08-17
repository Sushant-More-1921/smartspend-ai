import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found in database");

    // --- Parse request body ---
    const body = await req.json();
    const userQuestion =
      body.prompt?.trim() || "How does my recent spending affect my budget?";

    // --- Budget data ---
    const budgetData = await db.budget.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { amount: true },
    });

    // --- Transactions ---
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 100,
      select: { amount: true, type: true, date: true, category: true },
    });

    const cleanedTx = (transactions || []).map((t) => ({
      ...t,
      amount: Number(t.amount || 0),
      date: new Date(t.date),
    }));

    // --- Spending calculations ---
    const totalSpentAllTime = cleanedTx.reduce(
      (sum, t) => (t.type === "EXPENSE" ? sum + t.amount : sum),
      0
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = cleanedTx.filter(
      (t) =>
        t.date.getMonth() === currentMonth &&
        t.date.getFullYear() === currentYear &&
        t.type === "EXPENSE"
    );

    const totalSpentThisMonth = monthlyTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const totalBudget = Number(budgetData?.amount || 0);
    const remaining = Math.max(totalBudget - totalSpentThisMonth,0); // Prevent negative

    const categories = [
      ...new Set(cleanedTx.map((t) => t.category || "Uncategorized")),
    ].join(", ");

    // --- Gemini Prompt ---
    const summaryPrompt = `
You are a friendly and professional Financial Advisor who speaks with empathy and clarity. 
Your tone should sound like a real person — warm, motivational, and insightful.
Respond to the user’s question using the financial data below.
If needed, use reasonable external knowledge to make your insights more relevant.

Focus on:
- The user’s budget health (are they balanced or overspending?)
- How their recent spending (like events or trips) affects their budget
- What this means for their short-term goals
- One or two simple, practical tips
- End with a positive, encouraging note

Respond ONLY in JSON (no markdown, no extra text).

{
  "summary": [
    "sentence1",
    "sentence2",
    "sentence3",
    "sentence4",
    "sentence5"
  ],
  "budget": number,
  "spentThisMonth": number,
  "spentAllTime": number,
  "remaining": number,
  "monthlyProjection": [
    {"month": "Nov", "value": number},
    {"month": "Dec", "value": number},
    {"month": "Jan", "value": number},
    {"month": "Feb", "value": number}
  ]
}

User Context:
- Question: "${userQuestion}"
- Current Budget: ₹${totalBudget}
- Spent This Month: ₹${totalSpentThisMonth}
- Spent All Time: ₹${totalSpentAllTime}
- Remaining Budget: ₹${remaining}
- Categories: ${categories}
- Total Transactions: ${cleanedTx.length}
    `;

    // --- Gemini API call ---
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: summaryPrompt }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json({ error: "Gemini API failed" }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const textResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    let parsed;
    try {
      const cleanText = textResponse
        ?.replace(/```json|```/g, "")
        ?.trim()
        ?.match(/\{[\s\S]*\}/)?.[0];
      parsed = JSON.parse(cleanText);
    } catch {
      console.error("Gemini JSON parse error:", textResponse);
      parsed = {
        summary: ["AI summary unavailable. Please try again later."],
        budget: totalBudget,
        spentThisMonth: totalSpentThisMonth,
        spentAllTime: totalSpentAllTime,
        remaining,
        monthlyProjection: [
          { month: "Nov", value: totalSpentThisMonth },
          { month: "Dec", value: totalSpentThisMonth * 1.05 },
          { month: "Jan", value: totalSpentThisMonth * 1.1 },
          { month: "Feb", value: totalSpentThisMonth * 1.15 },
        ],
      };
    }

    // --- Calculate updated remaining from Gemini response ---
    const spent = Number(parsed.spentThisMonth || totalSpentThisMonth);
    const updatedRemaining = Math.max(totalBudget - spent, 0).toFixed(2);

    return NextResponse.json({
      ...parsed,
      spent,
      currentMonthSpent: spent,
      totalSpentAllTime,
      remaining: updatedRemaining,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
