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
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

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

const COLORS = [
  "#A855F7",
  "#EC4899",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#6366F1",
  "#14B8A6",
  "#F43F5E",
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
      <Card className="relative bg-[#1a1a1a]/80 border border-gray-700 shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
          <CardTitle className="text-base font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[150px] bg-transparent border border-gray-600 text-white">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border border-gray-700 text-gray-200">
              <SelectItem value="ALL">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No recent transactions found
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 border-b border-gray-800/80 pb-3 last:border-none"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p
                      className="text-sm font-medium leading-snug text-white truncate"
                      title={transaction.description || "Untitled Transaction"}
                    >
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400 shrink-0">
                        {transaction.date && !isNaN(new Date(transaction.date).getTime())
                          ? format(new Date(transaction.date), "PP")
                          : "N/A"}
                      </p>
                      {transaction.category && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 h-4 text-purple-300 border-purple-500/30 bg-purple-950/20 shrink-0"
                        >
                          {transaction.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center text-sm font-semibold shrink-0 whitespace-nowrap tabular-nums",
                      transaction.type === "EXPENSE"
                        ? "text-red-400"
                        : "text-green-400"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? (
                      <ArrowDownRight className="mr-1.5 h-4 w-4 shrink-0" />
                    ) : (
                      <ArrowUpRight className="mr-1.5 h-4 w-4 shrink-0" />
                    )}
                    <span>
                      {transaction.type === "EXPENSE" ? "-" : "+"}₹{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="relative bg-[#1a1a1a]/80 border border-gray-700 shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
          <div>
            <CardTitle className="text-base font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Expense Breakdown
            </CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              Total: <span className="text-purple-300 font-medium">₹{totalExpenseAmount.toFixed(2)}</span>
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-transparent border border-gray-600 text-white text-xs">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border border-gray-700 text-gray-200">
              {Object.entries(TIME_RANGES).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0 pb-5 relative z-10">
          {pieChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-gray-400 text-center px-4 space-y-3">
              <p className="text-sm">No expenses recorded for {TIME_RANGES[timeRange].toLowerCase()}</p>
              {totalAllTimeExpenses > 0 && timeRange !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setTimeRange("ALL")}
                  className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4"
                >
                  View all-time expenses (₹{totalAllTimeExpenses.toFixed(2)})
                </button>
              )}
            </div>
          ) : (
            <div className="h-[280px] text-white">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                    fontSize={11}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#1a1a1a"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Expense"]}
                    contentStyle={{
                      backgroundColor: "#1f1035",
                      border: "1px solid #7c3aed",
                      borderRadius: "0.75rem",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                    itemStyle={{ color: "#f3e8ff", fontWeight: 500 }}
                    labelStyle={{ color: "#d8b4fe" }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#cccccc", fontSize: "12px", paddingTop: "8px" }}
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
