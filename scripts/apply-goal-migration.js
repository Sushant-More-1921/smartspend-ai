const { db } = require("../lib/prisma");

async function runMigration() {
  console.log("Starting Financial Goals migration...");

  try {
    // 1. Create Enums if not exist
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("Enum GoalStatus verified.");

    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "GoalContributionType" AS ENUM ('CONTRIBUTION', 'WITHDRAWAL', 'REFUND');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("Enum GoalContributionType verified.");

    // 2. Create financial_goals table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "financial_goals" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT,
        "targetAmount" DECIMAL(12,2) NOT NULL,
        "savedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "targetDate" TIMESTAMP(3),
        "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
        "icon" TEXT,
        "expectedReturnRate" DECIMAL(5,2) DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "financial_goals_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "financial_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("Table financial_goals verified.");

    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "financial_goals_userId_idx" ON "financial_goals"("userId");
    `);

    // 3. Create goal_contributions table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "goal_contributions" (
        "id" TEXT NOT NULL,
        "goalId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "sourceAccountId" TEXT,
        "amount" DECIMAL(12,2) NOT NULL,
        "transactionType" "GoalContributionType" NOT NULL DEFAULT 'CONTRIBUTION',
        "note" TEXT,
        "reference" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "goal_contributions_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "goal_contributions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "financial_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "goal_contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "goal_contributions_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    console.log("Table goal_contributions verified.");

    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "goal_contributions_goalId_idx" ON "goal_contributions"("goalId");
    `);
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "goal_contributions_userId_idx" ON "goal_contributions"("userId");
    `);
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "goal_contributions_sourceAccountId_idx" ON "goal_contributions"("sourceAccountId");
    `);

    console.log("Financial Goals migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
