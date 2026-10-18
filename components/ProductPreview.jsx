"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Target,
  PiggyBank,
  CheckCircle2,
  Sliders,
  Sparkles,
  PieChart,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const sampleMonthlyComparison = [
  { month: "Jun", income: 75000, expense: 48000 },
  { month: "Jul", income: 78000, expense: 51000 },
  { month: "Aug", income: 82000, expense: 49500 },
  { month: "Sep", income: 80000, expense: 53000 },
  { month: "Oct", income: 85000, expense: 52400 },
];

const sampleCategories = [
  { name: "Housing & Rent", pct: 32, amount: "₹16,800", color: "bg-blue-600" },
  { name: "Groceries & Food", pct: 28, amount: "₹14,600", color: "bg-emerald-500" },
  { name: "Utilities & Bills", pct: 18, amount: "₹9,400", color: "bg-indigo-500" },
  { name: "Transport & Travel", pct: 14, amount: "₹7,300", color: "bg-amber-500" },
  { name: "Discretionary", pct: 8, amount: "₹4,300", color: "bg-slate-400" },
];

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'planner' | 'goals'

  return (
    <section id="preview" className="py-24 bg-slate-50 border-t border-slate-200/70">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200/70 text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Application Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            A Living View of Your Finances
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Explore how SmartSpend AI surfaces your income, spending habits, goal milestones,
            and savings capacity in a cohesive interface.
          </p>

          {/* Illustrative Notice Pill */}
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs mt-2">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Illustrative Sample Figures — Non-Personalized Demonstration</span>
          </div>
        </div>

        {/* Interactive Dashboard Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* Top Window Bar */}
          <div className="bg-slate-100/80 px-6 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="ml-2 text-xs font-semibold text-slate-700">
                SmartSpend AI — Intelligence Workspace
              </span>
            </div>

            {/* Quick Preview Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/70 text-xs font-medium">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Financial Overview
              </button>
              <button
                onClick={() => setActiveTab("goals")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "goals"
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Goals & Milestones
              </button>
              <button
                onClick={() => setActiveTab("planner")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "planner"
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Savings & Insights
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* TAB 1: FINANCIAL OVERVIEW */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* 4 Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Total Available Balance</span>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Wallet className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">₹2,48,920</p>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+14.2% from prior period</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Monthly Income</span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-600">₹85,000</p>
                    <span className="text-[11px] text-slate-400">Regular salary & secondary inflows</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Monthly Expenses</span>
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-rose-600">₹52,400</p>
                    <span className="text-[11px] text-slate-400">Within defined monthly limits</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Monthly Surplus</span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <PiggyBank className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-600">₹32,600</p>
                    <span className="text-[11px] text-emerald-600 font-medium">38.3% savings rate</span>
                  </div>
                </div>

                {/* Two Column Section: Income vs Expense Chart & Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Income vs Expense Chart */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          Income vs. Expense History
                        </h4>
                        <p className="text-xs text-slate-500">
                          5-month trend showing positive capital accumulation
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-slate-600">Income</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="text-slate-600">Expense</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-60 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sampleMonthlyComparison} barGap={6}>
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`]}
                            contentStyle={{
                              background: "#ffffff",
                              borderColor: "#e2e8f0",
                              borderRadius: "0.75rem",
                              fontSize: "12px",
                              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                            }}
                          />
                          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-base font-bold text-slate-900">Spending Breakdown</h4>
                        <PieChart className="w-4 h-4 text-slate-400" />
                      </div>

                      <div className="space-y-3.5 pt-4">
                        {sampleCategories.map((cat, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-slate-700">{cat.name}</span>
                              <span className="text-slate-900 font-bold">{cat.amount}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`${cat.color} h-1.5 rounded-full`}
                                style={{ width: `${cat.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic pt-2">
                      Categorized automatically using transaction descriptions and receipt scanner.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: FINANCIAL GOALS PREVIEW */}
            {activeTab === "goals" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Emergency Fund</h4>
                        <span className="text-xs text-slate-500">Target Date: Nov 2026</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Active Goal
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-bold text-blue-600">72%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "72%" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Saved So Far</span>
                      <span className="font-bold text-emerald-600 text-sm">₹72,000</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Target Amount</span>
                      <span className="font-bold text-slate-900 text-sm">₹1,00,000</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Allocations are synchronized with account balances without fake double-counts.</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Workstation Laptop</h4>
                        <span className="text-xs text-slate-500">Target Date: Aug 2026</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      On Track
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-bold text-emerald-600">60%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Saved So Far</span>
                      <span className="font-bold text-emerald-600 text-sm">₹48,000</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Target Amount</span>
                      <span className="font-bold text-slate-900 text-sm">₹80,000</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Requires ₹4,000/month contribution to meet the target date comfortably.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SAVINGS PLANNER & INVESTMENT INSIGHTS */}
            {activeTab === "planner" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Savings Planner Preview */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <h4 className="text-base font-bold text-slate-900">Deterministic Savings Planner</h4>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Feasibility Analysis
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs text-slate-500">Monthly Contribution Required</span>
                    <p className="text-3xl font-black text-slate-900">₹4,500 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                    <p className="text-xs text-emerald-700 font-medium">
                      ✓ Fits comfortably within your estimated monthly surplus (₹32,600/mo).
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Timeline Duration</span>
                      <span className="font-semibold text-slate-900">12 Months</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Surplus Remaining After Goal</span>
                      <span className="font-semibold text-emerald-600">₹28,100 / mo buffer</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>What-If Scenario Simulation</span>
                      <span className="font-semibold text-blue-600">Adjustable in Real-Time</span>
                    </div>
                  </div>
                </div>

                {/* Investment Insights Preview */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-base font-bold text-slate-900">Educational Investment Insights</h4>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Young Investor Guide
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                    <span className="text-xs text-emerald-800 font-semibold">Compounding Growth Projection</span>
                    <p className="text-2xl font-bold text-emerald-700">10% p.a. Assumed Return</p>
                    <p className="text-[11px] text-slate-600">
                      By investing ₹4,500/month in broad market index funds over 5 years, projected value reaches ₹3,52,000 vs ₹2,70,000 cash.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Asset Allocation Concept</span>
                      <span className="font-semibold text-slate-900">70% Equity / 30% Debt/FD</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Risk Horizon Compatibility</span>
                      <span className="font-semibold text-slate-900">Medium to Long Term (3-5+ Yrs)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic pt-1">
                      Educational model for illustrative purposes. Not registered investment advice.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
