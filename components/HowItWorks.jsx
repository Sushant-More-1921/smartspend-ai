"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { CreditCard, BarChart3, PieChart } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <CreditCard className="w-10 h-10 text-blue-500" />,
      title: "1. Create Your Account",
      desc: "Sign up quickly with a secure process and start managing your money right away."
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-purple-500" />,
      title: "2. Track Your Spending",
      desc: "Easily categorize your expenses and track your spending in real-time."
    },
    {
      icon: <PieChart className="w-10 h-10 text-indigo-500" />,
      title: "3. Get Insights",
      desc: "AI-powered insights help you save smarter and achieve your financial goals."
    }
  ]

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.25, duration: 0.6, ease: "easeOut" }
    })
  }

  return (
    <section className="relative py-16">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300/40 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="container mx-auto px-4 relative">
        {/* Section Title */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-14 text-center "
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="relative h-full bg-[#1a1a1a]/80 border border-gray-700 shadow-lg rounded-2xl overflow-hidden hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-2 flex">
                <div className="p-8 inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" >
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 flex items-center justify-center mb-6 shadow-md">
                    {step.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-3 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    {step.title}
                  </h3>
                  <p className="text-gray-300">{step.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
