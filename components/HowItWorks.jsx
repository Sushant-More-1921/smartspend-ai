"use client";

import { motion } from "framer-motion";
import { PlusCircle, BarChart3, Target, Compass, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <PlusCircle className="w-5 h-5 text-blue-600" />,
    iconBg: "bg-blue-50 border border-blue-200/80",
    title: "Add Your Financial Data",
    description:
      "Record transactions or use supported import options without sharing bank login credentials.",
  },
  {
    number: "02",
    icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-50 border border-emerald-200/80",
    title: "Understand Your Spending",
    description:
      "Review expense categories and financial patterns across your accounts.",
  },
  {
    number: "03",
    icon: <Target className="w-5 h-5 text-indigo-600" />,
    iconBg: "bg-indigo-50 border border-indigo-200/80",
    title: "Plan Your Goals",
    description:
      "Set financial targets and explore required savings contributions to reach them on time.",
  },
  {
    number: "04",
    icon: <Compass className="w-5 h-5 text-sky-600" />,
    iconBg: "bg-sky-50 border border-sky-200/80",
    title: "Make Informed Decisions",
    description:
      "Use available insights to plan your next financial steps with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-slate-100">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200/70 text-blue-700">
            <span>Simple Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How SmartSpend AI Works
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Take complete control of your finances through four clear, privacy-focused steps.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.iconBg}`}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Step {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index < 3 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Transparent Implementation Note */}
        <div className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <p>
            ℹ️ <strong>Privacy First:</strong> SmartSpend AI uses manual transaction entry and AI receipt OCR. No automated bank scraping or third-party credential access is ever required.
          </p>
        </div>
      </div>
    </section>
  );
}
