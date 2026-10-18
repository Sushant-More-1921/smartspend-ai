import assert from "node:assert";
import { generateFutureSpendForecast, parseScenarioPrompt } from "../lib/future-spend-engine.js";

function runRegressionSuite() {
  console.log("Starting Future Spend Regression Test Suite...\n");

  // TEST 1: Income and Failed Transactions are completely ignored
  {
    const mockTxs = [
      { id: "1", type: "INCOME", status: "COMPLETED", amount: "50000", date: "2026-10-10", category: "salary" },
      { id: "2", type: "EXPENSE", status: "FAILED", amount: "10000", date: "2026-10-12", category: "shopping" },
      { id: "3", type: "EXPENSE", status: "PENDING", amount: "5000", date: "2026-10-14", category: "travel" },
      { id: "4", type: "EXPENSE", status: "COMPLETED", amount: "4000", date: "2026-10-15", category: "groceries" },
    ];

    const forecast = generateFutureSpendForecast({
      transactions: mockTxs,
      budgetAmount: 20000,
      prompt: "How does my spending look?",
      referenceDate: new Date("2026-10-18T00:00:00Z")
    });

    assert.strictEqual(forecast.spentThisMonth, 4000, "Only COMPLETED EXPENSE should be counted");
    assert.strictEqual(forecast.remaining, 16000, "Remaining must be 20000 - 4000 = 16000");
    console.log("✓ Test 1 Passed: Income, Failed, and Pending transactions are strictly excluded.");
  }

  // TEST 2: Brand new user with zero transactions
  {
    const forecast = generateFutureSpendForecast({
      transactions: [],
      budgetAmount: 30000,
      prompt: "How much will I spend next month?",
      referenceDate: new Date("2026-10-18T00:00:00Z")
    });

    assert.strictEqual(forecast.spentThisMonth, 0, "Current spend must be 0 for new user");
    assert.strictEqual(forecast.remaining, 30000, "Remaining must equal budget");
    assert.strictEqual(forecast.monthlyProjection.length, 4, "Must output exactly 4 months projection");
    assert.strictEqual(forecast.dataSufficiency, "SPARSE", "Data sufficiency must be SPARSE");
    console.log("✓ Test 2 Passed: Brand new user handled gracefully with honest SPARSE confidence.");
  }

  // TEST 3: Zero Budget Handling
  {
    const forecast = generateFutureSpendForecast({
      transactions: [{ type: "EXPENSE", status: "COMPLETED", amount: "5000", date: "2026-10-05", category: "food" }],
      budgetAmount: 0,
      prompt: "Can I afford dinner for 1500?",
      referenceDate: new Date("2026-10-18T00:00:00Z")
    });

    assert.strictEqual(forecast.budget, 0, "Budget must be 0");
    assert.strictEqual(forecast.remaining, 0, "Remaining must be 0 when budget is 0");
    assert.strictEqual(forecast.spentThisMonth, 6500, "Spent must be 5000 + 1500 = 6500");
    assert.strictEqual(forecast.isOverBudget, false, "Cannot be over budget if budget is 0");
    console.log("✓ Test 3 Passed: Zero budget handled safely without division by zero or NaN.");
  }

  // TEST 4: Over Budget Alert triggering
  {
    const forecast = generateFutureSpendForecast({
      transactions: [{ type: "EXPENSE", status: "COMPLETED", amount: "15000", date: "2026-10-05", category: "food" }],
      budgetAmount: 20000,
      prompt: "What if I buy a phone for 30000 this month?",
      referenceDate: new Date("2026-10-18T00:00:00Z")
    });

    assert.strictEqual(forecast.spentThisMonth, 45000, "15000 + 30000 = 45000");
    assert.strictEqual(forecast.remaining, 0, "Remaining must be 0 when over budget");
    assert.strictEqual(forecast.isOverBudget, true, "isOverBudget must be true");
    assert.strictEqual(forecast.budgetDeficit, 25000, "Deficit must be 45000 - 20000 = 25000");
    assert(forecast.summary.some(s => s.includes("Budget Alert")), "Must include Budget Alert in summary");
    console.log("✓ Test 4 Passed: Over-budget detection and deficit calculation verified.");
  }

  // TEST 5: Next Month Offset
  {
    const forecast = generateFutureSpendForecast({
      transactions: [{ type: "EXPENSE", status: "COMPLETED", amount: "10000", date: "2026-10-05", category: "housing" }],
      budgetAmount: 25000,
      prompt: "What if I buy a laptop for 50000 next month?",
      referenceDate: new Date("2026-10-18T00:00:00Z")
    });

    assert.strictEqual(forecast.spentThisMonth, 10000, "Current month spend should NOT include next month laptop");
    const nextMonthVal = forecast.monthlyProjection[0].value;
    const month2Val = forecast.monthlyProjection[1].value;
    assert.strictEqual(nextMonthVal - month2Val, 50000, "Next month must reflect exactly +50,000 scenario increase");
    console.log("✓ Test 5 Passed: Multi-month projection correctly shifts scenario impact to target month.");
  }

  // TEST 6: Scenario prompt parsing variety
  {
    const p1 = parseScenarioPrompt("Trip to Goa for 4 days");
    assert.strictEqual(p1.amount, 12000, "4 days * 3000 = 12000");
    assert.strictEqual(p1.category, "travel");

    const p2 = parseScenarioPrompt("Down payment of 2.5 lakh for car");
    assert.strictEqual(p2.amount, 250000, "2.5 lakh = 250000");

    const p3 = parseScenarioPrompt("Spend 25k on shopping next month");
    assert.strictEqual(p3.amount, 25000, "25k = 25000");
    assert.strictEqual(p3.targetMonthOffset, 1, "next month offset must be 1");

    console.log("✓ Test 6 Passed: Scenario prompt NLP parsing accurate across diverse expressions.");
  }

  console.log("\nALL 6 REGRESSION TESTS PASSED SUCCESSFULLY! 🚀");
}

runRegressionSuite();
