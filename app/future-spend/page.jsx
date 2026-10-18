"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CheckCircle2, TrendingUp, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export default function FutureSpendPage() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchForecast = useCallback(async (promptText = "") => {
    try {
      setError(null);
      const res = await fetch("/api/future-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "User not found in database") {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Unexpected error occurred");

      setResult({
        summary: Array.isArray(data.summary) ? data.summary : [],
        budget: Number(data.budget) || 0,
        spent: Number(data.spentThisMonth ?? data.spent) || 0,
        remaining: Number(data.remaining) || 0,
        monthlyProjection: Array.isArray(data.monthlyProjection)
          ? data.monthlyProjection.map((m) => ({
              month: m.month || "N/A",
              value: Number(m.value) || 0,
            }))
          : [],
      });
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setError("Failed to get prediction. Please try again later.");
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setInitialLoading(true);
      await fetchForecast("");
      if (isMounted) setInitialLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchForecast]);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError("Please enter a valid question or scenario.");
      return;
    }

    setLoading(true);
    await fetchForecast(userInput);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
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

        {/* Page Header */}
        <PageHeader
          title="Future Spend Predictor"
          subtitle="Forecast multi-month expenditure and simulate future purchasing scenarios using local time-series analytics."
          badge="Proactive Forecasting"
        />

        {/* Simulator Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Scenario Simulator
            </label>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Simulate trips, purchases, or major expenses
            </span>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder='Example: "If I go on a trip to Goa for 5 days costing ₹15,000, how will it affect my budget this month?"'
            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-28 text-sm transition-all"
          />

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-400">
              Your financial records are evaluated locally without external AI APIs.
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Simulating..." : "Run Simulation"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Initial Loading Spinner */}
        {initialLoading && (
          <div className="p-12 rounded-2xl bg-white border border-slate-200/90 flex flex-col items-center justify-center space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Computing time-series forecasting model & baseline...
            </p>
          </div>
        )}

        {/* Forecast Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Key Insights */}
              {result.summary.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-blue-600 w-5 h-5" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Key Projections & Insights
                    </h2>
                  </div>
                  <ul className="space-y-2.5">
                    {result.summary.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed"
                      >
                        <CheckCircle2 className="text-emerald-600 mt-0.5 w-4 h-4 shrink-0" />
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Budget Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Monthly Budget
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    ₹{result.budget.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Configured threshold</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Current Spend
                  </span>
                  <p className="text-2xl font-extrabold text-rose-600 mt-1">
                    ₹{result.spent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Elapsed month to date</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Remaining Buffer
                  </span>
                  <p className={`text-2xl font-extrabold mt-1 ${result.remaining >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ₹{result.remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Available before deficit</p>
                </div>
              </div>

              {/* 4-Month Projection Chart */}
              {result.monthlyProjection.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      4-Month Expenditure Forecast
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Recency-weighted baseline projection including simulated scenario impacts
                    </p>
                  </div>
                  <div className="h-72 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.monthlyProjection}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                            color: "#0f172a",
                          }}
                          labelStyle={{ color: "#64748b", fontWeight: 600 }}
                          formatter={(value) => [
                            `₹${Number(value).toLocaleString("en-IN")}`,
                            "Projected Spend",
                          ]}
                        />
                        <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
