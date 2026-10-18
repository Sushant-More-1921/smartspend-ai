import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function parseScenarioPrompt(prompt) {
  const p = (prompt || "").toLowerCase();
  
  let extractedAmount = null;

  // 1. Lakhs
  const lakhMatch = p.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs)/i);
  if (lakhMatch) {
    extractedAmount = parseFloat(lakhMatch[1]) * 100000;
  }

  // 2. K format
  if (!extractedAmount) {
    const kMatch = p.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      extractedAmount = parseFloat(kMatch[1]) * 1000;
    }
  }

  // 3. Direct currency match
  if (!extractedAmount) {
    const directMatch = p.match(/(?:₹|rs\.?|inr|cost(?:ing)?|spend(?:ing)?|worth)\s*[:=]?\s*(\d[\d,]*(?:\.\d+)?)/i);
    if (directMatch) {
      const cleaned = directMatch[1].replace(/,/g, "");
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val > 0) {
        extractedAmount = val;
      }
    }
  }

  // 4. "for <amount>" but not "for 5 days"
  if (!extractedAmount) {
    const forMatch = p.match(/\bfor\s+(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)(?!\s*(?:days?|hours?|hrs?|weeks?|months?|years?|am|pm))/i);
    if (forMatch) {
      const cleaned = forMatch[1].replace(/,/g, "");
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val >= 50) {
        extractedAmount = val;
      }
    }
  }

  // Activity / Category extraction
  let category = "other-expense";
  let defaultEst = 0;
  let activity = "Planned Expense";

  if (p.includes("trip") || p.includes("tour") || p.includes("goa") || p.includes("vacation") || p.includes("flight") || p.includes("travel")) {
    category = "travel";
    activity = "Vacation / Travel";
    const daysMatch = p.match(/(\d+)\s*days?/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 3;
    defaultEst = days * 3000;
  } else if (p.includes("iphone") || p.includes("phone") || p.includes("laptop") || p.includes("macbook") || p.includes("ipad")) {
    category = "shopping";
    activity = "Electronics / Device";
    defaultEst = p.includes("laptop") || p.includes("macbook") ? 55000 : 45000;
  } else if (p.includes("shopping") || p.includes("clothes") || p.includes("dress") || p.includes("watch")) {
    category = "shopping";
    activity = "Shopping";
    defaultEst = 5000;
  } else if (p.includes("party") || p.includes("dinner") || p.includes("club") || p.includes("drinks") || p.includes("restaurant")) {
    category = "food";
    activity = "Dining / Party";
    defaultEst = 3500;
  } else if (p.includes("hospital") || p.includes("medical") || p.includes("surgery") || p.includes("doctor")) {
    category = "healthcare";
    activity = "Medical Expense";
    defaultEst = 8000;
  }

  const finalAmount = extractedAmount !== null ? extractedAmount : (defaultEst > 0 ? defaultEst : 0);
  const isEstimated = extractedAmount === null && defaultEst > 0;

  let targetMonthOffset = 0;
  if (p.includes("next month") || p.includes("following month") || p.includes("upcoming month")) {
    targetMonthOffset = 1;
  }

  return {
    activity,
    category,
    amount: finalAmount,
    isEstimated,
    hasScenario: finalAmount > 0,
    targetMonthOffset
  };
}

export function generateFutureSpendForecast({ transactions, budgetAmount, prompt, referenceDate = new Date() }) {
  const totalBudget = Number(budgetAmount || 0);

  // 1. Filter valid completed expenses
  const expenses = (transactions || []).filter(
    (t) => t.type === "EXPENSE" && t.status === "COMPLETED" && Number(t.amount) > 0
  );

  const totalSpentAllTime = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // 2. Identify current month transactions & run rate
  const now = new Date(referenceDate);
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const currentMonthKey = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, "0")}`;
  const currentMonthName = MONTH_NAMES[currentMonthIdx];

  const totalDaysInCurrentMonth = daysInMonth(currentYear, currentMonthIdx);
  const elapsedDays = Math.max(1, now.getDate());

  let currentMonthSpent = 0;
  const historicalMonthlyMap = new Map();
  const categoryTotals = new Map();

  for (const t of expenses) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const amt = Number(t.amount);

    // Track category totals
    const cat = t.category || "other-expense";
    categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + amt);

    if (key === currentMonthKey) {
      currentMonthSpent += amt;
    } else {
      historicalMonthlyMap.set(key, (historicalMonthlyMap.get(key) || 0) + amt);
    }
  }

  // Calculate current month projected run-rate
  const dailyRunRate = currentMonthSpent / elapsedDays;
  const projectedCurrentMonthEnd = Math.round(dailyRunRate * totalDaysInCurrentMonth);

  // Sort historical complete active months
  const historicalMonths = Array.from(historicalMonthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]));

  // 3. Compute baseline monthly spend
  let baselineSpend = 0;
  let dataSufficiency = "SPARSE";

  if (historicalMonths.length >= 3) {
    // Recency-weighted moving average of last 3 complete months
    const last3 = historicalMonths.slice(-3);
    const weights = [1, 2, 3];
    let wSum = 0;
    let totalW = 0;
    for (let i = 0; i < last3.length; i++) {
      wSum += last3[i][1] * weights[i];
      totalW += weights[i];
    }
    baselineSpend = wSum / totalW;
    dataSufficiency = historicalMonths.length >= 6 ? "HIGH" : "MODERATE";
  } else if (historicalMonths.length > 0) {
    // Average of available months
    const sum = historicalMonths.reduce((acc, curr) => acc + curr[1], 0);
    baselineSpend = sum / historicalMonths.length;
    dataSufficiency = "MODERATE";
  } else {
    // Sparse: blend run-rate and budget
    baselineSpend = projectedCurrentMonthEnd > 0 ? projectedCurrentMonthEnd : (totalBudget > 0 ? totalBudget * 0.75 : 10000);
    dataSufficiency = "SPARSE";
  }

  // Smooth baseline with current run rate if current month has substantial progress (> 10 days)
  if (elapsedDays >= 10 && projectedCurrentMonthEnd > 0) {
    baselineSpend = Math.round(0.7 * baselineSpend + 0.3 * projectedCurrentMonthEnd);
  } else {
    baselineSpend = Math.round(baselineSpend);
  }

  // 4. Parse what-if scenario
  const scenario = parseScenarioPrompt(prompt);

  // 5. Build dynamic 4-Month Projection
  const monthlyProjection = [];
  const next4Months = [];

  for (let i = 1; i <= 4; i++) {
    const targetDate = new Date(currentYear, currentMonthIdx + i, 1);
    const targetMonthName = MONTH_NAMES[targetDate.getMonth()];
    const targetKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
    next4Months.push({ name: targetMonthName, key: targetKey, offset: i });

    let projectedVal = baselineSpend;

    // If scenario applies to this future month (e.g., targetMonthOffset === 1 matches offset 1)
    if (scenario.hasScenario && scenario.targetMonthOffset === i) {
      projectedVal += scenario.amount;
    }

    monthlyProjection.push({
      month: targetMonthName,
      value: Math.max(0, Math.round(projectedVal))
    });
  }

  // 6. Calculate displayed spend and remaining for the overview cards
  // If scenario applies to current month (offset 0), add to current month's projected spend
  let displayedSpend = currentMonthSpent;
  if (scenario.hasScenario && scenario.targetMonthOffset === 0) {
    displayedSpend = currentMonthSpent + scenario.amount;
  }

  const remaining = Math.max(0, totalBudget - displayedSpend);
  const isOverBudget = displayedSpend > totalBudget && totalBudget > 0;
  const budgetDeficit = isOverBudget ? displayedSpend - totalBudget : 0;

  // 7. Find top historical category
  const sortedCategories = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);
  const topCategoryName = sortedCategories.length > 0 ? sortedCategories[0][0] : "general";
  const topCategorySpend = sortedCategories.length > 0 ? Math.round(sortedCategories[0][1]) : 0;

  // 8. Generate Clear, Honest Key Insights
  const summary = [];

  // Insight 1: Current month run rate
  summary.push(
    `You have spent ₹${currentMonthSpent.toLocaleString("en-IN")} so far in ${currentMonthName} (Day ${elapsedDays} of ${totalDaysInCurrentMonth}). At this pace, your projected baseline for the month is ₹${projectedCurrentMonthEnd.toLocaleString("en-IN")}.`
  );

  // Insight 2: Scenario impact
  if (scenario.hasScenario) {
    const estNote = scenario.isEstimated ? " (estimated based on typical costs)" : "";
    const targetLabel = scenario.targetMonthOffset === 0 ? "this month's" : `next month's (${next4Months[0].name})`;
    summary.push(
      `Your planned ${scenario.activity} of ₹${scenario.amount.toLocaleString("en-IN")}${estNote} will be added to ${targetLabel} spending.`
    );
  } else {
    summary.push(
      `Your baseline monthly spending forecast is calculated at ₹${baselineSpend.toLocaleString("en-IN")}/month based on ${historicalMonths.length} complete historical periods (${dataSufficiency} confidence).`
    );
  }

  // Insight 3: Budget impact
  if (totalBudget > 0) {
    if (isOverBudget) {
      summary.push(
        `⚠️ Budget Alert: This brings your total spending to ₹${displayedSpend.toLocaleString("en-IN")}, exceeding your monthly budget of ₹${totalBudget.toLocaleString("en-IN")} by ₹${budgetDeficit.toLocaleString("en-IN")}.`
      );
    } else {
      const bufferPct = totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0;
      summary.push(
        `Within Budget: You will have ₹${remaining.toLocaleString("en-IN")} remaining (${bufferPct}% buffer) out of your ₹${totalBudget.toLocaleString("en-IN")} monthly budget.`
      );
    }
  } else {
    summary.push(
      `No active budget set. Set a monthly budget in the dashboard to unlock automated overspending alerts.`
    );
  }

  // Insight 4: 4-Month projection summary
  const avg4Month = Math.round(monthlyProjection.reduce((s, m) => s + m.value, 0) / 4);
  const firstMonthName = monthlyProjection[0].month;
  const lastMonthName = monthlyProjection[3].month;
  summary.push(
    `4-Month Forecast: Average projected spending from ${firstMonthName} to ${lastMonthName} is ₹${avg4Month.toLocaleString("en-IN")}/month.`
  );

  // Insight 5: Actionable recommendation based on top category
  summary.push(
    `Optimization Tip: Your highest expense category is ${topCategoryName} (₹${topCategorySpend.toLocaleString("en-IN")} total). Trimming non-essential ${topCategoryName} purchases can preserve extra savings.`
  );

  return {
    summary,
    budget: totalBudget,
    spentThisMonth: displayedSpend,
    remaining,
    monthlyProjection,
    dataSufficiency,
    baselineSpend,
    isOverBudget,
    budgetDeficit
  };
}

// Test with our real user data
async function runTest() {
  const user = await prisma.user.findFirst({
    where: { email: "moresushant600@gmail.com" },
    include: { budgets: true }
  });

  const txs = await prisma.transaction.findMany({
    where: { userId: user.id }
  });

  const budget = user.budgets[0]?.amount || 0;

  console.log("=== TEST 1: Goa trip scenario ===");
  const res1 = generateFutureSpendForecast({
    transactions: txs,
    budgetAmount: budget,
    prompt: "If I go on a trip to Goa for 5 days, how will it affect my budget this month?",
    referenceDate: new Date("2026-10-18T10:00:00Z")
  });
  console.log("Budget:", res1.budget, "Spent:", res1.spentThisMonth, "Remaining:", res1.remaining);
  console.log("Projection:", res1.monthlyProjection);
  console.log("Summary:", res1.summary);

  console.log("\n=== TEST 2: General question without scenario ===");
  const res2 = generateFutureSpendForecast({
    transactions: txs,
    budgetAmount: budget,
    prompt: "How does my recent spending affect my budget?",
    referenceDate: new Date("2026-10-18T10:00:00Z")
  });
  console.log("Budget:", res2.budget, "Spent:", res2.spentThisMonth, "Remaining:", res2.remaining);
  console.log("Projection:", res2.monthlyProjection);
  console.log("Summary:", res2.summary);

  console.log("\n=== TEST 3: Over-budget scenario (Buy car for 1.5 lakh) ===");
  const res3 = generateFutureSpendForecast({
    transactions: txs,
    budgetAmount: budget,
    prompt: "What if I buy a car with down payment of 1.5 lakh this month?",
    referenceDate: new Date("2026-10-18T10:00:00Z")
  });
  console.log("Budget:", res3.budget, "Spent:", res3.spentThisMonth, "Remaining:", res3.remaining);
  console.log("Over Budget?:", res3.isOverBudget, "Deficit:", res3.budgetDeficit);
  console.log("Summary:", res3.summary);

  console.log("\n=== TEST 4: Next month scenario (buy laptop for 65000 next month) ===");
  const res4 = generateFutureSpendForecast({
    transactions: txs,
    budgetAmount: budget,
    prompt: "What if I buy a laptop for 65000 next month?",
    referenceDate: new Date("2026-10-18T10:00:00Z")
  });
  console.log("Projection:", res4.monthlyProjection);
  console.log("Summary:", res4.summary);

  console.log("\n=== TEST 5: Brand new user (0 transactions) ===");
  const res5 = generateFutureSpendForecast({
    transactions: [],
    budgetAmount: 50000,
    prompt: "How much will I spend next month?",
    referenceDate: new Date("2026-10-18T10:00:00Z")
  });
  console.log("Projection:", res5.monthlyProjection);
  console.log("Summary:", res5.summary);

  console.log("\n=== TEST 6: Brand new user with 0 budget and 0 transactions ===");
  const res6 = generateFutureSpendForecast({
    transactions: [],
    budgetAmount: 0,
    prompt: "Can I afford dinner for 2000?",
    referenceDate: new Date("2026-10-18T10:00:00Z")
  });
  console.log("Budget:", res6.budget, "Spent:", res6.spentThisMonth, "Remaining:", res6.remaining);
  console.log("Summary:", res6.summary);
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
