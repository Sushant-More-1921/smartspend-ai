"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get current month's expenses (accounting for whole days & current month additions)
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
      0, 0, 0, 0
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23, 59, 59, 999
    );

    const whereClause = {
      userId: user.id,
      type: "EXPENSE",
      OR: [
        {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      ],
    };

    if (accountId && accountId !== "ALL") {
      whereClause.accountId = accountId;
    }

    // Fetch budget record and expense aggregation in parallel
    const [budget, expenses] = await Promise.all([
      db.budget.findFirst({
        where: { userId: user.id },
      }),
      db.transaction.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
