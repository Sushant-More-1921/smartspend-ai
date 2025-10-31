"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

export default function FutureSpendPage() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError("Please enter a valid question.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/future-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unexpected error occurred");

      setResult({
        summary: Array.isArray(data.summary) ? data.summary : [],
        budget: Number(data.budget) || 0,
        spent: Number(data.spentThisMonth) || 0,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f051d] via-[#1a093c] to-[#120623] text-white p-6">
      <div className="max-w-4xl mt-16  mx-auto">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Future Spend Predictor
        </motion.h1>

        {/* Text Area */}
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder='Example: "If I go on a trip to Goa for 5 days, how will it affect my budget this month?"'
          className="w-full p-4 rounded-xl bg-black/40 border border-purple-500/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-600 outline-none resize-none h-32 text-gray-200 placeholder-gray-500"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(139,92,246,0.8)] font-semibold"
        >
          {loading ? "Simulating..." : "Run Simulation"}
        </button>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-500/20 border border-red-400 text-red-300 rounded-lg"
          >
             {error}
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="mt-10 p-8 rounded-xl bg-black/40 border border-purple-500/30 shadow-lg space-y-8 backdrop-blur-sm"
            >
              {/*Insights Section */}
              {result.summary.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="text-purple-400 w-6 h-6" />
                    <h2 className="text-2xl font-bold text-purple-400">Key Insights</h2>
                  </div>
                  <ul className="space-y-3">
                    {result.summary.map((point, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-start gap-3 bg-purple-900/20 border border-purple-700/30 rounded-lg p-3 hover:bg-purple-900/30 transition-all duration-300"
                      >
                        <CheckCircle2 className="text-green-400 mt-1 w-5 h-5 flex-shrink-0" />
                        <span className="text-gray-300 leading-relaxed">{point.trim()}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Budget Overview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center"
              >
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 shadow-md">
                  <p className="text-2xl font-extrabold text-purple-300">₹{result.budget}</p>
                  <p className="text-gray-400 text-sm mt-1">Budget</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/20 to-red-500/10 border border-pink-500/30 shadow-md">
                  <p className="text-2xl font-extrabold text-pink-300">₹{result.spent}</p>
                  <p className="text-gray-400 text-sm mt-1">Spent</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 shadow-md">
                  <p className="text-2xl font-extrabold text-green-300">₹{result.remaining}</p>
                  <p className="text-gray-400 text-sm mt-1">Remaining</p>
                </div>
              </motion.div>

              {/* Monthly Projection Chart */}
              {result.monthlyProjection.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-2xl font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    4-Month Projection
                  </h2>
                  <div className="h-72 bg-black/30 rounded-lg p-4 border border-purple-500/20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.monthlyProjection}>
                        <XAxis dataKey="month" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip
                          contentStyle={{
                            background: "#1a093c",
                            border: "1px solid #444",
                            borderRadius: "10px",
                          }}
                          labelStyle={{ color: "#fff" }}
                        />
                        <Bar dataKey="value" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
