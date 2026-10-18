"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Lock,
} from "lucide-react";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center bg-gradient-to-b from-slate-50 via-white to-slate-50/60 pt-32 pb-20 overflow-hidden"
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center lg:text-left w-full lg:w-1/2 flex flex-col justify-center space-y-6"
        >
          {/* Friendly pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold self-center lg:self-start">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Personal Finance & Young Investor Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Understand Your Money.{" "}
            <span className="text-blue-600">Plan Your Future.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            SmartSpend AI helps you understand your spending habits, plan realistic savings goals,
            estimate how much you could potentially invest, and explore financial insights in one simple platform.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
            <SignedOut>
              <SignUpButton forceRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  className="px-6 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="px-6 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </SignedIn>

            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="px-6 py-2.5 text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Explore Features
              </Button>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Account Credentials Shared</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Encrypted Personal Data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              <span>Transparent Projections</span>
            </div>
          </div>
        </motion.div>

        {/* Right Product Illustration Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="w-full lg:w-1/2 flex justify-center items-center"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-2 sm:p-3 border border-slate-200/90 shadow-xl group">
            <div className="overflow-hidden rounded-2xl bg-slate-50 relative aspect-[4/3] w-full">
              <Image
                src="/hero-illustration.jpg"
                alt="SmartSpend AI Financial Intelligence Illustration"
                fill
                sizes="(max-width: 768px) 100vw, 550px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </div>
            
            {/* Subtle floating badge */}
            <div className="absolute -bottom-3 -left-2 sm:-left-3 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg rounded-xl px-3.5 py-2 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900">Disciplined Growth</p>
                <p className="text-[10px] text-slate-500">Goal-oriented planning & insights</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
