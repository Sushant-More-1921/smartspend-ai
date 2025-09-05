"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Receipt,
  Wallet,
  Layers,
  Grid,
  BarChart3,
} from "lucide-react";

const featuresData = [
  {
    icon: <LineChart className="w-10 h-10 text-purple-400" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with AI-powered analytics",
  },
  {
    icon: <Receipt className="w-10 h-10 text-blue-400" />,
    title: "Smart Receipt Scanner",
    description:
      "Extract data automatically from receipts using advanced AI technology",
  },
  {
    icon: <Wallet className="w-10 h-10 text-pink-400" />,
    title: "Budget Planning",
    description:
      "Create and manage budgets with intelligent recommendations",
  },
  {
    icon: <Layers className="w-10 h-10 text-indigo-400" />,
    title: "Multi-Account Support",
    description:
      "Manage multiple accounts and credit cards in one place",
  },
  {
    icon: <Grid className="w-10 h-10 text-teal-400" />,
    title: "Smart Expense Categorization",
    description:
      "Automatically group your expenses into categories like food, travel, and utilities for better tracking",
  },
  {
    icon: <BarChart3 className="w-10 h-10 text-yellow-400" />,
    title: "Automated Insights",
    description:
      "Get automated financial insights and recommendations",
  },
];

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="relative py-20 text-white overflow-hidden"
    >

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 "
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Everything You Need to Manage Your Finances
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <Card className="relative h-full bg-[#1a1a1a]/80 border border-gray-700 shadow-lg rounded-2xl overflow-hidden hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-2 flex">
                {/* Subtle Glass Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
                <CardContent className="relative z-10 space-y-4 p-6 flex flex-col items-center text-center justify-between h-full">
                  {feature.icon}
                  <h3 className="text-md font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
