"use client";

import React from "react";
import {
  Target,
  PiggyBank,
  Hourglass,
  Wallet,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function GoalsOverviewCards({ overview }) {
  const {
    totalGoalTarget = 0,
    totalSaved = 0,
    totalRemainingAmount = 0,
    availableBalance = 0,
    activeGoalsCount = 0,
    completedGoalsCount = 0,
    totalGoalsCount = 0,
  } = overview || {};

  const cards = [
    {
      title: "Total Goal Target",
      value: `₹${totalGoalTarget.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `Across ${activeGoalsCount} active goal${
        activeGoalsCount === 1 ? "" : "s"
      }`,
      icon: Target,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border border-blue-200/60",
    },
    {
      title: "Total Saved",
      value: `₹${totalSaved.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "Allocated toward goals",
      icon: PiggyBank,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border border-emerald-200/60",
    },
    {
      title: "Remaining Needed",
      value: `₹${totalRemainingAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "To fully fund all targets",
      icon: Hourglass,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border border-amber-200/60",
    },
    {
      title: "Account Liquidity",
      value: `₹${availableBalance.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "Total balance across accounts",
      icon: Wallet,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 border border-indigo-200/60",
    },
    {
      title: "Active Goals",
      value: activeGoalsCount.toString(),
      subtext:
        totalGoalsCount > 0
          ? `${Math.round((activeGoalsCount / totalGoalsCount) * 100)}% of total targets`
          : "None currently active",
      icon: TrendingUp,
      iconColor: "text-sky-600",
      iconBg: "bg-sky-50 border border-sky-200/60",
    },
    {
      title: "Completed Goals",
      value: completedGoalsCount.toString(),
      subtext:
        completedGoalsCount > 0
          ? "Target successfully met"
          : "Keep allocating to finish your first",
      icon: CheckCircle2,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50 border border-teal-200/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card
            key={i}
            className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
                </div>
              </div>

              <div>
                <p className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
                  {card.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {card.subtext}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
