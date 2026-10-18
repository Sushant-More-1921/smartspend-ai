"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
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

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance and ensure account balance never goes negative
    const currentBalance = account.balance.toNumber();
    if (data.type === "EXPENSE" && data.amount > currentBalance) {
      throw new Error(
        `Insufficient funds. Current account balance is ₹${currentBalance.toFixed(2)}, so this expense of ₹${data.amount.toFixed(2)} would make the account negative.`
      );
    }

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = currentBalance + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          date: new Date(data.date),
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/account/[id]", "page");
    revalidatePath(`/account/${transaction.accountId}`);
    revalidatePath("/goals");
    revalidatePath("/reports");
    revalidatePath("/future-spend");
    revalidatePath("/smart-budget");

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const transaction = await db.transaction.findFirst({
    where: {
      id,
      user: { clerkUserId: userId },
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      // Ensure target account balance never drops below zero
      if (originalTransaction.accountId === data.accountId) {
        const netBalanceChange = newBalanceChange - oldBalanceChange;
        const currentTargetAccount = await tx.account.findUnique({
          where: { id: data.accountId },
        });
        if (!currentTargetAccount) throw new Error("Account not found");

        const resultingBalance = currentTargetAccount.balance.toNumber() + netBalanceChange;
        if (resultingBalance < 0) {
          throw new Error(
            `Insufficient funds. Account balance (₹${currentTargetAccount.balance.toNumber().toFixed(2)}) cannot become negative.`
          );
        }

        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: netBalanceChange,
            },
          },
        });
      } else {
        const targetAccount = await tx.account.findUnique({
          where: { id: data.accountId },
        });
        if (!targetAccount) throw new Error("Target account not found");

        const resultingTargetBalance = targetAccount.balance.toNumber() + newBalanceChange;
        if (resultingTargetBalance < 0) {
          throw new Error(
            `Insufficient funds in target account (₹${targetAccount.balance.toNumber().toFixed(2)}). Balance cannot become negative.`
          );
        }

        const originalAccount = await tx.account.findUnique({
          where: { id: originalTransaction.accountId },
        });
        if (!originalAccount) throw new Error("Original account not found");

        const resultingOriginalBalance =
          originalAccount.balance.toNumber() - oldBalanceChange;
        if (resultingOriginalBalance < 0) {
          throw new Error(
            `Insufficient funds in original account "${originalAccount.name}" (₹${originalAccount.balance.toNumber().toFixed(2)}). Moving this transaction would make its balance negative.`
          );
        }

        // Revert from old account
        await tx.account.update({
          where: { id: originalTransaction.accountId },
          data: {
            balance: {
              decrement: oldBalanceChange,
            },
          },
        });
        // Apply to new account
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: newBalanceChange,
            },
          },
        });
      }

      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          date: new Date(data.date),
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/account/[id]", "page");
    revalidatePath(`/account/${data.accountId}`);
    if (originalTransaction.accountId !== data.accountId) {
      revalidatePath(`/account/${originalTransaction.accountId}`);
    }
    revalidatePath("/goals");
    revalidatePath("/reports");
    revalidatePath("/future-spend");
    revalidatePath("/smart-budget");
    revalidatePath("/", "layout");

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Serialize Decimal fields (amount and account.balance) for the client
    const serializedTransactions = transactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toNumber(),
      account: transaction.account
        ? {
          ...transaction.account,
          balance: transaction.account.balance.toNumber(),
        }
        : null,
    }));

    return { success: true, data: serializedTransactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt(file) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured in environment variables");
    }

    // gemini-2.5-flash is verified and supports JSON output
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let arrayBuffer;
    let mimeType = "image/jpeg";

    if (file instanceof FormData) {
      const uploadedFile = file.get("file");
      if (!uploadedFile) throw new Error("No file provided");
      arrayBuffer = await uploadedFile.arrayBuffer();
      if (uploadedFile.type) mimeType = uploadedFile.type;
    } else if (file && typeof file.arrayBuffer === "function") {
      arrayBuffer = await file.arrayBuffer();
      if (file.type) mimeType = file.type;
    } else {
      throw new Error("Invalid file format provided");
    }

    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const currentYear = today.getFullYear();

    const prompt = `
      Analyze this receipt image and extract the following expense information in JSON format:
      - Total amount (a positive number representing final charge)
      - Date (in ISO date string "YYYY-MM-DD". Receipts often come from test archives, samples, or previous years. If the receipt date is from before year ${currentYear}, older than 30 days from today, in the future, or unclear, you MUST use today's date: "${todayStr}")
      - Description or brief summary of purchased items
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense)
      
      Only respond with valid JSON in this exact structure:
      {
        "amount": number,
        "date": "YYYY-MM-DD",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If the image is not a receipt or details are completely unreadable, return an empty object {}.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not extract valid JSON from Gemini response");
      }
      data = JSON.parse(jsonMatch[0]);
    }

    if (!data || Object.keys(data).length === 0 || data.amount === undefined || isNaN(parseFloat(data.amount))) {
      throw new Error("Could not detect receipt details from image. Please ensure the receipt is clear or enter details manually.");
    }

    const validCategories = [
      "housing", "transportation", "groceries", "utilities",
      "entertainment", "food", "shopping", "healthcare",
      "education", "personal", "travel", "insurance",
      "gifts", "bills", "other-expense"
    ];

    let category = "other-expense";
    if (data.category) {
      const matched = validCategories.find(
        (c) => c.toLowerCase() === data.category.toLowerCase()
      );
      if (matched) {
        category = matched;
      }
    }

    let parsedDate = new Date();
    if (data.date) {
      const d = new Date(data.date);
      if (!isNaN(d.getTime())) {
        const diffDays = Math.abs((today.getTime() - d.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 45 && d.getFullYear() === currentYear) {
          parsedDate = d;
        } else {
          // If the receipt has a historical year (e.g. 2003, 2024 sample), record as current date
          parsedDate = today;
        }
      }
    }

    const merchantName = (data.merchantName || "").trim();
    const description = (data.description || "").trim() || (merchantName ? `Purchase at ${merchantName}` : "Receipt expense");

    return {
      amount: Math.abs(parseFloat(data.amount)) || 0,
      date: parsedDate,
      description,
      category,
      merchantName,
    };
  } catch (error) {
    console.error("Error scanning receipt:", error);
    let msg = error.message || "Failed to scan receipt";
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
      msg = "Gemini API key is invalid. Please update GEMINI_API_KEY with a valid Google AI Studio key in .env.";
    }
    throw new Error(msg);
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
