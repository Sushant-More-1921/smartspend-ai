"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { ArrowLeft, FileSpreadsheet, FileText, Loader2, TrendingUp, TrendingDown, PiggyBank, Scale } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const currencyINR = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

export default function ReportsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("month"); // day, week, month, year
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingFormat, setExportingFormat] = useState(null); // 'pdf' | 'excel' | null
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    fetch(`/api/reports?filter=${filter}&date=${date}`)
      .then(async (res) => {
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          if (res.status === 401 || errJson.error === "Unauthorized" || errJson.error === "User not found in database") {
            router.push(`/sign-in?redirect_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`);
            return;
          }
          throw new Error(errJson.error || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isCancelled) {
          setReport(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Error fetching report:", err);
          setError(err.message || "Fetch failed");
          setReport(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [filter, date, router]);

  async function exportReport(format) {
    try {
      setExportingFormat(format);
      const res = await fetch(
        `/api/reports?format=${format}&filter=${filter}&date=${date}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Export failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const ext = format === "pdf" ? "pdf" : "xlsx";
      const filename = `SmartReport-${filter}-${date}.${ext}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert(err.message || "Export failed. Please try again.");
    } finally {
      setExportingFormat(null);
    }
  }

  const chartData =
    report?.trend?.map((d) => ({
      ...d,
      income: Number(d.income),
      expense: Number(d.expense),
      date: d.dateLabel || d.date,
    })) || [];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Financial Reports & Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review periodical statements and export compliance summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setLoading(true);
              }}
              className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setLoading(true);
              }}
              className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Generating analytical statements...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-sm">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        ) : !report ? (
          <div className="py-24 flex items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No transaction records found for this period.
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Total Income</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                  {currencyINR(Number(report.totalIncome))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Total Expenses</span>
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
                  {currencyINR(Number(report.totalExpenses))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Net Savings</span>
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-blue-600 tabular-nums">
                  {currencyINR(Number(report.savings))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Net Change</span>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    <Scale className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-2xl font-extrabold tabular-nums ${Number(report.netChange) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {currencyINR(Number(report.netChange))}
                </div>
              </div>
            </div>

            {/* Income vs Expenses Chart Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Income vs Expenses Trajectory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual cash flow balance for the selected timeframe
                </p>
              </div>

              <div className="w-full h-[320px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      formatter={(val, name) => [
                        currencyINR(Number(val)),
                        name === "income" ? "Income" : "Expense",
                      ]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                        color: "#0f172a",
                      }}
                    />
                    <Legend
                      formatter={(value) => (value === "income" ? "Income" : "Expense")}
                      wrapperStyle={{ color: "#475569", paddingTop: 10, fontSize: "12px" }}
                    />
                    <Bar dataKey="income" name="income" fill="#059669" radius={[4, 4, 0, 0]} barSize={26} />
                    <Bar dataKey="expense" name="expense" fill="#E11D48" radius={[4, 4, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Export Actions Strip */}
            <div className="flex flex-wrap gap-3 justify-end pt-2">
              <Button
                onClick={() => exportReport("pdf")}
                disabled={!!exportingFormat}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold px-5 py-2.5 h-10 shadow-xs flex items-center gap-2"
              >
                {exportingFormat === "pdf" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>Export PDF Statement</span>
              </Button>

              <Button
                onClick={() => exportReport("excel")}
                disabled={!!exportingFormat}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 py-2.5 h-10 shadow-xs flex items-center gap-2"
              >
                {exportingFormat === "excel" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>Export Excel Spreadsheet</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
