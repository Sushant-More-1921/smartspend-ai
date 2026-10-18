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
      <Card className="bg-[#160a2c]/80 border-purple-500/30 rounded-2xl p-8 text-center text-gray-400">
        <Calculator className="w-10 h-10 mx-auto text-purple-400 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">
          Goal-Based Financial Planner
        </h3>
        <p className="text-xs">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#180a2c] to-indigo-950/60 border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Goal-Based Financial Planner
            </h2>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Deterministic planning, monthly contributions, what-if scenarios, and actual
            surplus feasibility.
          </p>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
            Planning Goal:
          </span>
          <select
            value={activeGoalId}
            onChange={(e) => setActiveGoalId(e.target.value)}
            className="p-2 rounded-xl bg-[#0f051d] border border-purple-600/40 text-white text-xs font-semibold focus:outline-none focus:border-purple-400 shadow-md"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#160b28]">
                {g.name} (Target: ₹{Number(g.targetAmount).toLocaleString("en-IN")})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION A & B: Current Goal Plan & Required Monthly Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Required Monthly Contribution & Time Breakdown */}
        <Card className="bg-[#160a2c]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-800/30 pb-3">
            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Monthly Savings Required
              </span>
              <h3 className="text-base font-bold text-white">{activeGoal.name}</h3>
            </div>
            <Badge
              variant="outline"
              className={
                originalPlan?.status === "COMPLETED"
                  ? "border-green-500/50 text-green-300 bg-green-950/30"
                  : originalPlan?.status === "OVERDUE"
                  ? "border-red-500/50 text-red-300 bg-red-950/30"
                  : "border-purple-500/50 text-purple-300 bg-purple-950/30"
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
            <span className="text-xs text-gray-400">Required Monthly Savings</span>
            <div className="text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              ₹
              {originalPlan?.requiredMonthly !== null
                ? originalPlan.requiredMonthly.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })
                : "—"}
              <span className="text-xs font-normal text-gray-400"> / month</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {originalPlan?.monthsRemaining > 0
                ? `Assuming ${originalPlan.monthsRemaining} monthly contribution period${
                    originalPlan.monthsRemaining === 1 ? "" : "s"
                  } until target date.`
                : originalPlan?.message || "Set a target date to calculate required monthly savings."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-800/30 text-xs">
            <div className="p-2.5 rounded-xl bg-black/30 border border-purple-800/30">
              <span className="text-[10px] text-gray-400 block">Target Amount</span>
              <span className="font-bold text-white">
                ₹{Number(activeGoal.targetAmount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/30 border border-purple-800/30">
              <span className="text-[10px] text-gray-400 block">Already Saved</span>
              <span className="font-bold text-emerald-400">
                ₹{Number(activeGoal.savedAmount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/30 border border-purple-800/30">
              <span className="text-[10px] text-gray-400 block">Remaining</span>
              <span className="font-bold text-amber-300">
                ₹
                {Math.max(
                  0,
                  activeGoal.targetAmount - activeGoal.savedAmount
                ).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/30 border border-purple-800/30">
              <span className="text-[10px] text-gray-400 block">Time Remaining</span>
              <span className="font-bold text-pink-300">
                {originalPlan?.timeText || "No target date"}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Investment Projection / Compounding Math */}
        <Card className="bg-[#160a2c]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-800/30 pb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-bold text-white">
                Investment Projection
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-pink-500/40 text-pink-300 bg-pink-950/30 text-[10px]"
            >
              {activeGoal.expectedReturnRate > 0
                ? `${activeGoal.expectedReturnRate}% Return Assumed`
                : "Pure Savings (0%)"}
            </Badge>
          </div>

          {activeGoal.expectedReturnRate > 0 &&
          originalPlan?.investmentProjection ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-950/40 to-pink-950/20 border border-purple-700/30 space-y-1">
                <span className="text-[11px] text-gray-400">
                  Required Monthly with Growth
                </span>
                <div className="text-2xl font-bold text-pink-300">
                  ₹
                  {originalPlan.investmentProjection.requiredMonthlyWithReturns.toLocaleString(
                    "en-IN"
                  )}
                  <span className="text-xs text-gray-400 font-normal"> / mo</span>
                </div>
                {originalPlan.investmentProjection.monthlySavingsSavedVsCash > 0 && (
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ⚡ Saves ₹
                    {originalPlan.investmentProjection.monthlySavingsSavedVsCash.toFixed(
                      2
                    )}
                    /mo vs pure cash savings due to compounding returns!
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Assumed Annual Return:</span>
                  <span className="font-semibold text-white">
                    {activeGoal.expectedReturnRate}% p.a.
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Monthly Compounding:</span>
                  <span className="font-semibold text-white">
                    {originalPlan.investmentProjection.monthlyRatePercent}% / month
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Projected Market Gains:</span>
                  <span className="font-semibold text-purple-300">
                    +₹
                    {originalPlan.investmentProjection.projectedReturnsEarned.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 italic leading-relaxed pt-1 border-t border-purple-800/30">
                {originalPlan.investmentProjection.disclaimer}
              </p>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <PiggyBank className="w-8 h-8 mx-auto text-purple-400/60" />
              <p className="text-xs text-gray-300 font-medium">
                Pure Cash Savings Mode (0% Return)
              </p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                No investment growth is assumed. To project returns from SIP or mutual
                funds, adjust the return rate in the simulator below or edit goal.
              </p>
            </div>
          )}
        </Card>

        {/* Card 3: Actual Financial Behaviour & Surplus Integration */}
        <Card className="bg-[#160a2c]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-purple-800/30 pb-3">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">
                  Monthly Surplus Feasibility
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-indigo-500/40 text-indigo-300 bg-indigo-950/30 text-[10px]"
              >
                Actual Behavior
              </Badge>
            </div>

            {behaviourData ? (
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400">Avg Monthly Income:</span>
                  <span className="font-semibold text-emerald-400">
                    ₹{behaviourData.avgMonthlyIncome.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400">Avg Monthly Expenses:</span>
                  <span className="font-semibold text-red-400">
                    ₹{behaviourData.avgMonthlyExpenses.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-1 border-t border-purple-800/30">
                  <span className="text-gray-300 font-medium">Estimated Surplus:</span>
                  <span className="font-bold text-white">
                    ₹{behaviourData.estimatedMonthlySurplus.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400">This Goal Requires:</span>
                  <span className="font-bold text-purple-300">
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
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    {behaviourData.estimatedMonthlySurplus >=
                    originalPlan.requiredMonthly ? (
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Healthy Surplus / Feasible</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">
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
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Tight Monthly Buffer</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">
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
              <div className="py-6 text-center text-xs text-gray-400">
                Tracking past expenses & income...
              </div>
            )}
          </div>

          <p className="text-[10px] text-gray-400 italic">
            * Based on {behaviourData?.monthsAnalyzed || 1} month(s) of transaction records.
            Essential commitments and emergency needs should also be factored in.
          </p>
        </Card>
      </div>

      {/* SECTION C & E: What-If Simulator with Live Chart & Update Goal Plan */}
      <Card className="bg-[#160a2c]/90 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-pink-400" />
              <h3 className="text-lg font-bold text-white">What-If Simulator</h3>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Test alternative monthly savings amounts, timelines, and return assumptions
              in real-time. Completely read-only until you explicitly choose to update.
            </p>
          </div>

          <Button
            onClick={handleUpdateGoalPlan}
            disabled={isUpdatingPlan || !isSimDiffersFromOriginal}
            className={`rounded-xl text-xs font-bold gap-1.5 shadow-lg ${
              isSimDiffersFromOriginal
                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                : "bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            {isUpdatingPlan ? "Saving Plan..." : "Update Goal Plan with Simulation"}
          </Button>
        </div>

        {/* Simulator Interactive Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Slider 1: Monthly Contribution */}
          <div className="p-4 rounded-xl bg-black/40 border border-purple-800/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Monthly Contribution</span>
              <span className="font-bold text-purple-300">
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
              className="accent-purple-500 h-2 cursor-pointer bg-gray-800"
            />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400">Input: ₹</span>
              <Input
                type="number"
                min="0"
                step="100"
                value={simMonthly}
                onChange={(e) => setSimMonthly(Number(e.target.value))}
                className="h-7 text-xs bg-[#0f051d] border-purple-700/40 text-white"
              />
            </div>
          </div>

          {/* Slider 2: Target Duration (Months) */}
          <div className="p-4 rounded-xl bg-black/40 border border-purple-800/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Timeline (Months)</span>
              <span className="font-bold text-pink-300">
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
              className="accent-pink-500 h-2 cursor-pointer bg-gray-800"
            />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400">Duration:</span>
              <Input
                type="number"
                min="1"
                max="120"
                value={simMonths}
                onChange={(e) => setSimMonths(Number(e.target.value))}
                className="h-7 text-xs bg-[#0f051d] border-purple-700/40 text-white"
              />
              <span className="text-[11px] text-gray-400">mo</span>
            </div>
          </div>

          {/* Slider 3: Expected Annual Return */}
          <div className="p-4 rounded-xl bg-black/40 border border-purple-800/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Expected Return Rate</span>
              <span className="font-bold text-indigo-300">{simReturnRate}% p.a.</span>
            </div>
            <Input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={simReturnRate}
              onChange={(e) => setSimReturnRate(Number(e.target.value))}
              className="accent-indigo-500 h-2 cursor-pointer bg-gray-800"
            />
            <p className="text-[10px] text-gray-400 pt-1">
              0% = Cash / Savings | 7-12% = Mutual Funds / Equities
            </p>
          </div>

          {/* Slider 4: Optional Future Lump-Sum */}
          <div className="p-4 rounded-xl bg-black/40 border border-purple-800/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Future Lump-Sum (₹)</span>
              <span className="font-bold text-amber-300">
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
              className="h-7 text-xs bg-[#0f051d] border-purple-700/40 text-white"
            />
            <p className="text-[10px] text-gray-400 pt-1">
              Anticipated one-time bonus or tax refund.
            </p>
          </div>
        </div>

        {/* Simulation Output Cards */}
        {simulation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-black/30 border border-purple-800/30">
              <span className="text-[11px] text-gray-400">
                Projected Accumulated Total
              </span>
              <div className="text-xl font-black text-white mt-1">
                ₹{simulation.projectedAccumulation.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-gray-400">
                Target: ₹{Number(activeGoal.targetAmount).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-black/30 border border-indigo-800/30">
              <span className="text-[11px] text-gray-400">Target Sufficiency</span>
              <div className="flex items-center gap-1.5 mt-1">
                {simulation.isTargetAchieved ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-base font-bold text-emerald-400">
                      Fully Achieved!
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-base font-bold text-amber-400">
                      Shortfall
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-gray-400">
                {simulation.isTargetAchieved
                  ? `+₹${simulation.surplusOrShortfall.toLocaleString("en-IN")} surplus`
                  : `₹${Math.abs(simulation.surplusOrShortfall).toLocaleString("en-IN")} still needed`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-950/40 to-black/30 border border-pink-800/30">
              <span className="text-[11px] text-gray-400">
                Time Needed with this Contribution
              </span>
              <div className="text-xl font-black text-pink-300 mt-1">
                {simulation.estimatedMonthsToReach !== null
                  ? `${simulation.estimatedMonthsToReach} months`
                  : "N/A"}
              </div>
              <span className="text-[11px] text-gray-400">
                Selected duration: {simMonths} months
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-black/30 border border-amber-800/30">
              <span className="text-[11px] text-gray-400">
                Extra Monthly Savings Needed
              </span>
              <div className="text-xl font-black text-amber-300 mt-1">
                ₹{simulation.additionalMonthlyNeeded.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-gray-400">
                To reach target in {simMonths} months
              </span>
            </div>
          </div>
        )}

        {/* Projection Area Chart */}
        {simulation?.timeline && simulation.timeline.length > 0 && (
          <div className="p-4 rounded-xl bg-black/40 border border-purple-800/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-300">
                Simulated Accumulation Curve vs Goal Target
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-gray-400">Accumulated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 bg-pink-500" />
                  <span className="text-gray-400">Target Line</span>
                </div>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulation.timeline}>
                  <defs>
                    <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#666"
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
                      background: "#160a2c",
                      borderColor: "#9333ea",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <ReferenceLine
                    y={activeGoal.targetAmount}
                    stroke="#ec4899"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target: ₹${Number(activeGoal.targetAmount).toLocaleString(
                        "en-IN"
                      )}`,
                      fill: "#ec4899",
                      fontSize: 11,
                      position: "insideTopRight",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accumulated"
                    stroke="#a855f7"
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
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
          <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
            Plan Comparison: Original vs Simulated
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-purple-800/40 text-gray-400">
                  <th className="pb-2">Metric</th>
                  <th className="pb-2">Original Plan</th>
                  <th className="pb-2">Simulated Plan</th>
                  <th className="pb-2">Impact / Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950 text-gray-200">
                <tr>
                  <td className="py-2 text-gray-400">Monthly Contribution</td>
                  <td className="py-2">
                    ₹{(originalPlan?.requiredMonthly || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 font-semibold text-purple-300">
                    ₹{simMonthly.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2">
                    {simMonthly - (originalPlan?.requiredMonthly || 0) >= 0 ? (
                      <span className="text-emerald-400">
                        +₹
                        {(
                          simMonthly - (originalPlan?.requiredMonthly || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        -₹
                        {Math.abs(
                          simMonthly - (originalPlan?.requiredMonthly || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 text-gray-400">Timeline</td>
                  <td className="py-2">
                    {originalPlan?.monthsRemaining || 0} months
                  </td>
                  <td className="py-2 font-semibold text-pink-300">
                    {simMonths} months
                  </td>
                  <td className="py-2">
                    {simMonths - (originalPlan?.monthsRemaining || 0) > 0 ? (
                      <span className="text-gray-300">
                        +{simMonths - (originalPlan?.monthsRemaining || 0)} months
                      </span>
                    ) : simMonths - (originalPlan?.monthsRemaining || 0) < 0 ? (
                      <span className="text-emerald-400">
                        {simMonths - (originalPlan?.monthsRemaining || 0)} months faster
                      </span>
                    ) : (
                      <span className="text-gray-400">Same duration</span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 text-gray-400">Assumed Return Rate</td>
                  <td className="py-2">{activeGoal.expectedReturnRate || 0}%</td>
                  <td className="py-2 font-semibold text-indigo-300">
                    {simReturnRate}%
                  </td>
                  <td className="py-2">
                    {simReturnRate - (activeGoal.expectedReturnRate || 0) !== 0 ? (
                      <span className="text-purple-300">
                        {simReturnRate > (activeGoal.expectedReturnRate || 0) ? "+" : ""}
                        {simReturnRate - (activeGoal.expectedReturnRate || 0)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">No change</span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 text-gray-400">Projected Accumulation</td>
                  <td className="py-2">
                    ₹{Number(activeGoal.targetAmount).toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 font-bold text-white">
                    ₹{simulation?.projectedAccumulation.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2">
                    {simulation?.isTargetAchieved ? (
                      <span className="text-emerald-400 font-semibold">
                        Target Fully Met
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold">
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
