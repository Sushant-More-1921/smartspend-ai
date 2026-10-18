import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      budgets: true,
      _count: { select: { transactions: true } }
    }
  });

  console.log("Users in DB:", users.length);
  for (const u of users) {
    console.log(`User ${u.id} (${u.email}): ${u._count.transactions} transactions, budget:`, u.budgets);
    const txs = await prisma.transaction.findMany({
      where: { userId: u.id },
      orderBy: { date: "desc" },
      take: 20
    });
    console.log(`Recent transactions for ${u.email}:`);
    for (const t of txs) {
      console.log(`  - ${t.date.toISOString().slice(0, 10)} | ${t.type} | ₹${t.amount} | ${t.category} | ${t.description} | ${t.status}`);
    }

    const typeCounts = await prisma.transaction.groupBy({
      by: ['type', 'status'],
      where: { userId: u.id },
      _count: true,
      _sum: { amount: true }
    });
    console.log("Transaction breakdown:", JSON.stringify(typeCounts, null, 2));

    // Also check date distribution
    const allTxs = await prisma.transaction.findMany({
      where: { userId: u.id, type: "EXPENSE", status: "COMPLETED" },
      select: { date: true, amount: true, category: true },
      orderBy: { date: "asc" }
    });

    const monthMap = {};
    for (const t of allTxs) {
      const m = t.date.toISOString().slice(0, 7);
      monthMap[m] = (monthMap[m] || 0) + Number(t.amount);
    }
    console.log("Monthly completed expenses by calendar month:", monthMap);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
