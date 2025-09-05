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
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [end, hasAnimated]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{
        opacity: [0, 1, 0.9, 1],
        y: [20, 0],
        transition: { duration: 1, ease: "easeInOut" },
      }}
      viewport={{ once: true }}
      onViewportEnter={() => setHasAnimated(true)}
      className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
    >
      {count}
      {suffix}
    </motion.span>
  );
};

const AnimatedStats = () => {
  const stats = [
    { end: 120, suffix: "hr+", label: "Development Hours" },
    { end: 3, suffix: "k+", label: "Lines of Code" },
    { end: 80, suffix: "%", label: "ML Model Accuracy" },
    { end: 6, suffix: "", label: "Frameworks & Libraries" },
  ];

  return (
    <section className="relative py-10 text-white text-center">
      
    <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 "
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Things We Have Done 
        </motion.h2>
      <div className="relative container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.07,
              boxShadow: "0px 0px 25px rgba(168, 85, 247, 0.5)",
            }}
            className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm border border-purple-500/20 transition-all"
          >
            <h2 className="text-4xl font-bold">
              <Counter end={stat.end} suffix={stat.suffix} />
            </h2>
            <p className="text-gray-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AnimatedStats;
