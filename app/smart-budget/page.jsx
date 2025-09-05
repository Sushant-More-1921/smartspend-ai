// app/smart-budget/page.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";

const playfair = Poppins({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});


export default function SmartBudgetPage() {
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
    if (saved) setEmail(saved);
  }, []);

  const generateRecommendation = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email (used to fetch past spend).");
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
        body: JSON.stringify({ email, total_budget: Number(budget) }),
      });

      const data = await res.json();
      if (data?.error) {
        setError(data.error || "Failed to get recommendation");
      } else {
        setRecommendation(data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f051d] via-[#1a093c] to-[#120623] text-white pt-20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl mx-auto"
      >
        <h1
            className={`${playfair.className} mt-4 text-2xl sm:text-6xl lg:text-5xl text-center font-medium tracking-widest bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}
          >
            Smart budget Recommendation
          </h1>

        <motion.div
          initial={{ opacity: 0, scale: 1}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="mt-8 bg-[#1e1133] shadow-lg rounded-2xl p-8 space-y-4 border border-purple-800/30 hover:shadow-purple-600/60 transition"
        >
          <p className="text-gray-300">
            Get personalized budget suggestions based on your spending patterns.
          </p>

          <input
            type="email"
            placeholder="Your account email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg bg-[#0f051d] border-purple-700/40 text-white placeholder-gray-400"
          />

          <input
            type="number"
            placeholder="Enter total monthly budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full p-3 border rounded-lg bg-[#0f051d] border-purple-700/40 text-white placeholder-gray-400"
          />

          <div className="flex gap-3">
            <button
              onClick={generateRecommendation}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow hover:opacity-90 transition"
            >
              {loading ? "Calculating..." : "Generate Recommendation"}
            </button>
          </div>

          {error && <div className="text-red-400 mt-2">{error}</div>}

          {recommendation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <h2 className="text-xl font-semibold text-gray-200">
                Recommended Monthly Limit:{" "}
                <span className="text-purple-400">
                  ${recommendation.monthlyLimit}
                </span>
              </h2>

              <ul className="mt-4 space-y-2">
                {recommendation.suggestedCategories.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between bg-[#0f051d] p-3 rounded-md shadow border border-purple-800/30"
                  >
                    <span className="font-medium text-gray-300">
                      {item.category}
                    </span>
                    <span className="text-gray-400">
                      ${item.limit} ({item.percent}%)
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
