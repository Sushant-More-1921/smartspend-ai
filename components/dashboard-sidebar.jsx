"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  PieChart,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Accounts",
  },
  {
    name: "Financial Goals",
    href: "/goals",
    icon: Target,
    description: "Milestones & Planner",
  },
  {
    name: "Future Spend",
    href: "/future-spend",
    icon: TrendingUp,
    description: "Predictive Forecasting",
  },
  {
    name: "Smart Budget",
    href: "/smart-budget",
    icon: PieChart,
    description: "Limits & Alerts",
  },
  {
    name: "Monthly Reports",
    href: "/reports",
    icon: FileText,
    description: "Statements & Insights",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-24 self-start bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-6">
        
        {/* Sidebar Header */}
        <div className="px-2 pt-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Navigation</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            Finance Hub
          </h3>
        </div>

        {/* Feature Navigation Links */}
        <nav className="space-y-1.5" aria-label="Dashboard Feature Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/70 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className={`truncate ${isActive ? "font-bold text-blue-900" : "font-medium"}`}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive
                      ? "text-blue-600 translate-x-0.5"
                      : "text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Footer Hint / Context */}
        <div className="pt-2 border-t border-slate-100 px-2 text-[11px] text-slate-400">
          <p>SmartSpend AI Intelligence Workspace</p>
        </div>
      </aside>

      {/* MOBILE / TABLET NAVIGATION RIBBON */}
      <div className="lg:hidden w-full mb-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
