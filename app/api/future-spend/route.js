import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { generateFutureSpendForecast } from "@/lib/future-spend-engine";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const userPrompt =
      body.prompt?.trim() || "How does my recent spending affect my budget?";

    // Fetch budget & all transactions for the authenticated user
    const [budgetData, transactions] = await Promise.all([
      db.budget.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { amount: true },
      }),
      db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" },
        select: {
          id: true,
          amount: true,
          type: true,
          date: true,
          category: true,
          status: true,
          description: true,
        },
      }),
    ]);

    const budgetAmount = budgetData?.amount ? Number(budgetData.amount) : 0;

    // Run statistical time-series forecasting engine locally
    const forecast = generateFutureSpendForecast({
      transactions,
      budgetAmount,
      prompt: userPrompt,
      referenceDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      summary: forecast.summary,
      budget: forecast.budget,
      spentThisMonth: forecast.spentThisMonth,
      spent: forecast.spentThisMonth,
      remaining: forecast.remaining,
      monthlyProjection: forecast.monthlyProjection,
      baselineSpend: forecast.baselineSpend,
      dataSufficiency: forecast.dataSufficiency,
      isOverBudget: forecast.isOverBudget,
      budgetDeficit: forecast.budgetDeficit,
    });
  } catch (err) {
    console.error("Future spend simulation error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}
