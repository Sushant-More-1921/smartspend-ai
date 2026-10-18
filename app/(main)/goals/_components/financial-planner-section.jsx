"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  TrendingUp,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Save,
  Layers,
  PiggyBank,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  calculateRequiredMonthlyContribution,
  simulateWhatIfScenario,
} from "@/lib/financial-planner";
import { updateFinancialGoal } from "@/actions/goals";
import { toast } from "sonner";

export function FinancialPlannerSection({
  goals = [],
  behaviourData = null,
  selectedGoalId,
  onGoalPlanUpdated,
}) {
  const [activeGoalId, setActiveGoalId] = useState(
    selectedGoalId || goals[0]?.id || ""
  );

  // Sync activeGoalId if selectedGoalId changes from parent
  const [prevSelectedGoalId, setPrevSelectedGoalId] = useState(selectedGoalId);
  if (selectedGoalId && selectedGoalId !== prevSelectedGoalId) {
    setPrevSelectedGoalId(selectedGoalId);
    setActiveGoalId(selectedGoalId);
  }

  const activeGoal = useMemo(() => {
    return goals.find((g) => g.id === activeGoalId) || goals[0] || null;
  }, [goals, activeGoalId]);

  // Original calculated values
  const originalPlan = useMemo(() => {
    if (!activeGoal) return null;
    return calculateRequiredMonthlyContribution({
      targetAmount: activeGoal.targetAmount,
      savedAmount: activeGoal.savedAmount,
      targetDate: activeGoal.targetDate,
      expectedReturnRate: activeGoal.expectedReturnRate || 0,
    });
  }, [activeGoal]);

  // Simulator local state (read-only until user clicks "Update Goal Plan")
  const defaultMonthly =
    originalPlan?.requiredMonthly > 0
      ? originalPlan.requiredMonthly
      : activeGoal ? Math.round(activeGoal.targetAmount / 12) : 5000;

  const [simMonthly, setSimMonthly] = useState(defaultMonthly || 5000);
  const [simMonths, setSimMonths] = useState(
    originalPlan?.monthsRemaining > 0 ? originalPlan.monthsRemaining : 12
  );
  const [simReturnRate, setSimReturnRate] = useState(
    activeGoal?.expectedReturnRate || 0
  );
  const [simLumpSum, setSimLumpSum] = useState(0);
  const [simLumpSumMonth, setSimLumpSumMonth] = useState(1);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  // Sync simulator state when activeGoal changes
  const [prevActiveGoalId, setPrevActiveGoalId] = useState(activeGoal?.id);
  if (activeGoal && activeGoal.id !== prevActiveGoalId) {
    setPrevActiveGoalId(activeGoal.id);
    setSimMonthly(defaultMonthly || 5000);
    setSimMonths(
      originalPlan?.monthsRemaining > 0 ? originalPlan.monthsRemaining : 12
    );
    setSimReturnRate(activeGoal.expectedReturnRate || 0);
    setSimLumpSum(0);
    setSimLumpSumMonth(1);
  }

  // Run What-If Simulation deterministically
  const simulation = useMemo(() => {
    if (!activeGoal) return null;
    return simulateWhatIfScenario({
      targetAmount: activeGoal.targetAmount,
      currentSaved: activeGoal.savedAmount,
      simulatedMonthly: simMonthly,
      simulatedMonths: simMonths,
      expectedReturnRate: simReturnRate,
      oneTimeLumpSum: simLumpSum,
      lumpSumMonth: simLumpSumMonth,
    });
  }, [
    activeGoal,
    simMonthly,
    simMonths,
    simReturnRate,
    simLumpSum,
    simLumpSumMonth,
  ]);

  if (!activeGoal) {
    return (
      <Card className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500 shadow-xs">
        <Calculator className="w-10 h-10 mx-auto text-blue-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Goal-Based Financial Planner
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Create at least one financial goal above to unlock required monthly savings
          projections, what-if simulations, and surplus analysis.
        </p>
      </Card>
    );
  }

  // Handle explicit Update Goal Plan
  const handleUpdateGoalPlan = async () => {
    setIsUpdatingPlan(true);
    try {
      // Calculate new target date from simMonths
      const newTargetDate = new Date();
      newTargetDate.setMonth(newTargetDate.getMonth() + simMonths);

      const res = await updateFinancialGoal(activeGoal.id, {
        name: activeGoal.name,
        targetAmount: activeGoal.targetAmount,
        category: activeGoal.category,
        targetDate: newTargetDate,
        description: activeGoal.description,
        icon: activeGoal.icon,
        expectedReturnRate: simReturnRate,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to update goal plan");
      }

      toast.success(
        `Goal plan for "${activeGoal.name}" updated! New target deadline: ${newTargetDate.toLocaleDateString()}`
      );
      if (onGoalPlanUpdated) onGoalPlanUpdated();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update goal plan");
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const isSimDiffersFromOriginal =
    simMonths !== (originalPlan?.monthsRemaining || 12) ||
    simReturnRate !== (activeGoal.expectedReturnRate || 0);

  return (
    <div className="space-y-6">
      {/* Planner Header & Goal Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Goal-Based Financial Planner
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic planning, monthly contributions, what-if scenarios, and actual
            surplus feasibility.
          </p>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Planning Goal:
          </span>
          <select
            value={activeGoalId}
            onChange={(e) => setActiveGoalId(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} (Target: ₹{Number(g.targetAmount).toLocaleString("en-IN")})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION A & B: Current Goal Plan & Required Monthly Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Required Monthly Contribution & Time Breakdown */}
        <Card className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Monthly Savings Required
              </span>
              <h3 className="text-base font-bold text-slate-900">{activeGoal.name}</h3>
            </div>
            <Badge
              variant="outline"
              className={
                originalPlan?.status === "COMPLETED"
                  ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                  : originalPlan?.status === "OVERDUE"
                  ? "border-rose-200 text-rose-700 bg-rose-50"
                  : "border-blue-200 text-blue-700 bg-blue-50"
              }
            >
              {originalPlan?.status === "COMPLETED"
                ? "Completed"
                : originalPlan?.status === "OVERDUE"
                ? "Overdue"
                : "Active Plan"}
            </Badge>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500">Required Monthly Savings</span>
            <div className="text-3xl font-black text-slate-900">
              ₹
              {originalPlan?.requiredMonthly !== null
                ? originalPlan.requiredMonthly.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })
                : "—"}
              <span className="text-xs font-normal text-slate-500"> / month</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {originalPlan?.monthsRemaining > 0
                ? `Assuming ${originalPlan.monthsRemaining} monthly contribution period${
                    originalPlan.monthsRemaining === 1 ? "" : "s"
                  } until target date.`
                : originalPlan?.message || "Set a target date to calculate required monthly savings."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Target Amount</span>
              <span className="font-bold text-slate-900">
                ₹{Number(activeGoal.targetAmount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Already Saved</span>
              <span className="font-bold text-emerald-600">
                ₹{Number(activeGoal.savedAmount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Remaining</span>
              <span className="font-bold text-amber-600">
                ₹
                {Math.max(
                  0,
                  activeGoal.targetAmount - activeGoal.savedAmount
                ).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Time Remaining</span>
              <span className="font-bold text-blue-600">
                {originalPlan?.timeText || "No target date"}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Investment Projection / Compounding Math */}
        <Card className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                Investment Projection
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]"
            >
              {activeGoal.expectedReturnRate > 0
                ? `${activeGoal.expectedReturnRate}% Return Assumed`
                : "Pure Savings (0%)"}
            </Badge>
          </div>

          {activeGoal.expectedReturnRate > 0 &&
          originalPlan?.investmentProjection ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                <span className="text-[11px] text-slate-600 font-medium">
                  Required Monthly with Growth
                </span>
                <div className="text-2xl font-bold text-blue-700">
                  ₹
                  {originalPlan.investmentProjection.requiredMonthlyWithReturns.toLocaleString(
                    "en-IN"
                  )}
                  <span className="text-xs text-slate-500 font-normal"> / mo</span>
                </div>
                {originalPlan.investmentProjection.monthlySavingsSavedVsCash > 0 && (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    ⚡ Saves ₹
                    {originalPlan.investmentProjection.monthlySavingsSavedVsCash.toFixed(
                      2
                    )}
                    /mo vs pure cash savings due to compounding returns!
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Assumed Annual Return:</span>
                  <span className="font-semibold text-slate-900">
                    {activeGoal.expectedReturnRate}% p.a.
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Monthly Compounding:</span>
                  <span className="font-semibold text-slate-900">
                    {originalPlan.investmentProjection.monthlyRatePercent}% / month
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Projected Market Gains:</span>
                  <span className="font-semibold text-emerald-600">
                    +₹
                    {originalPlan.investmentProjection.projectedReturnsEarned.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic leading-relaxed pt-1 border-t border-slate-100">
                {originalPlan.investmentProjection.disclaimer}
              </p>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <PiggyBank className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-800 font-medium">
                Pure Cash Savings Mode (0% Return)
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                No investment growth is assumed. To project returns from SIP or mutual
                funds, adjust the return rate in the simulator below or edit goal.
              </p>
            </div>
          )}
        </Card>

        {/* Card 3: Actual Financial Behaviour & Surplus Integration */}
        <Card className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Monthly Surplus Feasibility
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-slate-200 text-slate-700 bg-slate-50 text-[10px]"
              >
                Actual Behavior
              </Badge>
            </div>

            {behaviourData ? (
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500">Avg Monthly Income:</span>
                  <span className="font-semibold text-emerald-600">
                    ₹{behaviourData.avgMonthlyIncome.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500">Avg Monthly Expenses:</span>
                  <span className="font-semibold text-rose-600">
                    ₹{behaviourData.avgMonthlyExpenses.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-1 border-t border-slate-100">
                  <span className="text-slate-700 font-medium">Estimated Surplus:</span>
                  <span className="font-bold text-slate-900">
                    ₹{behaviourData.estimatedMonthlySurplus.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500">This Goal Requires:</span>
                  <span className="font-bold text-blue-600">
                    ₹
                    {(originalPlan?.requiredMonthly || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Feasibility Verdict */}
                {originalPlan?.requiredMonthly > 0 && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] mt-2 ${
                      behaviourData.estimatedMonthlySurplus >=
                      originalPlan.requiredMonthly
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    {behaviourData.estimatedMonthlySurplus >=
                    originalPlan.requiredMonthly ? (
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Healthy Surplus / Feasible</p>
                          <p className="text-[10px] text-emerald-700/90 mt-0.5">
                            You have ₹
                            {(
                              behaviourData.estimatedMonthlySurplus -
                              originalPlan.requiredMonthly
                            ).toFixed(2)}{" "}
                            buffer left after this goal contribution.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Tight Monthly Buffer</p>
                          <p className="text-[10px] text-amber-800/90 mt-0.5">
                            Required monthly savings exceed current average surplus by ₹
                            {(
                              originalPlan.requiredMonthly -
                              behaviourData.estimatedMonthlySurplus
                            ).toFixed(2)}
                            . Consider extending your target date in the simulator.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Tracking past expenses & income...
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 italic">
            * Based on {behaviourData?.monthsAnalyzed || 1} month(s) of transaction records.
            Essential commitments and emergency needs should also be factored in.
          </p>
        </Card>
      </div>

      {/* SECTION C & E: What-If Simulator with Live Chart & Update Goal Plan */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">What-If Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Test alternative monthly savings amounts, timelines, and return assumptions
              in real-time. Completely read-only until you explicitly choose to update.
            </p>
          </div>

          <Button
            onClick={handleUpdateGoalPlan}
            disabled={isUpdatingPlan || !isSimDiffersFromOriginal}
            className={`rounded-xl text-xs font-semibold gap-1.5 transition-all ${
              isSimDiffersFromOriginal
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isUpdatingPlan ? "Saving Plan..." : "Update Goal Plan with Simulation"}
          </Button>
        </div>

        {/* Simulator Interactive Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Slider 1: Monthly Contribution */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">Monthly Contribution</span>
              <span className="font-bold text-blue-600">
                ₹{simMonthly.toLocaleString("en-IN")}
              </span>
            </div>
            <Input
              type="range"
              min="500"
              max={Math.max(20000, activeGoal.targetAmount)}
              step="500"
              value={simMonthly}
              onChange={(e) => setSimMonthly(Number(e.target.value))}
              className="accent-blue-600 h-2 cursor-pointer bg-slate-200"
            />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500">Input: ₹</span>
              <Input
                type="number"
                min="0"
                step="100"
                value={simMonthly}
                onChange={(e) => setSimMonthly(Number(e.target.value))}
                className="h-7 text-xs bg-white border-slate-200 text-slate-900 rounded-lg"
              />
            </div>
          </div>

          {/* Slider 2: Target Duration (Months) */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">Timeline (Months)</span>
              <span className="font-bold text-blue-600">
                {simMonths} month{simMonths === 1 ? "" : "s"}
              </span>
            </div>
            <Input
              type="range"
              min="1"
              max="120"
              step="1"
              value={simMonths}
              onChange={(e) => setSimMonths(Number(e.target.value))}
              className="accent-blue-600 h-2 cursor-pointer bg-slate-200"
            />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500">Duration:</span>
              <Input
                type="number"
                min="1"
                max="120"
                value={simMonths}
                onChange={(e) => setSimMonths(Number(e.target.value))}
                className="h-7 text-xs bg-white border-slate-200 text-slate-900 rounded-lg"
              />
              <span className="text-[11px] text-slate-500">mo</span>
            </div>
          </div>

          {/* Slider 3: Expected Annual Return */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">Expected Return Rate</span>
              <span className="font-bold text-blue-600">{simReturnRate}% p.a.</span>
            </div>
            <Input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={simReturnRate}
              onChange={(e) => setSimReturnRate(Number(e.target.value))}
              className="accent-blue-600 h-2 cursor-pointer bg-slate-200"
            />
            <p className="text-[10px] text-slate-400 pt-1">
              0% = Cash / Savings | 7-12% = Mutual Funds / Equities
            </p>
          </div>

          {/* Slider 4: Optional Future Lump-Sum */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">Future Lump-Sum (₹)</span>
              <span className="font-bold text-blue-600">
                ₹{simLumpSum.toLocaleString("en-IN")}
              </span>
            </div>
            <Input
              type="number"
              min="0"
              step="1000"
              placeholder="e.g. Bonus"
              value={simLumpSum}
              onChange={(e) => setSimLumpSum(Number(e.target.value))}
              className="h-7 text-xs bg-white border-slate-200 text-slate-900 rounded-lg"
            />
            <p className="text-[10px] text-slate-400 pt-1">
              Anticipated one-time bonus or tax refund.
            </p>
          </div>
        </div>

        {/* Simulation Output Cards */}
        {simulation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500">
                Projected Accumulated Total
              </span>
              <div className="text-xl font-black text-slate-900 mt-1">
                ₹{simulation.projectedAccumulation.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-slate-400">
                Target: ₹{Number(activeGoal.targetAmount).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500">Target Sufficiency</span>
              <div className="flex items-center gap-1.5 mt-1">
                {simulation.isTargetAchieved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-base font-bold text-emerald-600">
                      Fully Achieved!
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-base font-bold text-amber-600">
                      Shortfall
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                {simulation.isTargetAchieved
                  ? `+₹${simulation.surplusOrShortfall.toLocaleString("en-IN")} surplus`
                  : `₹${Math.abs(simulation.surplusOrShortfall).toLocaleString("en-IN")} still needed`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500">
                Time Needed with this Contribution
              </span>
              <div className="text-xl font-black text-blue-600 mt-1">
                {simulation.estimatedMonthsToReach !== null
                  ? `${simulation.estimatedMonthsToReach} months`
                  : "N/A"}
              </div>
              <span className="text-[11px] text-slate-400">
                Selected duration: {simMonths} months
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500">
                Extra Monthly Savings Needed
              </span>
              <div className="text-xl font-black text-amber-600 mt-1">
                ₹{simulation.additionalMonthlyNeeded.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-slate-400">
                To reach target in {simMonths} months
              </span>
            </div>
          </div>
        )}

        {/* Projection Area Chart */}
        {simulation?.timeline && simulation.timeline.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Simulated Accumulation Curve vs Goal Target
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-slate-500">Accumulated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 bg-emerald-600" />
                  <span className="text-slate-500">Target Line</span>
                </div>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulation.timeline}>
                  <defs>
                    <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val) => [
                      `₹${Number(val).toLocaleString("en-IN")}`,
                      "Accumulated",
                    ]}
                    contentStyle={{
                      background: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.75rem",
                      color: "#0f172a",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <ReferenceLine
                    y={activeGoal.targetAmount}
                    stroke="#059669"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target: ₹${Number(activeGoal.targetAmount).toLocaleString(
                        "en-IN"
                      )}`,
                      fill: "#059669",
                      fontSize: 11,
                      position: "insideTopRight",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accumulated"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#simGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Plan Diff Comparison Table */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Plan Comparison: Original vs Simulated
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-medium">Metric</th>
                  <th className="pb-2 font-medium">Original Plan</th>
                  <th className="pb-2 font-medium">Simulated Plan</th>
                  <th className="pb-2 font-medium">Impact / Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 text-slate-500">Monthly Contribution</td>
                  <td className="py-2.5">
                    ₹{(originalPlan?.requiredMonthly || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 font-semibold text-blue-600">
                    ₹{simMonthly.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5">
                    {simMonthly - (originalPlan?.requiredMonthly || 0) >= 0 ? (
                      <span className="text-emerald-600 font-medium">
                        +₹
                        {(
                          simMonthly - (originalPlan?.requiredMonthly || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">
                        -₹
                        {Math.abs(
                          simMonthly - (originalPlan?.requiredMonthly || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 text-slate-500">Timeline</td>
                  <td className="py-2.5">
                    {originalPlan?.monthsRemaining || 0} months
                  </td>
                  <td className="py-2.5 font-semibold text-blue-600">
                    {simMonths} months
                  </td>
                  <td className="py-2.5">
                    {simMonths - (originalPlan?.monthsRemaining || 0) > 0 ? (
                      <span className="text-slate-600 font-medium">
                        +{simMonths - (originalPlan?.monthsRemaining || 0)} months
                      </span>
                    ) : simMonths - (originalPlan?.monthsRemaining || 0) < 0 ? (
                      <span className="text-emerald-600 font-medium">
                        {simMonths - (originalPlan?.monthsRemaining || 0)} months faster
                      </span>
                    ) : (
                      <span className="text-slate-400">Same duration</span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 text-slate-500">Assumed Return Rate</td>
                  <td className="py-2.5">{activeGoal.expectedReturnRate || 0}%</td>
                  <td className="py-2.5 font-semibold text-blue-600">
                    {simReturnRate}%
                  </td>
                  <td className="py-2.5">
                    {simReturnRate - (activeGoal.expectedReturnRate || 0) !== 0 ? (
                      <span className="text-blue-600 font-medium">
                        {simReturnRate > (activeGoal.expectedReturnRate || 0) ? "+" : ""}
                        {simReturnRate - (activeGoal.expectedReturnRate || 0)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">No change</span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 text-slate-500">Projected Accumulation</td>
                  <td className="py-2.5">
                    ₹{Number(activeGoal.targetAmount).toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 font-bold text-slate-900">
                    ₹{simulation?.projectedAccumulation.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5">
                    {simulation?.isTargetAchieved ? (
                      <span className="text-emerald-600 font-semibold">
                        Target Fully Met
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        Shortfall: ₹
                        {Math.abs(simulation?.surplusOrShortfall || 0).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
