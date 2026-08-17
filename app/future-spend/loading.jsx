import { Skeleton } from "@/components/ui/skeleton";

export default function FutureSpendLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f051d] via-[#1a093c] to-[#120623] text-white pt-24 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-80 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-96 mx-auto" />

        <div className="bg-[#1e1133] rounded-2xl p-6 border border-purple-800/30 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
