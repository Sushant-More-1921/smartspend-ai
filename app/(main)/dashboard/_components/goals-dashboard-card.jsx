import React from "react";
import Link from "next/link";
import { Target, ArrowRight, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getFinancialGoals } from "@/actions/goals";
import { getGoalIconComponent } from "@/lib/goal-icons";

export async function GoalsDashboardCard() {
  const result = await getFinancialGoals();

  if (!result || !result.success) {
    return null;
  }

  const { goals = [], overview = {} } = result.data || {};
  const {
    totalGoalTarget = 0,
    totalSaved = 0,
    activeGoalsCount = 0,
    completedGoalsCount = 0,
  } = overview;

  const totalProgress =
    totalGoalTarget > 0 ? (totalSaved / totalGoalTarget) * 100 : 0;
  const displayProgress = Math.min(100, Math.max(0, totalProgress));

  // Top active goals (up to 2)
  const topActiveGoals = goals
    .filter((g) => g.status !== "COMPLETED")
    .slice(0, 2);

  return (
    <Card className="relative bg-gradient-to-br from-[#1c0c38] via-[#160a2c] to-[#0f051d] border border-purple-500/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300">
      {/* Background glass shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-pink-500/5 pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Financial Goals & Planner
            </CardTitle>
            <p className="text-xs text-gray-400">
              {activeGoalsCount} active • {completedGoalsCount} completed
            </p>
          </div>
        </div>

        <Link href="/goals" prefetch={true}>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full text-xs font-semibold px-3.5 py-1.5 h-8 shadow-md flex items-center gap-1.5 hover:scale-105 transition-all"
          >
            <span>Manage Goals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10 pt-1">
        {goals.length === 0 ? (
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 text-center space-y-2">
            <p className="text-xs text-gray-300">
              No financial goals created yet. Set targets for emergencies, gadgets, or
              savings to track progress and get monthly required plans.
            </p>
            <Link href="/goals" className="inline-block pt-1">
              <Button
                size="sm"
                variant="outline"
                className="border-purple-500/40 text-purple-300 hover:text-white hover:bg-purple-900/30 text-xs rounded-xl"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Create Your First Goal
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Overall Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-gray-300">
                  Total Saved:{" "}
                  <strong className="text-purple-300 font-bold">
                    ₹{totalSaved.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </strong>{" "}
                  of ₹{totalGoalTarget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                <span className="font-bold text-pink-300">
                  {totalProgress.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={displayProgress}
                className="h-2.5 bg-gray-900/60 rounded-full"
                extraStyles="bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>

            {/* Quick Preview of Top 2 Active Goals */}
            {topActiveGoals.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {topActiveGoals.map((goal) => {
                  const Icon = getGoalIconComponent(goal.icon);
                  const goalProg =
                    goal.targetAmount > 0
                      ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)
                      : 0;

                  return (
                    <div
                      key={goal.id}
                      className="p-3 rounded-xl bg-black/40 border border-purple-800/30 hover:border-purple-600/40 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-purple-900/30 text-purple-400 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">
                            {goal.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            ₹{Number(goal.savedAmount).toLocaleString("en-IN")} / ₹
                            {Number(goal.targetAmount).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-purple-300">
                          {goalProg.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
