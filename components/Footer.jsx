"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Instagram, Github, Linkedin } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: Twitter,  url: "https://twitter.com/yourprofile",  label: "Twitter" },
    { icon: Instagram, url: "https://www.instagram.com/sushant.sm._/", label: "Instagram" },
    { icon: Github,   url: "https://github.com/Sushant-More-1921",   label: "GitHub" },
    { icon: Linkedin, url: "https://www.linkedin.com/in/sushant-more-741695299/", label: "LinkedIn" },
  ];

  // simple staggered entrance
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <footer className="bg-black text-white py-10 px-6 text-center relative overflow-hidden">
      {/* soft white spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)] pointer-events-none" />

      <motion.div
        className="relative z-10 container mx-auto"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2 className="text-3xl font-bold mb-4" variants={item}>
          Ready to Take Control of Your Finances?
        </motion.h2>

        <motion.p className="text-gray-400 mb-8 max-w-xl mx-auto" variants={item}>
          Join thousands of students already managing their finances smarter with SmartSpend AI.
        </motion.p>

        <motion.div variants={item}>
          <Link href="/dashboard">
            <button
              className="px-6 py-3 rounded-lg bg-white text-black font-semibold
                         transition transform hover:scale-105 hover:shadow-[0_0_15px_#3b82f6]"
            >
              Start Free
            </button>
          </Link>
        </motion.div>

        <motion.div className="my-8 border-t border-gray-700" variants={item} />

        {/* social icons (each animates in) */}
        <motion.div className="flex justify-center gap-6" variants={item}>
          {socialLinks.map(({ icon: Icon, url, label }, i) => (
            <motion.a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="group"
              variants={item}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <div className="p-3 rounded-full bg-white/5 border border-white/10
                              transition-shadow hover:shadow-[0_0_14px_#9333ea]">
                <Icon className="w-6 h-6 text-white" />
              </div>
            </motion.a>
          ))}
        </motion.div>

        <motion.p className="mt-8 text-sm text-gray-500" variants={item}>
          © {new Date().getFullYear()} SmartSpend AI. All rights reserved.
        </motion.p>
      </motion.div>
    </footer>
  );
}
