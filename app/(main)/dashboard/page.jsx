import { getDashboardOverviewData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { getFinancialGoals } from "@/actions/goals";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";
import { GoalsDashboardCard } from "./_components/goals-dashboard-card";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Parallelize all dashboard queries concurrently to minimize latency
  const [{ accounts = [], transactions = [] }, budgetData, goalsResult] =
    await Promise.all([
      getDashboardOverviewData(),
      getCurrentBudget(),
      getFinancialGoals(),
    ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Manage accounts, track monthly spending, and monitor financial milestones."
        badge={`${accounts.length} Active ${accounts.length === 1 ? "Account" : "Accounts"}`}
      />

      {/* Financial Goals & Planner Card */}
      <GoalsDashboardCard initialData={goalsResult} />

      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* Dashboard Overview: Charts & Recent Transactions */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {/* Accounts Ledger Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Connected Accounts</h2>
            <p className="text-xs text-slate-500">Savings and checking accounts contributing to your balance</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 rounded-2xl shadow-xs transition-all duration-200 group flex items-center justify-center min-h-[180px]">
              <CardContent className="flex flex-col items-center justify-center text-slate-500 group-hover:text-blue-600 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="h-6 w-6 text-slate-600 group-hover:text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">Add New Account</p>
                <p className="text-xs text-slate-400 mt-0.5">Connect a savings or current ledger</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {accounts.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    </div>
  );
}
