"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) {
    user = await checkUser();
  }

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts;
  } catch (error) {
    console.error(error.message);
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      user = await checkUser();
    }

    if (!user) {
      throw new Error("User not found");
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }
    if (balanceFloat < 0) {
      throw new Error("Initial account balance cannot be negative.");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
      select: { name: true, isDefault: true },
    });

    const accountNameTrimmed = data.name.trim();

    // Restriction: No two accounts can have the same name (case-insensitive)
    const duplicateAccount = existingAccounts.find(
      (acc) => acc.name.trim().toLowerCase() === accountNameTrimmed.toLowerCase()
    );

    if (duplicateAccount) {
      throw new Error(
        `An account with the name "${accountNameTrimmed}" already exists. Each account must have a unique name.`
      );
    }

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        ...data,
        name: accountNameTrimmed,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardOverviewData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const fetchOverviewUser = () =>
    db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        accounts: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { transactions: true },
            },
          },
        },
        transactions: {
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          take: 50,
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            date: true,
            category: true,
            accountId: true,
            createdAt: true,
          },
        },
      },
    });

  let user = await fetchOverviewUser();

  if (!user) {
    await checkUser();
    user = await fetchOverviewUser();
  }

  if (!user) throw new Error("User not found");

  return {
    accounts: (user.accounts || []).map(serializeTransaction),
    transactions: (user.transactions || []).map(serializeTransaction),
  };
}

export async function getDashboardData() {
  const data = await getDashboardOverviewData();
  return data.transactions;
}
