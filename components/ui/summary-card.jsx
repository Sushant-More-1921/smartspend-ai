import React from "react";
import { cn } from "@/lib/utils";

export function SummaryCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  trend,
  className,
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {Icon && (
          <div className={cn("p-2 rounded-lg flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        {(subtext || trend) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {trend.value}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
