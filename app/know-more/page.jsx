"use client";

import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { motion } from "framer-motion";

const playfair = Poppins({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export default function KnowMorePage() {
  return (
    <div className="min-h-screen relative overflow-hidden pt-32 px-6 lg:px-16 text-white">
      {/* Background with gradient + radial glow */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-gradient-to-b from-[#0f051d] via-[#1a093c] to-[#120623]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25)_0%,transparent_70%)]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1
            className={`${playfair.className} text-5xl sm:text-6xl lg:text-7xl font-medium tracking-widest bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}
          >
            SmartSpend AI
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            AI-powered expense management prototype with receipt scanning,
            automated categorization, budget planning, and real-time analytics —
            everything a student or young professional needs.
          </p>
        </motion.header>

        {/* SECTIONS */}
        <SectionWithImage
          title="Our Story"
          text="Built by people tired of messy spreadsheets, our app started as a college project to make daily finance simple. Today it helps students, freelancers, and young professionals stop guessing and start planning."
          imageSrc="/images/story.jpg"

        />

        <SectionWithImage
          title="Mission & Vision"
          text={
            <>
              <p>
                <strong>Mission:</strong> Make personal finance easy, automated,
                and actionable for everyone.
              </p>
              <p className="mt-2">
                <strong>Vision:</strong> A future where everyone controls their
                money, confidently and stress-free.
              </p>
            </>
          }
          imageSrc="/images/mission.jpg"
          reverse
        />

        <SectionWithImage
          title="Key Features"
          text={
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>AI Receipt Scanner</li>
              <li>Smart Budget Recommendation</li>
              <li>AI-powered monthly budget suggestions</li>
              <li>Visual reports: pie charts, trend lines</li>
              <li>Multi-account sync</li>
              <li>Export CSV / Excel</li>
              <li>Easy add/edit/delete transactions</li>
            </ul>
          }
          imageSrc="/images/features.jpg"
        />

        <SectionWithImage
          title="How It Helps You"
          text={
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Spot money leaks — weekly spending alerts.</li>
              <li>Save faster — AI suggests exact savings amounts.</li>
              <li>Stay organized — receipts + transactions linked.</li>
            </ul>
          }
          imageSrc="/images/help.jpg"
          reverse
        />
        <SectionWithImage
          title="Why Choose Us"
          text={
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Privacy-first: encrypted storage, no selling data.</li>
              <li>Practical AI: actionable suggestions.</li>
              <li>Lightweight & fast, works offline.</li>
            </ul>
          }
          imageSrc="/images/choose-us.jpg"
        />

        {/* NAVIGATION BUTTONS */}
        <motion.div
          className="mt-16 mb-8 flex justify-center gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link
            href="/"
            className="px-8 py-3 rounded-lg font-medium shadow-lg 
              bg-purple-600 hover:bg-purple-700 text-white 
              transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.8)]"
          >
            Back
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-lg border border-purple-400 
              bg-black/40 text-purple-300 font-medium shadow-lg 
              hover:bg-black/60 transition-all duration-300 
              hover:shadow-[0_0_25px_rgba(139,92,246,0.8)]"
          >
            Open Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function SectionWithImage({ title, text, imageSrc, reverse }) {
  return (
    <motion.section
      className={`mt-20 flex flex-col lg:flex-row items-center gap-12 ${reverse ? "lg:flex-row-reverse" : ""
        }`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* JUST HEADING + TEXT (NO BOX) */}
      <div className="flex-1">
        <h2 className="text-3xl font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          {title}
        </h2>
        <div className="text-gray-300 text-lg leading-relaxed">{text}</div>
      </div>

      {/* IMAGE WITH PURE GLOW */}
      <div className="flex-1">
        <Image
          src={imageSrc}
          alt={title}
          width={520}
          height={350}
          className="rounded-2xl border border-purple-500/20 
                      shadow-[0_0_30px_rgba(139,92,246,0.4)] 
                      hover:shadow-[0_0_50px_rgba(139,92,246,0.8)] 
                      object-cover w-full h-full 
                      hover:scale-105 transition-all duration-500"
        />
      </div>
    </motion.section>
  );
}
