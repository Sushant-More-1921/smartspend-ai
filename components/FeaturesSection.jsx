"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  Target,
  PiggyBank,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const coreBenefits = [
  {
    icon: <CreditCard className="w-5 h-5 text-blue-600" />,
    iconBg: "bg-blue-50 border border-blue-200/80",
    badge: "Core Feature",
    badgeStyle: "bg-blue-50 text-blue-700 border-blue-200/80",
    title: "Track Your Spending",
    description:
      "Understand where your money goes through clear transaction and spending analysis.",
    highlights: [
      "Categorized income & expense ledger",
      "AI receipt scanner & manual logging",
      "Interactive time-period trends",
    ],
  },
  {
    icon: <Target className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-50 border border-emerald-200/80",
    badge: "Core Feature",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    title: "Plan Financial Goals",
    description:
      "Set targets, track contributions, and calculate the monthly savings needed to reach your goals.",
    highlights: [
      "Custom targets & deadlines",
      "Safe account balance synchronization",
      "Contribution audit history log",
    ],
  },
  {
    icon: <PiggyBank className="w-5 h-5 text-indigo-600" />,
    iconBg: "bg-indigo-50 border border-indigo-200/80",
    badge: "Core Feature",
    badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    title: "Discover Savings Potential",
    description:
      "Explore how income, expenses, and financial commitments affect your potential monthly surplus.",
    highlights: [
      "Realized monthly surplus analysis",
      "Interactive What-If scenario testing",
      "Early warning overspending alerts",
    ],
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
    iconBg: "bg-sky-50 border border-sky-200/80",
    badge: "Educational & Insights",
    badgeStyle: "bg-sky-50 text-sky-700 border-sky-200/80",
    title: "Explore Investment Insights",
    description:
      "Understand investment concepts and explore educational options based on your goals and risk profile.",
    highlights: [
      "Compounding return projections (SIP)",
      "Goal-based time horizon alignment",
      "Educational risk-profile insights",
    ],
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-white border-t border-slate-100">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200/70 text-blue-700">
            <span>Essential Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Core Benefits Designed for Everyday Savers & Young Investors
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            SmartSpend AI combines practical transaction tracking with goal-oriented planning tools
            to help you make informed financial decisions.
          </p>
        </div>

        {/* 4 Core Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {coreBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${benefit.iconBg}`}>
                    {benefit.icon}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${benefit.badgeStyle}`}>
                    {benefit.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>

              {/* Sub-highlights */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {benefit.highlights.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
