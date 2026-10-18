"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight, Scale } from "lucide-react";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 30 Days", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

export function AccountChart({ transactions }) {
  const [dateRange, setDateRange] = useState("ALL");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const txList = transactions || [];
    const filtered = txList.filter((t) => {
      if (!range.days) return true;
      const txDate = new Date(t.date);
      const createdDate = t.createdAt ? new Date(t.createdAt) : txDate;
      return txDate >= startDate || createdDate >= startDate;
    });

    const grouped = filtered.reduce((acc, transaction) => {
      const rawDate = new Date(transaction.date);
      const isValid = transaction.date && !isNaN(rawDate.getTime());
      const dateKey = isValid ? format(rawDate, "yyyy-MM-dd") : "N/A";
      const displayDate = isValid ? format(rawDate, "MMM dd") : "N/A";

      if (!acc[dateKey]) {
        acc[dateKey] = {
          dateKey,
          date: displayDate,
          timestamp: isValid ? rawDate.getTime() : 0,
          income: 0,
          expense: 0,
        };
      }
      if (transaction.type === "INCOME") {
        acc[dateKey].income += transaction.amount;
      } else {
        acc[dateKey].expense += transaction.amount;
      }
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  const netBalance = totals.income - totals.expense;

  return (
    <Card className="w-full bg-white border border-slate-200/90 shadow-xs rounded-2xl overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Transaction Activity Overview
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Cash inflow vs outflow over time
          </p>
        </div>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-50 border-slate-200 text-slate-700 rounded-lg">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl">
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="pt-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Total Income</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-600 tabular-nums">
              ₹{totals.income.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Total Expenses</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-xl font-bold text-rose-600 tabular-nums">
              ₹{totals.expense.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Net Flow</span>
              <Scale className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p
              className={`text-xl font-bold tabular-nums ${
                netBalance >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {netBalance >= 0 ? "+" : ""}₹{netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                stroke="#64748b"
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
                stroke="#64748b"
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, undefined]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  color: "#0f172a",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                }}
              />
              <Legend
                wrapperStyle={{ color: "#475569", fontSize: "12px", paddingTop: "8px" }}
              />
              <Bar dataKey="income" name="Income" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#E11D48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
