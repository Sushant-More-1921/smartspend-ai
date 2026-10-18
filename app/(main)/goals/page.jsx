import { getFinancialGoals, getFinancialBehaviourData } from "@/actions/goals";
import { GoalsView } from "./_components/goals-view";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const metadata = {
  title: "Financial Goals & Goal-Based Planner | SmartSpend AI",
  description:
    "Track financial goals, allocate savings safely, calculate monthly contributions, test what-if scenarios, and align goals with your financial surplus.",
};

export default async function FinancialGoalsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [goalsSettled, behaviourSettled] = await Promise.allSettled([
    getFinancialGoals(),
    getFinancialBehaviourData(),
  ]);

  const goalsResult =
    goalsSettled.status === "fulfilled"
      ? goalsSettled.value
      : { success: false, data: { goals: [], accounts: [], overview: {} } };

  const behaviourResult =
    behaviourSettled.status === "fulfilled"
      ? behaviourSettled.value
      : { success: false, data: null };

  const goalsData = goalsResult.success
    ? goalsResult.data
    : { goals: [], accounts: [], overview: {} };

  const behaviourData = behaviourResult.success ? behaviourResult.data : null;

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0f051d] via-[#1a093c] to-[#120623] px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-white overflow-hidden">
      {/* Ambient Radial Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.22)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-purple-800/30 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <span>SmartSpend AI</span>
              <span>•</span>
              <span>Financial Planner</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Financial Goals
            </h1>
            <p className="text-gray-300 text-sm mt-2 max-w-2xl">
              Turn your dreams into achievable targets. Safely allocate money, calculate
              precise monthly contributions, test what-if scenarios, and see how your real
              cash surplus supports your ambitions.
            </p>
          </div>
        </div>

        {/* Goals & Planner Interactive View */}
        <GoalsView
          initialData={goalsData}
          initialBehaviourData={behaviourData}
        />
      </div>
    </div>
  );
}
