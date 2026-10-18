"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getAccountWithTransactions(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!accountId) return null;

  const account = await db.account.findFirst({
    where: {
      id: accountId,
      user: { clerkUserId: userId },
    },
    include: {
      transactions: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          date: true,
          category: true,
          receiptUrl: true,
          isRecurring: true,
          recurringInterval: true,
          nextRecurringDate: true,
          createdAt: true,
        },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
  };
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    // Group transactions by account to update balances
    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const amountNum =
        typeof transaction.amount === "object" && transaction.amount.toNumber
          ? transaction.amount.toNumber()
          : Number(transaction.amount);
      const change = transaction.type === "EXPENSE" ? amountNum : -amountNum;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Ensure no account drops below zero
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        const acct = await tx.account.findUnique({ where: { id: accountId } });
        if (acct) {
          const newBalance = acct.balance.toNumber() + balanceChange;
          if (newBalance < 0) {
            throw new Error(
              `Cannot delete transaction(s): Deleting this income would make account "${acct.name}" balance negative (₹${newBalance.toFixed(2)}).`
            );
          }
        }
      }

      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    for (const accountId of Object.keys(accountBalanceChanges)) {
      revalidatePath(`/account/${accountId}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // First, unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

revalidatePath("/dashboard");
    return { success: true, data: serializeDecimal(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    if (!accountId) throw new Error("Account ID is required");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const accountToDelete = user.accounts.find((a) => a.id === accountId);
    if (!accountToDelete) {
      throw new Error("Account not found");
    }

    // Restriction: Cannot delete the only remaining account
    if (user.accounts.length <= 1) {
      throw new Error(
        "You must have at least one account. Cannot delete your only account."
      );
    }

    // If deleting the default account, make another existing account the default
    let nextDefaultId = null;
    if (accountToDelete.isDefault) {
      const remainingAccount = user.accounts.find((a) => a.id !== accountId);
      if (remainingAccount) {
        nextDefaultId = remainingAccount.id;
      }
    }

    await db.$transaction(async (tx) => {
      if (nextDefaultId) {
        await tx.account.update({
          where: { id: nextDefaultId },
          data: { isDefault: true },
        });
      }

      await tx.account.delete({
        where: { id: accountId },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    revalidatePath(`/account/${accountId}`);
    revalidatePath("/transaction/create");

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

