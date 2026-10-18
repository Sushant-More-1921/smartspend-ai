import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.findFirst({
    where: { name: "Sushant More" },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!account) {
    console.log("Account not found");
    return;
  }

  console.log(`Account ID: ${account.id}, Name: ${account.name}, Balance: ${account.balance}`);
  console.log(`Total transactions in DB for this account: ${account.transactions.length}`);

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of account.transactions) {
    const amt = Number(t.amount);
    if (t.type === "INCOME") totalIncome += amt;
    else totalExpense += amt;
  }

  console.log(`DB Total Income: ₹${totalIncome}`);
  console.log(`DB Total Expense: ₹${totalExpense}`);
  console.log(`DB Net: ₹${totalIncome - totalExpense}`);

  console.log("\nLast 5 transactions:");
  for (const t of account.transactions.slice(0, 5)) {
    console.log(`  - ${t.date.toISOString().slice(0, 10)} | Created: ${t.createdAt.toISOString()} | ${t.type} | ₹${t.amount} | ${t.category} | ${t.description}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
