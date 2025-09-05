"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-gradient-to-br from-black via-purple-950 to-black overflow-hidden pt-28"
    >
      <div className="relative z-10 container mx-auto px-3 lg:px-15 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left w-full lg:w-1/2 flex flex-col justify-center space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            {/* Force "Manage Your Finance" into one row */}
            <span className="text-purple-400 tracking-wider">Manage&nbsp;Your</span><br />
            <span className="text-white tracking-wider mt-2 block">Finance with </span>
            <span className=" bg-gradient-to-r from-purple-400 to-gray-300 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-300 max-w-lg mx-auto lg:mx-0">
            Explore AI-powered financial intelligence that helps you track,
            analyze, and optimize your money with real-time insights.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="px-8 py-3 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:opacity-90 transition"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/know-more">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-base font-semibold border-purple-400 text-purple-400 hover:bg-purple-600/10 hover:text-white rounded-full"
              >
                Know More
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Image (Circle with banner.jpg) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full lg:w-1/2 flex justify-center items-center"
        >
          <div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden  shadow-[0_0_100px_rgba(168,85,247,0.7)]">
            <Image
              src="/banner2.jpg"
              alt="Futuristic Banner"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
