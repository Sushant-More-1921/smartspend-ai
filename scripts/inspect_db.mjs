import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const txs = await prisma.transaction.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 12,
    select: {
      id: true,
      description: true,
      amount: true,
      date: true,
      createdAt: true,
      type: true,
      category: true,
    },
  });

  console.log("Top 12 transactions in DB (ordered by date desc, createdAt desc):");
  for (const t of txs) {
    console.log(`${t.date.toISOString()} | created: ${t.createdAt?.toISOString()} | ₹${t.amount} | ${t.category} | ${t.description}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
