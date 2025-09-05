import DashboardPage from "./page";
import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout() {
  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b 
                      from-[#0f051d] via-[#1a093c] to-[#120623]" />

      {/* Radial Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25)_0%,transparent_70%)] pointer-events-none" />

      {/* Content */} 
      <div className="relative z-10 max-w-5xl mx-auto py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide 
                         bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                         bg-clip-text text-transparent mt-10">
            Dashboard
          </h1>
        </div>

        {/* Suspense Loader */}
        <Suspense
          fallback={
            <div className="mt-4">
              <BarLoader width={"100%"} color="#9333ea" />
            </div>
          }
        >
          {/* Dashboard Container */}
          <div className="w-full h-full bg-[#1e1133] rounded-2xl p-8 space-y-4 
                          border border-purple-800/30 backdrop-blur-lg">
            <DashboardPage />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
