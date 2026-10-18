import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function calculateMAE(actuals, predictions) {
  let sumErr = 0;
  let count = 0;
  for (let i = 0; i < actuals.length; i++) {
    if (predictions[i] !== undefined && !isNaN(predictions[i])) {
      sumErr += Math.abs(actuals[i] - predictions[i]);
      count++;
    }
  }
  return count > 0 ? sumErr / count : 0;
}

function calculateRMSE(actuals, predictions) {
  let sumSqErr = 0;
  let count = 0;
  for (let i = 0; i < actuals.length; i++) {
    if (predictions[i] !== undefined && !isNaN(predictions[i])) {
      sumSqErr += Math.pow(actuals[i] - predictions[i], 2);
      count++;
    }
  }
  return count > 0 ? Math.sqrt(sumSqErr / count) : 0;
}

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "moresushant600@gmail.com" }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const txs = await prisma.transaction.findMany({
    where: { userId: user.id, type: "EXPENSE", status: "COMPLETED" },
    orderBy: { date: "asc" }
  });

  // Group by month
  const monthlyMap = new Map();
  for (const t of txs) {
    const d = new Date(t.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(t.amount));
  }

  const sortedMonths = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  console.log("Historical Active Months and Actual Spend:");
  sortedMonths.forEach(([m, amt]) => console.log(`  ${m}: ₹${amt.toFixed(2)}`));

  // Focus on the modern cluster where data is active (2025-07, 2025-09, 2025-10, 2026-08, 2026-10)
  // Let's perform rolling window walk-forward backtesting
  const series = sortedMonths.map(([m, amt]) => ({ month: m, actual: amt }));
  
  if (series.length < 3) {
    console.log("Insufficient data for backtesting.");
    return;
  }

  console.log("\n--- Rolling Walk-Forward Backtesting (Starting from window size 2) ---");
  
  const testResults = {
    naiveExisting: [],  // previous * 1.05
    sma: [],            // Simple Moving Average
    ema: [],            // Exponential Moving Average (alpha = 0.5)
    weightedRecency: [] // Recency-weighted average (weights 3, 2, 1)
  };
  const actuals = [];

  for (let t = 2; t < series.length; t++) {
    const trainData = series.slice(0, t);
    const target = series[t];
    actuals.push(target.actual);

    // 1. Naive existing (prev * 1.05)
    const prev = trainData[trainData.length - 1].actual;
    const predNaive = prev * 1.05;
    testResults.naiveExisting.push(predNaive);

    // 2. Simple Moving Average (last min(3, trainData.length))
    const windowSize = Math.min(3, trainData.length);
    const window = trainData.slice(trainData.length - windowSize);
    const predSMA = window.reduce((s, w) => s + w.actual, 0) / windowSize;
    testResults.sma.push(predSMA);

    // 3. EMA (alpha = 0.5)
    let predEMA = trainData[0].actual;
    for (let i = 1; i < trainData.length; i++) {
      predEMA = 0.5 * trainData[i].actual + 0.5 * predEMA;
    }
    testResults.ema.push(predEMA);

    // 4. Weighted Recency (weights for up to last 3: [1], [1, 2], or [1, 2, 3])
    let weightedSum = 0;
    let totalWeight = 0;
    for (let k = 0; k < window.length; k++) {
      const weight = k + 1;
      weightedSum += window[k].actual * weight;
      totalWeight += weight;
    }
    const predWeighted = weightedSum / totalWeight;
    testResults.weightedRecency.push(predWeighted);

    console.log(`\nPredicting for ${target.month} (Actual: ₹${target.actual.toFixed(2)}):`);
    console.log(`  - Naive (Prev * 1.05): ₹${predNaive.toFixed(2)} (Err: ₹${Math.abs(target.actual - predNaive).toFixed(2)})`);
    console.log(`  - SMA (k=${windowSize}):        ₹${predSMA.toFixed(2)} (Err: ₹${Math.abs(target.actual - predSMA).toFixed(2)})`);
    console.log(`  - EMA (α=0.5):        ₹${predEMA.toFixed(2)} (Err: ₹${Math.abs(target.actual - predEMA).toFixed(2)})`);
    console.log(`  - Weighted Recency:   ₹${predWeighted.toFixed(2)} (Err: ₹${Math.abs(target.actual - predWeighted).toFixed(2)})`);
  }

  console.log("\n================ BACKTEST EVALUATION SUMMARY ================");
  console.log("Model Performance Comparison:");
  const summary = [
    {
      Model: "Naive Existing (1.05x)",
      MAE: calculateMAE(actuals, testResults.naiveExisting).toFixed(2),
      RMSE: calculateRMSE(actuals, testResults.naiveExisting).toFixed(2)
    },
    {
      Model: "Simple Moving Average (SMA)",
      MAE: calculateMAE(actuals, testResults.sma).toFixed(2),
      RMSE: calculateRMSE(actuals, testResults.sma).toFixed(2)
    },
    {
      Model: "Exponential Smoothing (EMA α=0.5)",
      MAE: calculateMAE(actuals, testResults.ema).toFixed(2),
      RMSE: calculateRMSE(actuals, testResults.ema).toFixed(2)
    },
    {
      Model: "Recency-Weighted Baseline",
      MAE: calculateMAE(actuals, testResults.weightedRecency).toFixed(2),
      RMSE: calculateRMSE(actuals, testResults.weightedRecency).toFixed(2)
    }
  ];
  console.table(summary);
}

main().catch(console.error).finally(() => prisma.$disconnect());
