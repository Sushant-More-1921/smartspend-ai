import { getFinancialGoals, getFinancialBehaviourData } from "@/actions/goals";
import { GoalsView } from "./_components/goals-view";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const activeCount = goalsData.overview?.activeGoalsCount || 0;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <PageHeader
          title="Financial Goals & Savings Planner"
          subtitle="Turn ambitions into realistic milestones. Allocate savings, calculate precise monthly contributions, and test what-if scenarios."
          badge={`${activeCount} Active ${activeCount === 1 ? "Goal" : "Goals"}`}
        />

        {/* Goals & Planner Interactive View */}
        <GoalsView
          initialData={goalsData}
          initialBehaviourData={behaviourData}
        />
      </div>
    </div>
  );
}
