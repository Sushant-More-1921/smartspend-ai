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
      subtext: `For ${activeGoalsCount} active goal${
        activeGoalsCount === 1 ? "" : "s"
      }`,
      icon: Target,
      gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
      borderColor: "border-purple-500/40",
      iconColor: "text-purple-400",
      valueColor: "bg-gradient-to-r from-purple-300 to-indigo-300",
    },
    {
      title: "Total Saved",
      value: `₹${totalSaved.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "Allocated across all goals",
      icon: PiggyBank,
      gradient: "from-pink-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-pink-500/40",
      iconColor: "text-pink-400",
      valueColor: "bg-gradient-to-r from-pink-400 to-purple-400",
    },
    {
      title: "Remaining Amount",
      value: `₹${totalRemainingAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "Needed to achieve targets",
      icon: Hourglass,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      borderColor: "border-amber-500/40",
      iconColor: "text-amber-400",
      valueColor: "bg-gradient-to-r from-amber-300 to-orange-300",
    },
    {
      title: "Available Balance",
      value: `₹${availableBalance.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "Total in bank accounts",
      icon: Wallet,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/40",
      iconColor: "text-emerald-400",
      valueColor: "bg-gradient-to-r from-emerald-300 to-teal-300",
    },
    {
      title: "Active Goals",
      value: activeGoalsCount.toString(),
      subtext:
        totalGoalsCount > 0
          ? `${Math.round((activeGoalsCount / totalGoalsCount) * 100)}% of total goals`
          : "None created yet",
      icon: TrendingUp,
      gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
      borderColor: "border-blue-500/40",
      iconColor: "text-blue-400",
      valueColor: "bg-gradient-to-r from-blue-300 to-cyan-300",
    },
    {
      title: "Completed Goals",
      value: completedGoalsCount.toString(),
      subtext:
        completedGoalsCount > 0
          ? "Target successfully met!"
          : "Keep going to finish your first",
      icon: CheckCircle2,
      gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
      borderColor: "border-green-500/40",
      iconColor: "text-green-400",
      valueColor: "bg-gradient-to-r from-green-300 to-emerald-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={idx}
            className={`relative bg-[#160a2c]/80 backdrop-blur-md border ${card.borderColor} rounded-2xl overflow-hidden hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-300 hover:scale-[1.02]`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`}
            />
            <CardContent className="p-4 relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-300">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg bg-black/40 ${card.iconColor}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div
                  className={`text-xl font-extrabold bg-clip-text text-transparent ${card.valueColor} tracking-tight`}
                >
                  {card.value}
                </div>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
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
