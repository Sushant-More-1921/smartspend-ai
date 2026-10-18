"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Counter = ({ end, suffix }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) return;

    let start = 0;
    const duration = 1000;
    const stepTime = Math.max(10, Math.floor(duration / (end || 1)));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [end, hasAnimated]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 12 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      }}
      viewport={{ once: true }}
      onViewportEnter={() => setHasAnimated(true)}
      className="text-slate-900 font-bold"
    >
      {count}
      {suffix}
    </motion.span>
  );
};

const AnimatedStats = () => {
  const stats = [
    { end: 120, suffix: "+", label: "Financial Checkpoints" },
    { end: 99, suffix: ".9%", label: "Uptime & Accuracy" },
    { end: 85, suffix: "%", label: "Average Savings Uplift" },
    { end: 4, suffix: " Mo", label: "Proactive Projections" },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-200/70 py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Engineered for disciplined financial growth
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Backed by mathematical time-series forecasting and intelligent budget automation.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs text-center"
            >
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                <Counter end={stat.end} suffix={stat.suffix} />
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;
