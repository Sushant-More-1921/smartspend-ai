import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export default async function AddTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const editId = searchParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
   <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0f051d] via-[#1a093c] to-[#120623] px-5 py-16 text-white overflow-hidden">
      
      {/* Radial Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25)_0%,transparent_70%)] pointer-events-none"></div>

      {/* Content Wrapper */}
      <div className="relative max-w-5xl mx-auto">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide 
                       bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                       bg-clip-text text-transparent mt-5">
          {editId ? "Edit Transaction" : "Add Transaction"}
        </h1>
      </div>

      {/* Dashboard-style container for the form */}
      <div className="w-full h-full bg-[#1e1133] rounded-2xl  space-y-4 
                          border border-purple-800/30 backdrop-blur-lg
                      p-6 md:p-8">
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
