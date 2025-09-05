"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lobster } from "next/font/google";

// Coca-Cola style script-like font
const cocaColaFont = Lobster({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4800); // total duration
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  // Exactly 9 strips
  const strips = Array.from({ length: 9 });

  // Different red shades for strip difference
  const colors = [
    "#365bea",
    "#3f58eb",
    "#524fea",
    "#6149eb",
    "#793eea",
    "#7c3dea",
    "#783aea",
    "#8000ea",
    "#8639ea",
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden">
      {/* Falling & fading strips */}
      {strips.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "-120%", opacity: 1 }}
          animate={{ y: "0%", opacity: 0 }} // settle, then fade out
          transition={{
            duration: 2.6,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
          className="absolute h-[160%] rounded-full"
          style={{
            left: `${i * (100 / strips.length)}%`,
            width: `${100 / strips.length}%`, // no gaps
            backgroundColor: colors[i % colors.length],
          }}
        />
      ))}

      {/* Center Coca-Cola style text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5, duration: 1.5, ease: "easeOut" }}
        className="z-20 text-center"
      >
        <motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: [0, 1, 1, 0] }} // fade in → hold → fade out
  transition={{
    times: [0, 0.3, 0.7, 1], // control keyframe timing
    delay: 2.8,
    duration: 2.1, // 1.5s fade in + 0.6s hold
    ease: "easeOut",
  }}
  className={`${cocaColaFont.className} text-white text-6xl`}
>
 SmartSpend Ai
</motion.p>
      </motion.div>
    </div>
  );
};

export default Preloader;
