const { db } = require("../lib/prisma");
const {
  calculateRequiredMonthlyContribution,
  simulateWhatIfScenario,
  calculateRemainingTime,
} = require("../lib/financial-planner");

async function runTests() {
  console.log("=================================================");
  console.log("   SMARTSPEND AI FINANCIAL GOALS TEST SUITE      ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // ----------------------------------------------------------------
  // PART 1: DETERMINISTIC FINANCIAL MATHEMATICS & FORMULAS
  // ----------------------------------------------------------------
  console.log("--- 1. Financial Math & Planner Tests ---");

  // Prompt example: Target ₹1,20,000, Saved ₹30,000, 9 months => ₹10,000/mo
  const targetDate9Mo = new Date();
  targetDate9Mo.setMonth(targetDate9Mo.getMonth() + 9);

  const ex1 = calculateRequiredMonthlyContribution({
    targetAmount: 120000,
    savedAmount: 30000,
    targetDate: targetDate9Mo,
    expectedReturnRate: 0,
  });

  assert(
    ex1.remainingAmount === 90000,
    "Remaining amount calculation: 120,000 - 30,000 = 90,000"
  );
  assert(
    ex1.monthsRemaining === 9,
    "Months remaining calculation: 9 contribution periods"
  );
  assert(
    ex1.requiredMonthly === 10000,
    "Required monthly savings exact match: ₹10,000"
  );

  // Completed goal test
  const exCompleted = calculateRequiredMonthlyContribution({
    targetAmount: 50000,
    savedAmount: 50000,
    targetDate: targetDate9Mo,
  });
  assert(
    exCompleted.status === "COMPLETED" && exCompleted.requiredMonthly === 0,
    "Completed goal requires ₹0 additional monthly contributions"
  );

  // Past target date test
  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - 2);
  const exOverdue = calculateRequiredMonthlyContribution({
    targetAmount: 50000,
    savedAmount: 20000,
    targetDate: pastDate,
  });
  assert(
    exOverdue.status === "OVERDUE" && exOverdue.daysRemaining === 0,
    "Past target date correctly flagged as OVERDUE"
  );

  // Investment projection test (12% annual = 1% monthly compounding)
  const exInvest = calculateRequiredMonthlyContribution({
    targetAmount: 120000,
    savedAmount: 30000,
    targetDate: targetDate9Mo,
    expectedReturnRate: 12,
  });
  assert(
    exInvest.investmentProjection !== null,
    "Investment projection generated with 12% annual rate"
  );
  assert(
    exInvest.investmentProjection.requiredMonthlyWithReturns < ex1.requiredMonthly,
    "Investment required monthly is lower than pure cash savings due to compounding"
  );

  // What-if simulator test (Read-only simulation)
  const sim1 = simulateWhatIfScenario({
    targetAmount: 120000,
    currentSaved: 30000,
    simulatedMonthly: 10000,
    simulatedMonths: 9,
    expectedReturnRate: 0,
  });
  assert(
    sim1.projectedAccumulation === 120000 && sim1.isTargetAchieved,
    "What-if simulator projects exact ₹120,000 at ₹10,000/mo over 9 months"
  );

  const simUnderfunded = simulateWhatIfScenario({
    targetAmount: 120000,
    currentSaved: 30000,
    simulatedMonthly: 5000,
    simulatedMonths: 9,
    expectedReturnRate: 0,
  });
  assert(
    !simUnderfunded.isTargetAchieved &&
      simUnderfunded.surplusOrShortfall === -45000 &&
      simUnderfunded.additionalMonthlyNeeded === 5000,
    "What-if simulator detects shortfall of ₹45,000 and calculates additional ₹5,000/mo needed"
  );

  // ----------------------------------------------------------------
  // PART 2: DATABASE ACCOUNTING, TRANSACTIONS & PERSISTENCE
  // ----------------------------------------------------------------
  console.log("\n--- 2. Database Accounting & Transaction Integrity Tests ---");

  try {
    // Find or create test user
    let user = await db.user.findFirst({
      include: { accounts: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          clerkUserId: `test_user_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          name: "Test User",
        },
        include: { accounts: true },
      });
    }

    // Ensure test account with balance
    let testAccount = user.accounts[0];
    if (!testAccount) {
      testAccount = await db.account.create({
        data: {
          userId: user.id,
          name: "Test Savings Account",
          type: "SAVINGS",
          balance: 50000.0,
          isDefault: true,
        },
      });
    } else {
      // Set a known balance
      await db.account.update({
        where: { id: testAccount.id },
        data: { balance: 50000.0 },
      });
    }

    const startBalance = 50000.0;

    // Test A: Create goal with initial contribution
    const initialContribution = 5000.0;
    const targetAmt = 25000.0;

    const goal = await db.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: testAccount.id },
        data: { balance: { decrement: initialContribution } },
      });

      const newGoal = await tx.financialGoal.create({
        data: {
          userId: user.id,
          name: "Test Emergency Fund",
          category: "Emergency Fund",
          targetAmount: targetAmt,
          savedAmount: initialContribution,
          status: "IN_PROGRESS",
          icon: "Shield",
        },
      });

      await tx.goalContribution.create({
        data: {
          goalId: newGoal.id,
          userId: user.id,
          sourceAccountId: testAccount.id,
          amount: initialContribution,
          transactionType: "CONTRIBUTION",
          note: "Initial contribution",
          reference: `INIT-TEST-${Date.now()}`,
        },
      });

      return newGoal;
    });

    // Check account balance after creation
    const accAfterCreate = await db.account.findUnique({
      where: { id: testAccount.id },
    });
    assert(
      accAfterCreate.balance.toNumber() === startBalance - initialContribution,
      `Account balance after ₹${initialContribution} initial contribution = ₹${startBalance - initialContribution}`
    );

    // Test B: Add money contribution
    const addAmount = 7500.5;
    await db.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: testAccount.id },
        data: { balance: { decrement: addAmount } },
      });

      await tx.financialGoal.update({
        where: { id: goal.id },
        data: {
          savedAmount: { increment: addAmount },
          status: "IN_PROGRESS",
        },
      });

      await tx.goalContribution.create({
        data: {
          goalId: goal.id,
          userId: user.id,
          sourceAccountId: testAccount.id,
          amount: addAmount,
          transactionType: "CONTRIBUTION",
          note: "Monthly savings addition",
          reference: `ADD-TEST-${Date.now()}`,
        },
      });
    });

    const accAfterAdd = await db.account.findUnique({
      where: { id: testAccount.id },
    });
    const goalAfterAdd = await db.financialGoal.findUnique({
      where: { id: goal.id },
    });

    assert(
      goalAfterAdd.savedAmount.toNumber() === initialContribution + addAmount,
      `Goal savedAmount correctly increased to ₹${initialContribution + addAmount}`
    );
    assert(
      accAfterAdd.balance.toNumber() ===
        startBalance - initialContribution - addAmount,
      `Account balance correctly decreased to ₹${startBalance - initialContribution - addAmount}`
    );

    // Test C: Audit history verification
    const contributions = await db.goalContribution.findMany({
      where: { goalId: goal.id },
      orderBy: { createdAt: "asc" },
    });
    assert(
      contributions.length === 2,
      `Audit trail accurately contains 2 contribution records`
    );
    assert(
      contributions[0].amount.toNumber() === initialContribution &&
        contributions[1].amount.toNumber() === addAmount,
      `Exact decimal amounts preserved without floating point corruption`
    );

    // Test D: Release / Refund funds back to account
    const refundAmount = 3000.0;
    await db.$transaction(async (tx) => {
      await tx.financialGoal.update({
        where: { id: goal.id },
        data: { savedAmount: { decrement: refundAmount } },
      });

      await tx.account.update({
        where: { id: testAccount.id },
        data: { balance: { increment: refundAmount } },
      });

      await tx.goalContribution.create({
        data: {
          goalId: goal.id,
          userId: user.id,
          sourceAccountId: testAccount.id,
          amount: refundAmount,
          transactionType: "REFUND",
          note: "Partial fund release",
          reference: `REF-TEST-${Date.now()}`,
        },
      });
    });

    const goalAfterRefund = await db.financialGoal.findUnique({
      where: { id: goal.id },
    });
    const accAfterRefund = await db.account.findUnique({
      where: { id: testAccount.id },
    });

    assert(
      goalAfterRefund.savedAmount.toNumber() ===
        initialContribution + addAmount - refundAmount,
      `Goal savedAmount correctly reduced after release to ₹${
        initialContribution + addAmount - refundAmount
      }`
    );
    assert(
      accAfterRefund.balance.toNumber() ===
        accAfterAdd.balance.toNumber() + refundAmount,
      `Account balance correctly restored after fund release`
    );

    // Test E: Status transitions (Completion)
    const remainingToComplete =
      targetAmt - goalAfterRefund.savedAmount.toNumber();
    await db.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: testAccount.id },
        data: { balance: { decrement: remainingToComplete } },
      });
      await tx.financialGoal.update({
        where: { id: goal.id },
        data: {
          savedAmount: { increment: remainingToComplete },
          status: "COMPLETED",
        },
      });
    });

    const completedGoal = await db.financialGoal.findUnique({
      where: { id: goal.id },
    });
    assert(
      completedGoal.status === "COMPLETED" &&
        completedGoal.savedAmount.toNumber() === targetAmt,
      "Goal transitions to COMPLETED status when target reached"
    );

    // Test F: Safe Deletion with Refund
    const savedBeforeDelete = completedGoal.savedAmount.toNumber();
    const balanceBeforeDelete = (
      await db.account.findUnique({ where: { id: testAccount.id } })
    ).balance.toNumber();

    await db.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: testAccount.id },
        data: { balance: { increment: savedBeforeDelete } },
      });
      await tx.financialGoal.delete({
        where: { id: goal.id },
      });
    });

    const balanceAfterDelete = (
      await db.account.findUnique({ where: { id: testAccount.id } })
    ).balance.toNumber();
    assert(
      balanceAfterDelete === balanceBeforeDelete + savedBeforeDelete,
      "Deleting goal with refund restores full balance without discrepancy"
    );

    const deletedGoal = await db.financialGoal.findUnique({
      where: { id: goal.id },
    });
    assert(deletedGoal === null, "Goal deleted cleanly from database");
  } catch (err) {
    console.error("Database test error:", err);
    failed++;
  }

  // ----------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
