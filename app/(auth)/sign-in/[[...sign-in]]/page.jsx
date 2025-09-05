"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#200b3d] via-[#1c0944] to-[#120623] relative">
      {/* ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25)_0%,transparent_80%)]" />

      {/* card container with fade + subtle breathing glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: [
            "0 0 40px rgba(139,92,246,0.7)",
          ],
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
          boxShadow: { duration: 1, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative w-full mt-14 max-w-4xl h-[500px]  flex rounded-2xl overflow-hidden 
             bg-[#120623]/60 border border-purple-400 backdrop-blur-lg"
      >
        {/* LEFT info panel */}
        <div
          className="hidden md:flex flex-col justify-center items-center w-1/2 px-10 text-white
                     bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400"
        >
          <h1 className="text-3xl font-extrabold mb-3">Welcome Back!</h1>
          <p className="text-lg opacity-90 text-center">
            Sign in to continue managing your finances effortlessly.
          </p>
        </div>

        {/* RIGHT sign-in form */}
        <div
          className="w-full md:w-1/2 flex justify-center items-center p-10 
                     bg-gradient-to-b from-[#1c0944]/90 to-[#120623]/90 
                     backdrop-blur-md "
        >
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#c084fc",
              },
              elements: {
                formButtonPrimary:
                  "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition",
                footer: "hidden",
                footerAction: "hidden",
                footerActionText: "hidden",
                footerActionLink: "hidden",
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
