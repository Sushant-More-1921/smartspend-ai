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
    className: "border-blue-200 text-blue-700 bg-blue-50 font-semibold",
  };

  if (isCompleted) {
    statusBadge = {
      label: "Completed",
      className: "border-emerald-200 text-emerald-700 bg-emerald-50 font-semibold",
    };
  } else if (isOverdue) {
    statusBadge = {
      label: "Overdue",
      className: "border-rose-200 text-rose-700 bg-rose-50 font-semibold",
    };
  } else if (savedAmount === 0) {
    statusBadge = {
      label: "Not Started",
      className: "border-slate-200 text-slate-600 bg-slate-100",
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
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group flex flex-col justify-between overflow-hidden">
      <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        {/* Top Header: Icon + Name + Category + Dropdown */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isCompleted
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                    : isOverdue
                    ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                    : "bg-blue-50 text-blue-600 border border-blue-200/60"
                }`}
              >
                {React.createElement(getGoalIconComponent(goal.icon), { className: "w-5 h-5" })}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {goal.name}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {goal.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.className}`}>
                {statusBadge.label}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white border-slate-200 text-slate-800 rounded-xl w-48 shadow-lg"
                >
                  <DropdownMenuItem
                    onClick={() => onAddMoney(goal)}
                    className="cursor-pointer text-xs"
                  >
                    <PlusCircle className="mr-2 h-4 w-4 text-blue-600" />
                    Add Money
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onOpenPlanner(goal)}
                    className="cursor-pointer text-xs"
                  >
                    <Calculator className="mr-2 h-4 w-4 text-indigo-600" />
                    Plan & Simulate
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onEdit(goal)}
                    className="cursor-pointer text-xs"
                  >
                    <Edit className="mr-2 h-4 w-4 text-slate-600" />
                    Edit Goal
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onViewHistory(goal)}
                    className="cursor-pointer text-xs"
                  >
                    <History className="mr-2 h-4 w-4 text-slate-600" />
                    View History
                  </DropdownMenuItem>

                  {savedAmount > 0 && (
                    <DropdownMenuItem
                      onClick={() => onWithdraw(goal)}
                      className="cursor-pointer text-xs text-amber-700"
                    >
                      <ArrowDownLeft className="mr-2 h-4 w-4 text-amber-600" />
                      Release Funds
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-slate-100" />

                  <DropdownMenuItem
                    onClick={() => onDelete(goal)}
                    className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {goal.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
              &ldquo;{goal.description}&rdquo;
            </p>
          )}
        </div>

        {/* Financial Progress & Amounts */}
        <div className="space-y-3 pt-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Allocated</span>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                ₹{savedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Target</span>
              <div className="text-sm font-bold text-slate-700">
                ₹{targetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Progress Bar with Color states */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-bold text-blue-600">
                {rawProgress.toFixed(1)}%
              </span>
              <span className="text-slate-500">
                {isCompleted ? (
                  <span className="text-emerald-600 font-semibold">Goal Achieved!</span>
                ) : (
                  `₹${remainingAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} needed`
                )}
              </span>
            </div>
            <Progress
              value={displayProgress}
              className="h-2 bg-slate-100 rounded-full"
              extraStyles={
                isCompleted
                  ? "bg-emerald-500"
                  : isOverdue
                  ? "bg-rose-500"
                  : "bg-blue-600"
              }
            />
          </div>
        </div>

        {/* Target Date, Time Remaining, and Required Monthly Contribution */}
        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {targetDate ? format(targetDate, "dd MMM yyyy") : "No deadline"}
              </span>
            </div>
            {targetDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span
                  className={
                    isOverdue
                      ? "text-rose-600 font-semibold"
                      : isCompleted
                      ? "text-emerald-600 font-medium"
                      : "text-slate-600 font-medium"
                  }
                >
                  {monthlyCalc?.timeText || "N/A"}
                </span>
              </div>
            )}
          </div>

          {/* Required Monthly Contribution Pill */}
          {!isCompleted && targetDate && monthlyCalc?.requiredMonthly !== null && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Required Monthly:
              </span>
              <span className="font-bold text-slate-900">
                ₹{monthlyCalc.requiredMonthly.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="text-[10px] text-slate-400 font-normal">
                  /mo
                </span>
              </span>
            </div>
          )}

          {isCompleted && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Target fully funded!
            </div>
          )}
        </div>

        {/* Card Actions Button Row */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            onClick={() => onAddMoney(goal)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold py-2 h-9 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Money
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenPlanner(goal)}
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold py-2 h-9 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            Plan & What-If
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
