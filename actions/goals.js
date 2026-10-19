"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cache } from "react";

const serializeDecimal = (obj) => {
  if (!obj) return null;
  const serialized = { ...obj };
  if (obj.targetAmount && typeof obj.targetAmount.toNumber === "function") {
    serialized.targetAmount = obj.targetAmount.toNumber();
  } else if (obj.targetAmount !== undefined && obj.targetAmount !== null) {
    serialized.targetAmount = Number(obj.targetAmount);
  }

  if (obj.savedAmount && typeof obj.savedAmount.toNumber === "function") {
    serialized.savedAmount = obj.savedAmount.toNumber();
  } else if (obj.savedAmount !== undefined && obj.savedAmount !== null) {
    serialized.savedAmount = Number(obj.savedAmount);
  }

  if (obj.amount && typeof obj.amount.toNumber === "function") {
    serialized.amount = obj.amount.toNumber();
  } else if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = Number(obj.amount);
  }

  if (obj.balance && typeof obj.balance.toNumber === "function") {
    serialized.balance = obj.balance.toNumber();
  } else if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = Number(obj.balance);
  }

  if (obj.expectedReturnRate && typeof obj.expectedReturnRate.toNumber === "function") {
    serialized.expectedReturnRate = obj.expectedReturnRate.toNumber();
  } else if (obj.expectedReturnRate !== undefined && obj.expectedReturnRate !== null) {
    serialized.expectedReturnRate = Number(obj.expectedReturnRate);
  }

  return serialized;
};

// Helper to authenticate and get current database user with per-request memoization
const getAuthUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      accounts: {
        orderBy: { isDefault: "desc" },
      },
    },
  });

  if (!user) {
    await checkUser();
    user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: {
          orderBy: { isDefault: "desc" },
        },
      },
    });
  }

  if (!user) throw new Error("User account not found");
  return user;
});

/**
 * 1. GET ALL FINANCIAL GOALS WITH SUMMARIES & AVAILABLE ACCOUNTS
 */
export async function getFinancialGoals() {
  try {
    const user = await getAuthUser();

    const rawGoals = await db.financialGoal.findMany({
      where: { userId: user.id },
      include: {
        contributions: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            sourceAccount: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        _count: {
          select: { contributions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    // Check and update any goal that has become overdue
    const statusUpdates = [];
    const goals = rawGoals.map((goal) => {
      const saved = goal.savedAmount ? goal.savedAmount.toNumber() : 0;
      const target = goal.targetAmount ? goal.targetAmount.toNumber() : 0;
      const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;

      let status = goal.status;
      if (saved >= target && target > 0) {
        status = "COMPLETED";
      } else if (targetDate && targetDate < now && saved < target) {
        status = "OVERDUE";
      } else if (saved > 0) {
        status = "IN_PROGRESS";
      } else {
        status = "NOT_STARTED";
      }

      if (status !== goal.status) {
        statusUpdates.push({ id: goal.id, status });
      }

      return {
        ...serializeDecimal(goal),
        status,
        contributions: goal.contributions.map((c) => ({
          ...serializeDecimal(c),
          sourceAccount: c.sourceAccount
            ? serializeDecimal(c.sourceAccount)
            : null,
        })),
      };
    });

    if (statusUpdates.length > 0) {
      Promise.allSettled(
        statusUpdates.map((update) =>
          db.financialGoal.update({
            where: { id: update.id },
            data: { status: update.status },
          })
        )
      ).catch((err) => console.error("Failed to auto-sync goal status:", err));
    }

    // Calculate aggregated overview metrics
    const accounts = (user.accounts || []).map(serializeDecimal);
    const totalAvailableBalance = accounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );

    const activeGoals = goals.filter((g) => g.status !== "COMPLETED");
    const completedGoals = goals.filter((g) => g.status === "COMPLETED");

    const totalGoalTarget = activeGoals.reduce(
      (sum, g) => sum + (g.targetAmount || 0),
      0
    );

    const totalSaved = goals.reduce(
      (sum, g) => sum + (g.savedAmount || 0),
      0
    );

    const totalRemainingAmount = activeGoals.reduce(
      (sum, g) => sum + Math.max(0, (g.targetAmount || 0) - (g.savedAmount || 0)),
      0
    );

    return {
      success: true,
      data: {
        goals,
        accounts,
        overview: {
          totalGoalTarget,
          totalSaved,
          totalRemainingAmount,
          availableBalance: totalAvailableBalance,
          activeGoalsCount: activeGoals.length,
          completedGoalsCount: completedGoals.length,
          totalGoalsCount: goals.length,
        },
      },
    };
  } catch (error) {
    console.error("Error in getFinancialGoals:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. CREATE A FINANCIAL GOAL (WITH OPTIONAL INITIAL CONTRIBUTION)
 */
export async function createFinancialGoal(data) {
  try {
    const user = await getAuthUser();

    const name = data.name?.trim();
    if (!name) throw new Error("Goal name is required");

    const targetAmount = parseFloat(data.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      throw new Error("Target amount must be greater than zero");
    }

    const initialContribution = parseFloat(data.initialContribution || 0);
    if (isNaN(initialContribution) || initialContribution < 0) {
      throw new Error("Initial contribution cannot be negative");
    }

    const category = data.category?.trim() || "Savings";
    const description = data.description?.trim() || null;
    const targetDate = data.targetDate ? new Date(data.targetDate) : null;
    const icon = data.icon || "Target";
    const expectedReturnRate = parseFloat(data.expectedReturnRate || 0);

    // Validate account balance if initial contribution is specified
    let sourceAccount = null;
    if (initialContribution > 0) {
      if (!data.sourceAccountId) {
        throw new Error("Please select an account for the initial contribution");
      }

      sourceAccount = await db.account.findFirst({
        where: { id: data.sourceAccountId, userId: user.id },
      });

      if (!sourceAccount) {
        throw new Error("Selected account not found or unauthorized");
      }

      const availableBalance = sourceAccount.balance.toNumber();
      if (initialContribution > availableBalance) {
        throw new Error(
          `Initial contribution (₹${initialContribution.toFixed(
            2
          )}) exceeds available balance (₹${availableBalance.toFixed(2)})`
        );
      }
    }

    // Determine initial status
    let status = "NOT_STARTED";
    if (initialContribution >= targetAmount) {
      status = "COMPLETED";
    } else if (initialContribution > 0) {
      status = "IN_PROGRESS";
    }

    // Atomic transaction: create goal, update account, record contribution
    const result = await db.$transaction(async (tx) => {
      const goal = await tx.financialGoal.create({
        data: {
          userId: user.id,
          name,
          category,
          description,
          targetAmount,
          savedAmount: initialContribution,
          targetDate,
          status,
          icon,
          expectedReturnRate: isNaN(expectedReturnRate) ? 0 : expectedReturnRate,
        },
      });

      if (initialContribution > 0 && sourceAccount) {
        // Re-verify balance inside transaction
        const currentAcct = await tx.account.findUnique({
          where: { id: sourceAccount.id },
        });
        if (!currentAcct || currentAcct.balance.toNumber() < initialContribution) {
          throw new Error(
            `Insufficient balance in account. Available: ₹${
              currentAcct ? currentAcct.balance.toNumber().toFixed(2) : "0.00"
            }.`
          );
        }

        // Deduct from account balance
        await tx.account.update({
          where: { id: sourceAccount.id },
          data: {
            balance: {
              decrement: initialContribution,
            },
          },
        });

        // Record persistent contribution record
        await tx.goalContribution.create({
          data: {
            goalId: goal.id,
            userId: user.id,
            sourceAccountId: sourceAccount.id,
            amount: initialContribution,
            transactionType: "CONTRIBUTION",
            note: "Initial contribution upon goal creation",
            reference: `INIT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          },
        });
      }

      return goal;
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    if (sourceAccount) {
      revalidatePath(`/account/${sourceAccount.id}`);
    }

    return { success: true, data: serializeDecimal(result) };
  } catch (error) {
    console.error("Error creating financial goal:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. ADD MONEY / CONTRIBUTE TO A FINANCIAL GOAL
 */
export async function addGoalContribution({ goalId, sourceAccountId, amount, note }) {
  try {
    const user = await getAuthUser();

    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      throw new Error("Contribution amount must be greater than zero");
    }

    if (!goalId) throw new Error("Goal ID is required");
    if (!sourceAccountId) throw new Error("Source account is required");

    // Fetch and verify goal
    const goal = await db.financialGoal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!goal) throw new Error("Financial goal not found or unauthorized");

    // Fetch and verify source account
    const account = await db.account.findFirst({
      where: { id: sourceAccountId, userId: user.id },
    });
    if (!account) throw new Error("Source account not found or unauthorized");

    const accountBalance = account.balance.toNumber();
    if (contributionAmount > accountBalance) {
      throw new Error(
        `Insufficient account balance (₹${accountBalance.toFixed(
          2
        )}). Cannot contribute ₹${contributionAmount.toFixed(2)}.`
      );
    }

    const currentSaved = goal.savedAmount.toNumber();
    const target = goal.targetAmount.toNumber();
    const newSaved = currentSaved + contributionAmount;

    let newStatus = "IN_PROGRESS";
    if (newSaved >= target) {
      newStatus = "COMPLETED";
    }

    const reference = `GC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Atomic transaction: deduct from account, add to goal, log contribution
    const updated = await db.$transaction(async (tx) => {
      // Re-verify balance inside transaction
      const currentAcct = await tx.account.findUnique({
        where: { id: sourceAccountId },
      });
      if (!currentAcct || currentAcct.balance.toNumber() < contributionAmount) {
        throw new Error(
          `Insufficient account balance. Available: ₹${
            currentAcct ? currentAcct.balance.toNumber().toFixed(2) : "0.00"
          }.`
        );
      }

      // 1. Deduct money from account
      await tx.account.update({
        where: { id: sourceAccountId },
        data: {
          balance: {
            decrement: contributionAmount,
          },
        },
      });

      // 2. Add money to goal savedAmount
      const updatedGoal = await tx.financialGoal.update({
        where: { id: goalId },
        data: {
          savedAmount: {
            increment: contributionAmount,
          },
          status: newStatus,
        },
      });

      // 3. Insert GoalContribution entry
      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          userId: user.id,
          sourceAccountId,
          amount: contributionAmount,
          transactionType: "CONTRIBUTION",
          note: note?.trim() || "Goal contribution",
          reference,
        },
      });

      return { goal: updatedGoal, contribution };
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    revalidatePath(`/account/${sourceAccountId}`);

    return {
      success: true,
      data: {
        goal: serializeDecimal(updated.goal),
        contribution: serializeDecimal(updated.contribution),
      },
    };
  } catch (error) {
    console.error("Error in addGoalContribution:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. RELEASE / REFUND MONEY FROM GOAL BACK TO AN ACCOUNT
 */
export async function withdrawGoalFunds({ goalId, targetAccountId, amount, note }) {
  try {
    const user = await getAuthUser();

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      throw new Error("Withdrawal amount must be greater than zero");
    }

    const goal = await db.financialGoal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!goal) throw new Error("Goal not found");

    const account = await db.account.findFirst({
      where: { id: targetAccountId, userId: user.id },
    });
    if (!account) throw new Error("Target account not found");

    const currentSaved = goal.savedAmount.toNumber();
    if (withdrawAmount > currentSaved) {
      throw new Error(
        `Cannot withdraw ₹${withdrawAmount.toFixed(
          2
        )}. Goal only has ₹${currentSaved.toFixed(2)} allocated.`
      );
    }

    const newSaved = currentSaved - withdrawAmount;
    const target = goal.targetAmount.toNumber();
    const now = new Date();
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;

    let newStatus = "IN_PROGRESS";
    if (newSaved >= target && target > 0) {
      newStatus = "COMPLETED";
    } else if (targetDate && targetDate < now) {
      newStatus = "OVERDUE";
    } else if (newSaved <= 0) {
      newStatus = "NOT_STARTED";
    }

    const reference = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Atomic transaction: decrement goal, increment account, log reversal
    const result = await db.$transaction(async (tx) => {
      const currentGoal = await tx.financialGoal.findUnique({
        where: { id: goalId },
      });
      if (!currentGoal || currentGoal.savedAmount.toNumber() < withdrawAmount) {
        throw new Error(
          `Cannot withdraw: Goal only has ₹${
            currentGoal ? currentGoal.savedAmount.toNumber().toFixed(2) : "0.00"
          } allocated.`
        );
      }

      await tx.financialGoal.update({
        where: { id: goalId },
        data: {
          savedAmount: {
            decrement: withdrawAmount,
          },
          status: newStatus,
        },
      });

      await tx.account.update({
        where: { id: targetAccountId },
        data: {
          balance: {
            increment: withdrawAmount,
          },
        },
      });

      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          userId: user.id,
          sourceAccountId: targetAccountId,
          amount: withdrawAmount,
          transactionType: "REFUND",
          note: note?.trim() || "Funds released back to account",
          reference,
        },
      });

      return contribution;
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    revalidatePath(`/account/${targetAccountId}`);

    return { success: true, data: serializeDecimal(result) };
  } catch (error) {
    console.error("Error in withdrawGoalFunds:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. EDIT A FINANCIAL GOAL
 */
export async function updateFinancialGoal(id, data) {
  try {
    const user = await getAuthUser();

    const existingGoal = await db.financialGoal.findFirst({
      where: { id, userId: user.id },
    });
    if (!existingGoal) throw new Error("Goal not found or unauthorized");

    const name = data.name?.trim();
    if (!name) throw new Error("Goal name is required");

    const targetAmount = parseFloat(data.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      throw new Error("Target amount must be greater than zero");
    }

    const category = data.category?.trim() || existingGoal.category;
    const description =
      data.description !== undefined
        ? data.description?.trim() || null
        : existingGoal.description;
    const targetDate = data.targetDate ? new Date(data.targetDate) : null;
    const icon = data.icon || existingGoal.icon;
    const expectedReturnRate =
      data.expectedReturnRate !== undefined
        ? parseFloat(data.expectedReturnRate)
        : (typeof existingGoal.expectedReturnRate?.toNumber === "function"
            ? existingGoal.expectedReturnRate.toNumber()
            : Number(existingGoal.expectedReturnRate) || 0);

    const savedAmount =
      typeof existingGoal.savedAmount?.toNumber === "function"
        ? existingGoal.savedAmount.toNumber()
        : Number(existingGoal.savedAmount) || 0;
    const now = new Date();

    let status = existingGoal.status;
    if (savedAmount >= targetAmount) {
      status = "COMPLETED";
    } else if (targetDate && targetDate < now) {
      status = "OVERDUE";
    } else if (savedAmount > 0) {
      status = "IN_PROGRESS";
    } else {
      status = "NOT_STARTED";
    }

    const updated = await db.financialGoal.update({
      where: { id },
      data: {
        name,
        targetAmount,
        category,
        description,
        targetDate,
        icon,
        expectedReturnRate: isNaN(expectedReturnRate) ? 0 : expectedReturnRate,
        status,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    return { success: true, data: serializeDecimal(updated) };
  } catch (error) {
    console.error("Error in updateFinancialGoal:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 6. DELETE A FINANCIAL GOAL SAFELY (WITH FUNDS RELEASE OPTION)
 */
export async function deleteFinancialGoal({ goalId, releaseToAccountId }) {
  try {
    const user = await getAuthUser();

    const goal = await db.financialGoal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!goal) throw new Error("Goal not found or unauthorized");

    const saved = goal.savedAmount.toNumber();

    await db.$transaction(async (tx) => {
      // If there are funds and a release account is provided, refund first
      if (saved > 0 && releaseToAccountId) {
        const targetAccount = await tx.account.findFirst({
          where: { id: releaseToAccountId, userId: user.id },
        });
        if (!targetAccount) {
          throw new Error("Specified refund account was not found");
        }

        // Return money to account
        await tx.account.update({
          where: { id: releaseToAccountId },
          data: {
            balance: {
              increment: saved,
            },
          },
        });
      }

      // Delete the goal (contributions cascade)
      await tx.financialGoal.delete({
        where: { id: goalId },
      });
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    if (releaseToAccountId) {
      revalidatePath(`/account/${releaseToAccountId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteFinancialGoal:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 7. GET CONTRIBUTION HISTORY FOR A GOAL
 */
export async function getGoalContributionHistory(goalId) {
  try {
    const user = await getAuthUser();

    const goal = await db.financialGoal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!goal) throw new Error("Goal not found");

    const contributions = await db.goalContribution.findMany({
      where: { goalId, userId: user.id },
      include: {
        sourceAccount: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: contributions.map((c) => ({
        ...serializeDecimal(c),
        sourceAccount: c.sourceAccount ? serializeDecimal(c.sourceAccount) : null,
      })),
    };
  } catch (error) {
    console.error("Error in getGoalContributionHistory:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 8. GET FINANCIAL BEHAVIOUR DATA FOR GOAL PLANNER
 * Analyzes past user income, expenses, and surplus to connect goals to realistic finances.
 */
export async function getFinancialBehaviourData() {
  try {
    const user = await getAuthUser();

    // Fetch transactions from the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: sixMonthsAgo },
      },
      orderBy: { date: "asc" },
    });

    // Group transactions by YYYY-MM
    const monthlyBuckets = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyBuckets[key]) {
        monthlyBuckets[key] = { income: 0, expenses: 0 };
      }
      const amount = tx.amount ? tx.amount.toNumber() : 0;
      if (tx.type === "INCOME") {
        monthlyBuckets[key].income += amount;
      } else if (tx.type === "EXPENSE") {
        monthlyBuckets[key].expenses += amount;
      }
    });

    const monthKeys = Object.keys(monthlyBuckets);
    const monthsCount = monthKeys.length || 1;

    let totalIncome = 0;
    let totalExpenses = 0;

    monthKeys.forEach((key) => {
      totalIncome += monthlyBuckets[key].income;
      totalExpenses += monthlyBuckets[key].expenses;
    });

    const avgMonthlyIncome = monthsCount > 0 ? totalIncome / monthsCount : 0;
    const avgMonthlyExpenses = monthsCount > 0 ? totalExpenses / monthsCount : 0;
    const estimatedMonthlySurplus = Math.max(0, avgMonthlyIncome - avgMonthlyExpenses);

    // Get active goals to calculate total committed monthly contributions
    const activeGoals = await db.financialGoal.findMany({
      where: {
        userId: user.id,
        status: { in: ["IN_PROGRESS", "NOT_STARTED"] },
      },
    });

    let totalRequiredMonthly = 0;
    const now = new Date();

    activeGoals.forEach((goal) => {
      const remaining = Math.max(
        0,
        goal.targetAmount.toNumber() - goal.savedAmount.toNumber()
      );
      if (goal.targetDate && remaining > 0) {
        const target = new Date(goal.targetDate);
        const diffMonths = Math.max(
          1,
          (target.getFullYear() - now.getFullYear()) * 12 +
            (target.getMonth() - now.getMonth())
        );
        totalRequiredMonthly += remaining / diffMonths;
      }
    });

    return {
      success: true,
      data: {
        avgMonthlyIncome: Number(avgMonthlyIncome.toFixed(2)),
        avgMonthlyExpenses: Number(avgMonthlyExpenses.toFixed(2)),
        estimatedMonthlySurplus: Number(estimatedMonthlySurplus.toFixed(2)),
        totalRequiredMonthly: Number(totalRequiredMonthly.toFixed(2)),
        remainingSurplusAfterGoals: Number(
          (estimatedMonthlySurplus - totalRequiredMonthly).toFixed(2)
        ),
        monthsAnalyzed: monthKeys.length,
        hasSufficientData: monthKeys.length >= 1 && (totalIncome > 0 || totalExpenses > 0),
        monthlyHistory: monthKeys.map((key) => ({
          month: key,
          income: Number(monthlyBuckets[key].income.toFixed(2)),
          expenses: Number(monthlyBuckets[key].expenses.toFixed(2)),
          surplus: Number(
            (monthlyBuckets[key].income - monthlyBuckets[key].expenses).toFixed(2)
          ),
        })),
      },
    };
  } catch (error) {
    console.error("Error in getFinancialBehaviourData:", error);
    return { success: false, error: error.message };
  }
}
