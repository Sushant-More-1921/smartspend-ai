import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { DeleteAccountButton } from "../_components/delete-account-button";

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
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b 
                      from-[#0f051d] via-[#1a093c] to-[#120623]" />

      {/* Radial Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25)_0%,transparent_70%)] pointer-events-none" />

      {/* Page Content */}
      <div className="relative space-y-8 px-5 pb-6 mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mt-20">
              {account.name}
            </h1>
            <p className="text-muted-foreground pt-2">
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
              Account
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto pb-2">
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold">
                ₹{parseFloat(account.balance).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                {account._count?.transactions ?? 0} Transactions
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
          fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
        >
          <AccountChart transactions={transactions} />
        </Suspense>

        {/* Transactions Table */}
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
        >
          <TransactionTable transactions={transactions} />
        </Suspense>
      </div>
    </div>
  );
}
