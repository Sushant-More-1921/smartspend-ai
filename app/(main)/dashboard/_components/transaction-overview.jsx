"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Clean, curated pastel fintech chart palette
const COLORS = [
  "#2563EB", // Blue
  "#059669", // Emerald
  "#7C3AED", // Violet
  "#D97706", // Amber
  "#0284C7", // Sky
  "#E11D48", // Rose
  "#0D9488", // Teal
  "#4F46E5", // Indigo
];

const TIME_RANGES = {
  THIS_MONTH: "This Month",
  "30D": "Last 30 Days",
  "90D": "Last 3 Months",
  ALL: "All Time",
};

export function DashboardOverview({ accounts = [], transactions = [] }) {
  const [selectedAccountId, setSelectedAccountId] = useState("ALL");
  const [timeRange, setTimeRange] = useState("THIS_MONTH");

  const accountTransactions = useMemo(() => {
    return (transactions || []).filter((t) => {
      if (!selectedAccountId || selectedAccountId === "ALL") return true;
      return t.accountId === selectedAccountId;
    });
  }, [transactions, selectedAccountId]);

  // Ensure most recently recorded transactions are always at the top of Recent Transactions
  const recentTransactions = useMemo(() => {
    return [...accountTransactions]
      .sort((a, b) => {
        const timeB = new Date(b.createdAt || b.date).getTime();
        const timeA = new Date(a.createdAt || a.date).getTime();
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [accountTransactions]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
      0, 0, 0, 0
    );

    return accountTransactions.filter((t) => {
      if (t.type !== "EXPENSE") return false;

      const tDate = new Date(t.date);
      const cDate = t.createdAt ? new Date(t.createdAt) : tDate;

      if (timeRange === "THIS_MONTH") {
        const inThisMonthByDate =
          tDate.getMonth() === currentDate.getMonth() &&
          tDate.getFullYear() === currentDate.getFullYear();
        const inThisMonthByCreated =
          cDate >= startOfMonth;
        return inThisMonthByDate || inThisMonthByCreated;
      }

      if (timeRange === "30D") {
        const cutoff = startOfDay(subDays(now, 30));
        return tDate >= cutoff || cDate >= cutoff;
      }

      if (timeRange === "90D") {
        const cutoff = startOfDay(subDays(now, 90));
        return tDate >= cutoff || cDate >= cutoff;
      }

      return true; // ALL
    });
  }, [accountTransactions, timeRange]);

  const expensesByCategory = useMemo(() => {
    return filteredExpenses.reduce((acc, transaction) => {
      const category = transaction.category || "other-expense";
      if (!acc[category]) acc[category] = 0;
      acc[category] += transaction.amount;
      return acc;
    }, {});
  }, [filteredExpenses]);

  const pieChartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace("-", " "),
      value: amount,
    }));
  }, [expensesByCategory]);

  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredExpenses]);

  const totalAllTimeExpenses = useMemo(() => {
    return accountTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [accountTransactions]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Transactions */}
      <Card className="bg-white border border-slate-200/90 shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Recent Transactions
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest recorded account activity
            </p>
          </div>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-50 border-slate-200 text-slate-700 rounded-lg">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl">
              <SelectItem value="ALL" className="text-xs">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-xs">
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent transactions found</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold leading-snug text-slate-900 truncate"
                      title={transaction.description || "Untitled Transaction"}
                    >
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500 shrink-0">
                        {transaction.date && !isNaN(new Date(transaction.date).getTime())
                          ? format(new Date(transaction.date), "MMM d, yyyy")
                          : "N/A"}
                      </p>
                      {transaction.category && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-2 h-4 text-slate-600 bg-slate-100 border-slate-200/60 font-medium shrink-0"
                        >
                          {transaction.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center text-sm font-bold shrink-0 whitespace-nowrap tabular-nums",
                      transaction.type === "EXPENSE"
                        ? "text-rose-600"
                        : "text-emerald-600"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? (
                      <ArrowDownRight className="mr-1 h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>
                      {transaction.type === "EXPENSE" ? "-" : "+"}₹{transaction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="bg-white border border-slate-200/90 shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Expense Breakdown
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Total: <span className="text-slate-900 font-semibold">₹{totalExpenseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-slate-50 border-slate-200 text-slate-700 rounded-lg">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl">
              {Object.entries(TIME_RANGES).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-4">
          {pieChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-slate-400 text-center px-4 space-y-3">
              <p className="text-sm">No expenses recorded for {TIME_RANGES[timeRange].toLowerCase()}</p>
              {totalAllTimeExpenses > 0 && timeRange !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setTimeRange("ALL")}
                  className="text-xs text-blue-600 hover:text-blue-700 underline underline-offset-4 font-medium"
                >
                  View all-time expenses (₹{totalAllTimeExpenses.toFixed(2)})
                </button>
              )}
            </div>
          ) : (
            <div className="h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    fontSize={11}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Expense"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.75rem",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                      color: "#0f172a",
                    }}
                    itemStyle={{ color: "#0f172a", fontWeight: 600 }}
                    labelStyle={{ color: "#64748b" }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#475569", fontSize: "12px", paddingTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
