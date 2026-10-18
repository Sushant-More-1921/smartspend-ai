import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { DeleteAccountButton } from "../_components/delete-account-button";
import Link from "next/link";
import { ArrowLeft, PenBox } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }) {
  const resolvedParams = await params;
  const accountId = resolvedParams?.id;
  const accountData = await getAccountWithTransactions(accountId);

  if (!accountData) {
    notFound();
  }

  const { transactions = [], ...account } = accountData;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <Link href="/transaction/create">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-3.5 py-1.5 h-8 gap-1.5 shadow-xs"
            >
              <PenBox className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {account.name}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
              </span>
              {account.isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ledger ID: <span className="font-mono text-slate-400">{account.id}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 self-start sm:self-auto">
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                ₹{parseFloat(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {account._count?.transactions ?? transactions.length} Transactions recorded
              </p>
            </div>
            <DeleteAccountButton
              accountId={account.id}
              accountName={account.name}
              isDefault={account.isDefault}
            />
          </div>
        </div>

        {/* Chart Section */}
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#2563eb" />}
        >
          <AccountChart transactions={transactions} />
        </Suspense>

        {/* Transactions Table Section */}
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Transactions</h2>
            <p className="text-xs text-slate-500">Filter, search, sort, and manage account transaction history</p>
          </div>
          <Suspense
            fallback={<BarLoader className="mt-4" width={"100%"} color="#2563eb" />}
          >
            <TransactionTable transactions={transactions} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
