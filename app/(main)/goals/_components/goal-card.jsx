"use client";

import React from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MoreVertical,
  PlusCircle,
  Edit,
  History,
  Trash2,
  ArrowDownLeft,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getGoalIconComponent } from "@/lib/goal-icons";
import { calculateRequiredMonthlyContribution } from "@/lib/financial-planner";


export function GoalCard({
  goal,
  onAddMoney,
  onEdit,
  onViewHistory,
  onWithdraw,
  onDelete,
  onOpenPlanner,
}) {
  const targetAmount = Number(goal.targetAmount) || 0;
  const savedAmount = Number(goal.savedAmount) || 0;
  const remainingAmount = Math.max(0, targetAmount - savedAmount);

  // Progress percentage capped at 100% for progress bar
  const rawProgress = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
  const displayProgress = Math.min(100, Math.max(0, rawProgress));

  // Determine actual status
  const now = new Date();
  const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
  const isCompleted = savedAmount >= targetAmount && targetAmount > 0;
  const isOverdue = !isCompleted && targetDate && targetDate < now;

  let statusBadge = {
    label: "In Progress",
    className:
      "border-purple-500/50 text-purple-300 bg-purple-950/40",
  };

  if (isCompleted) {
    statusBadge = {
      label: "Completed",
      className:
        "border-green-500/50 text-green-300 bg-green-950/40 font-semibold",
    };
  } else if (isOverdue) {
    statusBadge = {
      label: "Overdue",
      className: "border-red-500/50 text-red-300 bg-red-950/40 font-semibold",
    };
  } else if (savedAmount === 0) {
    statusBadge = {
      label: "Not Started",
      className: "border-gray-500/50 text-gray-400 bg-gray-900/40",
    };
  }

  // Calculate required monthly contribution
  const monthlyCalc = calculateRequiredMonthlyContribution({
    targetAmount,
    savedAmount,
    targetDate: goal.targetDate,
    expectedReturnRate: goal.expectedReturnRate || 0,
  });

  return (
    <Card className="relative bg-[#1a0e30]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl overflow-hidden hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all duration-300 hover:scale-[1.01] group flex flex-col justify-between">
      {/* Background glass shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 pointer-events-none" />

      <CardContent className="p-5 relative z-10 space-y-4 flex-1 flex flex-col justify-between">
        {/* Top Header: Icon + Name + Category + Dropdown */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isCompleted
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : isOverdue
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                }`}
              >
                {React.createElement(getGoalIconComponent(goal.icon), {
                  className: "w-6 h-6",
                })}
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {goal.name}
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  {goal.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-purple-900/40 rounded-full"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#180a2e] border-purple-800/40 text-gray-200 rounded-xl w-48 shadow-2xl"
                >
                  <DropdownMenuItem
                    onClick={() => onAddMoney(goal)}
                    className="hover:bg-purple-900/40 hover:text-white cursor-pointer"
                  >
                    <PlusCircle className="mr-2 h-4 w-4 text-purple-400" />
                    Add Money
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onOpenPlanner(goal)}
                    className="hover:bg-purple-900/40 hover:text-white cursor-pointer"
                  >
                    <Calculator className="mr-2 h-4 w-4 text-indigo-400" />
                    Plan & Simulate
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onEdit(goal)}
                    className="hover:bg-purple-900/40 hover:text-white cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4 text-blue-400" />
                    Edit Goal
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onViewHistory(goal)}
                    className="hover:bg-purple-900/40 hover:text-white cursor-pointer"
                  >
                    <History className="mr-2 h-4 w-4 text-pink-400" />
                    View History
                  </DropdownMenuItem>

                  {savedAmount > 0 && (
                    <DropdownMenuItem
                      onClick={() => onWithdraw(goal)}
                      className="hover:bg-purple-900/40 hover:text-amber-300 cursor-pointer"
                    >
                      <ArrowDownLeft className="mr-2 h-4 w-4 text-amber-400" />
                      Release Funds
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-purple-800/40" />

                  <DropdownMenuItem
                    onClick={() => onDelete(goal)}
                    className="hover:bg-red-950/50 hover:text-red-300 text-red-400 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {goal.description && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic">
              &ldquo;{goal.description}&rdquo;
            </p>
          )}
        </div>

        {/* Financial Progress & Amounts */}
        <div className="space-y-3 pt-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-gray-400">Current Saved</span>
              <div className="text-2xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                ₹{savedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-400">Target</span>
              <div className="text-sm font-semibold text-gray-200">
                ₹{targetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Progress Bar with Color states */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-300">
              <span className="font-semibold text-purple-300">
                {rawProgress.toFixed(1)}%
              </span>
              <span className="text-gray-400">
                {isCompleted ? (
                  <span className="text-green-400 font-medium">Goal Achieved!</span>
                ) : (
                  `₹${remainingAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })} remaining`
                )}
              </span>
            </div>
            <Progress
              value={displayProgress}
              className="h-2.5 bg-gray-900/60 rounded-full"
              extraStyles={
                isCompleted
                  ? "bg-green-500"
                  : isOverdue
                  ? "bg-red-500"
                  : rawProgress >= 75
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-purple-600"
              }
            />
          </div>
        </div>

        {/* Target Date, Time Remaining, and Required Monthly Contribution */}
        <div className="space-y-2 pt-2 border-t border-purple-800/30 text-xs">
          <div className="flex items-center justify-between text-gray-300">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {targetDate ? format(targetDate, "dd MMM yyyy") : "No deadline"}
              </span>
            </div>
            {targetDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                <span
                  className={
                    isOverdue
                      ? "text-red-400 font-semibold"
                      : isCompleted
                      ? "text-green-400 font-medium"
                      : "text-gray-300"
                  }
                >
                  {monthlyCalc?.timeText || "N/A"}
                </span>
              </div>
            )}
          </div>

          {/* Required Monthly Contribution Pill */}
          {!isCompleted && targetDate && monthlyCalc?.requiredMonthly !== null && (
            <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Required Monthly:
              </span>
              <span className="font-bold text-amber-300">
                ₹{monthlyCalc.requiredMonthly.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
                <span className="text-[10px] text-gray-400 font-normal">
                  /mo
                </span>
              </span>
            </div>
          )}

          {isCompleted && (
            <div className="p-2 rounded-xl bg-green-950/30 border border-green-800/40 flex items-center justify-center gap-1.5 text-green-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Target fully funded!
            </div>
          )}
        </div>

        {/* Card Actions Button Row */}
        <div className="grid grid-cols-2 gap-2 pt-3">
          <Button
            onClick={() => onAddMoney(goal)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-semibold py-1.5 h-9 shadow-md flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Add Money
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenPlanner(goal)}
            className="w-full border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-900/30 rounded-xl text-xs font-semibold py-1.5 h-9 flex items-center justify-center gap-1.5"
          >
            <Calculator className="w-4 h-4" />
            Plan & What-If
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
