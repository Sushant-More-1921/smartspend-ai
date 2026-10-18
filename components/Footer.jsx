"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Github, Linkedin, Shield, FileText, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Footer() {
  const [modalType, setModalType] = useState(null); // 'privacy' | 'terms' | 'contact' | null

  const socialLinks = [
    { icon: Twitter, url: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, url: "https://www.instagram.com", label: "Instagram" },
    { icon: Github, url: "https://github.com/Sushant-More-1921", label: "GitHub" },
    { icon: Linkedin, url: "https://www.linkedin.com/in/sushant-more-741695299/", label: "LinkedIn" },
  ];

  return (
    <>
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            
            {/* Column 1: Brand & Description */}
            <div className="md:col-span-2 space-y-4 pr-0 lg:pr-8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-xs">
                  <Image
                    src="/logo-sm.png"
                    alt="SmartSpend AI Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">SmartSpend AI</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                A personal finance and young investor intelligence platform that helps users
                understand their spending, plan savings goals, estimate potential investment capacity,
                and make informed financial decisions.
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map(({ icon: Icon, url, label }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/#features" className="hover:text-white transition-colors">
                    Core Benefits
                  </Link>
                </li>
                <li>
                  <Link href="/#preview" className="hover:text-white transition-colors">
                    Dashboard Preview
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="hover:text-white transition-colors">
                    Why SmartSpend AI?
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    App Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Trust & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Support</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button
                    onClick={() => setModalType("privacy")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalType("terms")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalType("contact")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Contact & Support
                  </button>
                </li>
                <li>
                  <Link href="/sign-in" className="hover:text-white transition-colors">
                    Member Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} SmartSpend AI. All rights reserved.</p>
            <p className="max-w-md text-left sm:text-right">
              Educational & planning intelligence platform. Illustrative simulations are not formal financial advice.
            </p>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Dialog open={modalType === "privacy"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Privacy Policy
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 max-h-[60vh] overflow-y-auto pr-1">
            <p>
              SmartSpend AI is built with privacy-first principles. We do not sell, rent, or monetize your personal
              financial records or transaction history with advertisers.
            </p>
            <h5 className="font-bold text-slate-900">1. Data Storage & Authentication</h5>
            <p>
              User authentication is managed via Clerk using industry-standard encrypted sessions. Your accounts,
              transactions, and goals are stored in your private database partition.
            </p>
            <h5 className="font-bold text-slate-900">2. No Bank Scraping</h5>
            <p>
              We do not ask for or store banking passwords, NetBanking PINs, or UPI credentials. All records are
              entered manually or generated through user-uploaded receipt scans.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={modalType === "terms"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Terms of Service
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 max-h-[60vh] overflow-y-auto pr-1">
            <p>
              SmartSpend AI provides financial analytics, budget organization, and educational planning calculators.
            </p>
            <h5 className="font-bold text-slate-900">1. Educational Disclaimer</h5>
            <p>
              Calculations, compounding scenarios, and future spend predictions are mathematical simulations for planning
              purposes only. They do not constitute formal investment advice or guaranteed returns.
            </p>
            <h5 className="font-bold text-slate-900">2. User Responsibility</h5>
            <p>
              You are responsible for verifying the accuracy of transaction amounts and dates entered into the platform.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact & Support Modal */}
      <Dialog open={modalType === "contact"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Contact & Support
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
            <p>
              Have questions, feedback, or need assistance with SmartSpend AI? Reach out to our team:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-semibold text-slate-900">Support Email</p>
              <p className="text-blue-600 font-mono text-xs">moresushant600@gmail.com</p>
            </div>
            <p className="text-xs text-slate-500">
              We respond to inquiries within 24 to 48 business hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
