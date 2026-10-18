/**
 * Deterministic Financial Calculations for Goal-Based Financial Planner
 * All formulas use validated financial math (Ordinary Annuity, Compound Interest, Time-Value of Money).
 * No AI or stochastic language models are used for financial arithmetic.
 */

/**
 * Calculate remaining days and months between current date and target date
 */
export function calculateRemainingTime(targetDate, fromDate = new Date()) {
  if (!targetDate) return null;

  const target = new Date(targetDate);
  const now = new Date(fromDate);

  if (isNaN(target.getTime())) return null;

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return {
      daysRemaining: 0,
      monthsRemaining: 0,
      isOverdue: true,
      text: "Target date has passed",
    };
  }

  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Calendar month difference plus partial month fraction
  const monthDiff =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  const dayFraction = (target.getDate() - now.getDate()) / 30.44;
  const exactMonths = Math.max(0.1, monthDiff + dayFraction);
  const monthsRemaining = Math.max(1, Math.round(exactMonths));

  let timeText = "";
  if (daysRemaining < 30) {
    timeText = `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
  } else if (monthsRemaining < 12) {
    timeText = `${monthsRemaining} month${monthsRemaining === 1 ? "" : "s"}`;
  } else {
    const years = Math.floor(monthsRemaining / 12);
    const remMonths = monthsRemaining % 12;
    timeText = `${years} yr${years > 1 ? "s" : ""}${
      remMonths > 0 ? ` ${remMonths} mo${remMonths > 1 ? "s" : ""}` : ""
    }`;
  }

  return {
    daysRemaining,
    monthsRemaining,
    exactMonths: Number(exactMonths.toFixed(1)),
    isOverdue: false,
    text: timeText,
  };
}

/**
 * Calculate required monthly contribution for a goal
 * Supports basic cash savings and optional illustrative investment return calculation (SIP Annuity)
 */
export function calculateRequiredMonthlyContribution({
  targetAmount = 0,
  savedAmount = 0,
  targetDate = null,
  expectedReturnRate = 0, // annual return rate in %
  fromDate = new Date(),
}) {
  const target = Number(targetAmount) || 0;
  const saved = Number(savedAmount) || 0;
  const remainingAmount = Math.max(0, target - saved);

  if (target <= 0) {
    return {
      remainingAmount: 0,
      requiredMonthly: 0,
      status: "INVALID_TARGET",
      message: "Target amount must be greater than zero.",
    };
  }

  if (remainingAmount <= 0) {
    return {
      remainingAmount: 0,
      requiredMonthly: 0,
      status: "COMPLETED",
      message: "Goal target has been achieved! No further contributions required.",
    };
  }

  if (!targetDate) {
    return {
      remainingAmount,
      requiredMonthly: null,
      status: "NO_DATE",
      message: "Set a target date to calculate monthly required savings.",
    };
  }

  const time = calculateRemainingTime(targetDate, fromDate);

  if (!time) {
    return {
      remainingAmount,
      requiredMonthly: null,
      status: "NO_DATE",
      message: "Invalid target date.",
    };
  }

  if (time.isOverdue) {
    return {
      remainingAmount,
      requiredMonthly: remainingAmount,
      status: "OVERDUE",
      daysRemaining: 0,
      monthsRemaining: 0,
      message:
        "Target date has passed. Full remaining amount is due or adjust target date.",
    };
  }

  const n = time.monthsRemaining;

  // 1. Basic savings (0% return)
  const basicMonthly = remainingAmount / n;

  // 2. Optional illustrative investment projection (Compound Monthly SIP Annuity)
  const annualRate = Number(expectedReturnRate) || 0;
  let investmentMonthly = basicMonthly;
  let projectedTotalInterest = 0;
  let futureValueOfCurrentSavings = saved;

  if (annualRate > 0 && n > 0) {
    const monthlyRate = annualRate / 100 / 12;

    // FV of lump sum already saved: FV = PV * (1 + i)^n
    futureValueOfCurrentSavings = saved * Math.pow(1 + monthlyRate, n);

    // Remaining target needed from monthly contributions
    const shortfallNeeded = Math.max(0, target - futureValueOfCurrentSavings);

    // Ordinary Annuity Formula: PMT = FV * i / ((1 + i)^n - 1)
    const factor = Math.pow(1 + monthlyRate, n) - 1;
    if (factor > 0) {
      investmentMonthly = (shortfallNeeded * monthlyRate) / factor;
    } else {
      investmentMonthly = shortfallNeeded / n;
    }

    const totalContributed = saved + investmentMonthly * n;
    projectedTotalInterest = Math.max(0, target - totalContributed);
  }

  return {
    targetAmount: target,
    savedAmount: saved,
    remainingAmount,
    monthsRemaining: n,
    daysRemaining: time.daysRemaining,
    timeText: time.text,
    status: "ON_TRACK",
    basicMonthlySavings: Number(basicMonthly.toFixed(2)),
    requiredMonthly: Number(
      (annualRate > 0 ? investmentMonthly : basicMonthly).toFixed(2)
    ),
    investmentProjection:
      annualRate > 0
        ? {
            assumedAnnualRate: annualRate,
            monthlyRatePercent: Number(((annualRate / 12)).toFixed(3)),
            requiredMonthlyWithReturns: Number(investmentMonthly.toFixed(2)),
            monthlySavingsSavedVsCash: Number(
              Math.max(0, basicMonthly - investmentMonthly).toFixed(2)
            ),
            futureValueOfCurrentSavings: Number(
              futureValueOfCurrentSavings.toFixed(2)
            ),
            projectedReturnsEarned: Number(projectedTotalInterest.toFixed(2)),
            disclaimer:
              "Illustrative projection based on monthly compounding. Actual market returns fluctuate and are not guaranteed.",
          }
        : null,
  };
}

/**
 * Simulate What-If Scenarios (Read-Only)
 * Allows users to simulate changing monthly contributions, target date, expected return, or lump sums.
 */
export function simulateWhatIfScenario({
  targetAmount = 0,
  currentSaved = 0,
  simulatedMonthly = 0,
  simulatedMonths = 12,
  expectedReturnRate = 0,
  oneTimeLumpSum = 0,
  lumpSumMonth = 0,
}) {
  const target = Number(targetAmount) || 0;
  const saved = Number(currentSaved) || 0;
  const pmt = Math.max(0, Number(simulatedMonthly) || 0);
  const n = Math.max(1, Number(simulatedMonths) || 1);
  const annualRate = Math.max(0, Number(expectedReturnRate) || 0);
  const lump = Math.max(0, Number(oneTimeLumpSum) || 0);
  const lumpMonth = Math.min(n, Math.max(0, Number(lumpSumMonth) || 0));

  let projectedAccumulation = 0;
  let totalCashContributed = saved;
  const timeline = [];

  const monthlyRate = annualRate > 0 ? annualRate / 100 / 12 : 0;

  let balance = saved;
  for (let month = 1; month <= n; month++) {
    // Add lump sum if applicable this month
    if (month === lumpMonth && lump > 0) {
      balance += lump;
      totalCashContributed += lump;
    }

    // Add monthly contribution
    balance += pmt;
    totalCashContributed += pmt;

    // Apply monthly interest
    if (monthlyRate > 0) {
      const interestEarned = balance * monthlyRate;
      balance += interestEarned;
    }

    timeline.push({
      month,
      label: `Mo ${month}`,
      accumulated: Number(balance.toFixed(2)),
      contributed: Number(totalCashContributed.toFixed(2)),
      target,
    });
  }

  projectedAccumulation = balance;

  const isTargetAchieved = projectedAccumulation >= target;
  const difference = projectedAccumulation - target;
  const shortfall = Math.max(0, target - projectedAccumulation);

  // Additional monthly contribution needed if shortfall exists
  let additionalMonthlyNeeded = 0;
  if (shortfall > 0 && n > 0) {
    if (monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, n) - 1;
      additionalMonthlyNeeded = (shortfall * monthlyRate) / factor;
    } else {
      additionalMonthlyNeeded = shortfall / n;
    }
  }

  // Estimated months to reach goal at this monthly rate (if pmt > 0)
  let estimatedMonthsToReach = null;
  if (pmt > 0) {
    const netTarget = target - saved - lump;
    if (netTarget <= 0) {
      estimatedMonthsToReach = 0;
    } else if (monthlyRate === 0) {
      estimatedMonthsToReach = Math.ceil(netTarget / pmt);
    } else {
      // n = ln((FV * i + PMT) / (PV * i + PMT)) / ln(1 + i)
      const num = target * monthlyRate + pmt;
      const den = (saved + lump) * monthlyRate + pmt;
      if (den > 0 && num > 0) {
        estimatedMonthsToReach = Math.ceil(
          Math.log(num / den) / Math.log(1 + monthlyRate)
        );
      }
    }
  }

  return {
    targetAmount: target,
    currentSaved: saved,
    simulatedMonthly: pmt,
    simulatedMonths: n,
    expectedReturnRate: annualRate,
    oneTimeLumpSum: lump,
    projectedAccumulation: Number(projectedAccumulation.toFixed(2)),
    totalCashContributed: Number(totalCashContributed.toFixed(2)),
    projectedReturns: Number(
      Math.max(0, projectedAccumulation - totalCashContributed).toFixed(2)
    ),
    isTargetAchieved,
    surplusOrShortfall: Number(difference.toFixed(2)),
    additionalMonthlyNeeded: Number(additionalMonthlyNeeded.toFixed(2)),
    estimatedMonthsToReach,
    timeline,
  };
}
