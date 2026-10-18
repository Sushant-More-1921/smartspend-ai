import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const allTxs = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  });

  console.log(`Total transactions in DB across all users: ${await prisma.transaction.count()}`);
  console.log("Most recent 5 transactions across DB:");
  for (const t of allTxs.slice(0, 5)) {
    console.log(`  id=${t.id} | createdAt=${t.createdAt.toISOString()} | date=${t.date.toISOString()} | amt=${t.amount} | desc=${t.description} | acct=${t.accountId} | user=${t.userId}`);
  }

  const accounts = await prisma.account.findMany();
  console.log("All accounts in DB:", accounts.map(a => ({ id: a.id, name: a.name, balance: a.balance.toString(), isDefault: a.isDefault, userId: a.userId })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
