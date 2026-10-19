import React from "react";
import Link from "next/link";
import { Target, ArrowRight, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getFinancialGoals } from "@/actions/goals";
import { getGoalIconComponent } from "@/lib/goal-icons";

export async function GoalsDashboardCard({ initialData }) {
  const result = initialData !== undefined ? initialData : await getFinancialGoals();

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
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Financial Goals & Planner
            </CardTitle>
            <p className="text-xs text-slate-500">
              {activeGoalsCount} active • {completedGoalsCount} completed
            </p>
          </div>
        </div>

        <Link href="/goals" prefetch={true}>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold px-3 py-1.5 h-8 flex items-center gap-1.5 transition-colors"
          >
            <span>Manage Goals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {goals.length === 0 ? (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600">
              No financial goals created yet. Set targets for emergencies, education, or
              investments to track progress and get required monthly savings plans.
            </p>
            <Link href="/goals" className="inline-block pt-1">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl"
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
                <span className="text-slate-600">
                  Total Saved:{" "}
                  <strong className="text-slate-900 font-bold">
                    ₹{totalSaved.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </strong>{" "}
                  of ₹{totalGoalTarget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                <span className="font-bold text-blue-600">
                  {totalProgress.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={displayProgress}
                className="h-2.5 bg-slate-100 rounded-full"
                extraStyles="bg-blue-600"
              />
            </div>

            {/* Quick Preview of Top 2 Active Goals */}
            {topActiveGoals.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {topActiveGoals.map((goal) => {
                  const Icon = getGoalIconComponent(goal.icon);
                  const goalProg =
                    goal.targetAmount > 0
                      ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)
                      : 0;

                  return (
                    <div
                      key={goal.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0 shadow-2xs">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">
                            {goal.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            ₹{Number(goal.savedAmount).toLocaleString("en-IN")} / ₹
                            {Number(goal.targetAmount).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-blue-600">
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
