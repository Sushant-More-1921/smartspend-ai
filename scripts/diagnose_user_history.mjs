import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "moresushant600@gmail.com" },
    include: { budgets: true }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const txs = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" }
  });

  console.log(`Total transactions for ${user.email}: ${txs.length}`);
  console.log("Budget:", user.budgets[0]?.amount);

  const expenses = txs.filter(t => t.type === "EXPENSE" && t.status === "COMPLETED");
  console.log(`Total completed expenses: ${expenses.length}`);

  // Monthly breakdown
  const monthly = {};
  for (const t of expenses) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly[key]) {
      monthly[key] = { total: 0, count: 0, categories: {} };
    }
    const amt = Number(t.amount);
    monthly[key].total += amt;
    monthly[key].count += 1;
    monthly[key].categories[t.category] = (monthly[key].categories[t.category] || 0) + amt;
  }

  console.log("\nMonthly Expense Aggregation:");
  console.table(
    Object.entries(monthly).map(([month, data]) => ({
      month,
      totalSpent: Math.round(data.total * 100) / 100,
      txCount: data.count,
      topCategories: Object.entries(data.categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([c, a]) => `${c}: ₹${Math.round(a)}`)
        .join(", ")
    }))
  );
}

main().catch(console.error).finally(() => prisma.$disconnect());
