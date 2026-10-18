import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const txs = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { account: true, user: true }
  });

  console.log("=== NEWEST 10 TRANSACTIONS IN DB BY CREATED_AT ===");
  for (const t of txs) {
    console.log({
      id: t.id,
      description: t.description,
      amount: t.amount.toString(),
      type: t.type,
      category: t.category,
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
      accountName: t.account?.name,
      accountId: t.accountId,
      accountBalance: t.account?.balance.toString(),
      userEmail: t.user?.email
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
