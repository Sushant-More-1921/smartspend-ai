import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage({ searchParams }) {
  const params = await searchParams;
  const editId = params?.edit;

  const [accounts = [], initialData = null] = await Promise.all([
    getUserAccounts(),
    editId ? getTransaction(editId) : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Page Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {editId ? "Edit Transaction" : "Record New Transaction"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {editId
                ? "Update transaction details, category, or amount."
                : "Log an expense or income entry, or extract details automatically from a receipt."}
            </p>
          </div>

          <AddTransactionForm
            accounts={accounts}
            categories={defaultCategories}
            editMode={!!editId}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
}
