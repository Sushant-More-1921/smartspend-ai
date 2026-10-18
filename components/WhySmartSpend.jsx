"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  LineChart,
  Sliders,
  ShieldCheck,
  Check,
} from "lucide-react";

const valueProps = [
  {
    icon: <LayoutDashboard className="w-5 h-5 text-blue-600" />,
    title: "Simple & Approachable Financial Overview",
    desc: "Clean dashboard without overwhelming jargon or dense spreadsheets. See all accounts, balances, and current cashflow at a glance.",
  },
  {
    icon: <Target className="w-5 h-5 text-emerald-600" />,
    title: "Goal-Based Savings Planning",
    desc: "Allocate funds toward specific targets like emergency savings, higher education, or gadgets with accurate account synchronization.",
  },
  {
    icon: <LineChart className="w-5 h-5 text-indigo-600" />,
    title: "Spending Insights Based on Available Data",
    desc: "Accurate analysis derived strictly from your logged transactions and verified receipts—never guesswork or manufactured estimates.",
  },
  {
    icon: <Sliders className="w-5 h-5 text-sky-600" />,
    title: "Transparent Calculations & Assumptions",
    desc: "Deterministic mathematical formulas for required monthly contributions, surplus feasibility buffers, and compounding growth.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    title: "Privacy-Conscious Data Handling",
    desc: "Protected by industry-standard Clerk authentication and isolated database records. Your personal financial entries are never sold or shared.",
  },
];

export default function WhySmartSpend() {
  return (
    <section id="about" className="py-24 bg-slate-50/70 border-t border-slate-200/70">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200/70 text-blue-700">
            <span>Platform Philosophy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Your Financial Picture, All in One Place.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            SmartSpend AI was designed from the ground up for students, young professionals, and investors
            who want clarity, disciplined planning, and privacy.
          </p>
        </div>

        {/* 5 Supporting Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valueProps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}

          {/* Additional Summary Card for visual symmetry in a 3-col grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 5 * 0.08 }}
            viewport={{ once: true }}
            className="bg-blue-600 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">
                Designed For You
              </span>
              <h3 className="text-lg font-bold text-white">
                Financially Empowered
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Stop guessing your end-of-month balance. Start making confident financial choices backed by data.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-white">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Free to start • No bank credentials needed</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
