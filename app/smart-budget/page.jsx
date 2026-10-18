"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SmartBudgetPage() {
  const router = useRouter();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("user_email") || "";
    }
    return "";
  });

  const [prevUserEmail, setPrevUserEmail] = useState(userEmail);
  if (userEmail && userEmail !== prevUserEmail) {
    setPrevUserEmail(userEmail);
    setEmail(userEmail);
  }

  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendation, setRecommendation] = useState(null);

  const generateRecommendation = async () => {
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError("Invalid Email");
      return;
    }

    if (!budget || Number(budget) <= 0) {
      setError("Enter a valid budget amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/smart-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), total_budget: Number(budget) }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || data?.error === "Unauthorized" || data?.error === "User not found in database") {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`);
        return;
      }
      if (data?.error) {
        setError(data.error || "Failed to get recommendation");
      } else {
        setRecommendation(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_email", email.trim());
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        
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
          title="Smart Budget Recommendation"
          subtitle="Generate tailored category allocation recommendations based on machine-learned spending patterns."
          badge="Intelligent Allocations"
        />

        {/* Budget Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Configure Your Budget Target</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your account email and target monthly spending cap to generate an optimal distribution.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Account Email</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm bg-white border-slate-300 text-slate-900 focus:border-blue-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Total Monthly Budget (₹)</label>
              <Input
                type="number"
                placeholder="e.g., 25000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="h-10 text-sm bg-white border-slate-300 text-slate-900 focus:border-blue-500 rounded-xl"
              />
            </div>

            <Button
              onClick={generateRecommendation}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-10 shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Historical Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Allocation Recommendation</span>
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Recommendation Results */}
          {recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="pt-6 border-t border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <span className="text-xs font-semibold text-slate-700">Recommended Monthly Ceiling:</span>
                <span className="text-lg font-bold text-blue-700">
                  ₹{Number(recommendation.monthlyLimit).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recommended Category Distribution
                </p>
                <div className="space-y-2">
                  {recommendation.suggestedCategories.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-900">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-800">
                          ₹{Number(item.limit).toLocaleString("en-IN")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold text-[10px]">
                          {item.percent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
