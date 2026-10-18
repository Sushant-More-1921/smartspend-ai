"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck, TrendingUp, Zap } from "lucide-react";

export default function SignInPage() {
  const features = [
    {
      icon: Sparkles,
      iconBg: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
      title: "AI Financial Insights",
      desc: "Automated recommendations tailored for your spending habits",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
      title: "Smart Spend Forecasting",
      desc: "Predict future expenses with machine learning accuracy",
    },
    {
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      title: "Bank-grade Security",
      desc: "End-to-end encrypted tracking keeping your financial data private",
    },
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#090314] relative overflow-hidden px-4 py-3 pt-14 sm:pt-16">
      {/* Dynamic Ambient Background Glows matching the dark site theme */}
      <div className="absolute top-10 -left-20 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
      
      {/* Subtle Starry/Dot Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Split Container Card - Identical 520px height & max-w-4xl width */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl lg:h-[520px] my-auto flex flex-col lg:flex-row rounded-2xl sm:rounded-3xl overflow-hidden 
                   bg-[#120726]/85 backdrop-blur-2xl border border-purple-500/30 
                   shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(147,51,234,0.15)]"
      >
        {/* LEFT PANEL - Branding & Highlights */}
        <div className="lg:w-1/2 lg:h-full p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-purple-950/40 via-[#180c30]/50 to-[#0e051c]/60 border-b lg:border-b-0 lg:border-r border-purple-500/20">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo & Heading */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group mb-3 lg:mb-4">
              <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-400/30 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.25)]">
                <Image
                  src="/logo-sm.png"
                  alt="SmartSpend AI"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Smart<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">Spend AI</span>
              </span>
            </Link>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 border border-purple-400/30 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>Welcome Back</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Unlock Your{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
                  Financial Potential
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/70 leading-relaxed">
                Log in to access your real-time analytics, AI budget advisor, and personalized spending reports.
              </p>
            </div>
          </div>

          {/* Feature List */}
          <div className="my-3 space-y-2">
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.1, duration: 0.4 }}
                className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-purple-400/30 transition-all duration-200"
              >
                <div className={`p-1.5 rounded-lg ${feat.iconBg} shrink-0`}>
                  <feat.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                  <p className="text-[11px] text-purple-200/60 mt-0.5 leading-snug">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Distinct low-opacity white background card for clear form visibility */}
        <div className="lg:w-1/2 lg:h-full p-4 sm:p-5 flex items-center justify-center relative bg-gradient-to-b from-white/[0.03] to-purple-950/20">
          <div className="w-full max-w-[350px] rounded-2xl bg-white/[0.18] backdrop-blur-2xl border-2 border-white/40 p-4 sm:p-4.5 shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)]">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              appearance={{
                variables: {
                  colorPrimary: "#a855f7",
                  colorText: "#ffffff",
                  colorTextSecondary: "#f1f5f9",
                  colorBackground: "transparent",
                  colorInputBackground: "rgba(255, 255, 255, 0.16)",
                  colorInputText: "#ffffff",
                  borderRadius: "0.5rem",
                  fontSize: "0.8125rem",
                },
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none border-0 bg-transparent",
                  card: "w-full bg-transparent shadow-none border-none p-0",
                  logoBox: "hidden",
                  headerTitle: "text-lg font-extrabold text-white tracking-tight drop-shadow-sm",
                  headerSubtitle: "text-xs text-white/90 mt-0.5 font-semibold",
                  socialButtonsBlockButton:
                    "bg-white/[0.14] hover:bg-white/[0.24] border border-white/40 hover:border-white/70 text-white font-semibold text-xs py-1.5 rounded-lg transition-all duration-200 shadow-none",
                  socialButtonsBlockButtonText: "text-white font-bold text-xs",
                  socialButtonsProviderIcon: "w-4 h-4 brightness-125 contrast-125",
                  dividerLine: "bg-white/30",
                  dividerText: "text-[10px] font-bold text-white/90 uppercase tracking-wider",
                  formFieldLabel: "text-xs font-bold text-white tracking-wide mb-0.5 drop-shadow-sm",
                  formFieldInput:
                    "bg-white/[0.18] border-2 border-white/40 text-white placeholder:text-white/70 rounded-lg focus:border-white focus:bg-white/[0.26] focus:ring-2 focus:ring-purple-400/40 transition-all font-medium text-xs sm:text-sm py-1.5 px-3 shadow-none",
                  formButtonPrimary:
                    "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold py-1.5 px-4 rounded-lg !shadow-none !shadow-transparent hover:!shadow-none hover:!translate-y-0 hover:!scale-100 transition-none border-none text-xs",
                  footerActionLink:
                    "text-purple-300 hover:text-white font-bold text-xs underline underline-offset-4 transition-colors",
                  footerActionText: "text-white/80 text-xs font-medium",
                  footer: "bg-transparent border-t-0 pt-1",
                  identityPreviewText: "text-white text-xs sm:text-sm font-bold",
                  identityPreviewEditButtonIcon: "text-purple-300 hover:text-white",
                  formResendCodeLink: "text-purple-300 hover:text-white text-xs font-bold hover:underline",
                  otpCodeFieldInput:
                    "border-2 border-white/40 text-white bg-white/[0.18] rounded-lg focus:border-white focus:ring-2 focus:ring-purple-400/50",
                  formFieldErrorText: "text-red-300 text-xs mt-0.5 font-semibold",
                  formFieldWarningText: "text-amber-300 text-xs mt-0.5 font-semibold",
                  alert: "bg-red-500/25 border border-red-400/50 text-red-100 text-xs rounded-lg p-2",
                  alertText: "text-red-100 text-xs font-medium",
                },
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
