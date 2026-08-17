import { Skeleton } from "@/components/ui/skeleton";

export default function SmartBudgetLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f051d] via-[#1a093c] to-[#120623] text-white pt-20 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-12 w-80 mx-auto rounded-xl" />

        <div className="mt-8 bg-[#1e1133] rounded-2xl p-8 space-y-4 border border-purple-800/30">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
