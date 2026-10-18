import { Skeleton } from "@/components/ui/skeleton";

export default function GoalsLoading() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0f051d] via-[#1a093c] to-[#120623] px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3 border-b border-purple-800/30 pb-6">
          <Skeleton className="h-6 w-32 rounded-full bg-purple-900/30" />
          <Skeleton className="h-12 w-64 bg-purple-900/40" />
          <Skeleton className="h-4 w-96 bg-purple-950/40" />
        </div>

        {/* 6 Overview Cards Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#160a2c]/80 border border-purple-800/30 space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-20 bg-purple-900/40" />
                <Skeleton className="h-7 w-7 rounded-lg bg-purple-900/50" />
              </div>
              <Skeleton className="h-7 w-28 bg-purple-900/50" />
              <Skeleton className="h-3 w-24 bg-purple-950/40" />
            </div>
          ))}
        </div>

        {/* Goals Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#1a0e30]/80 border border-purple-800/30 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-purple-900/50" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28 bg-purple-900/50" />
                    <Skeleton className="h-3 w-16 bg-purple-950/40" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full bg-purple-900/40" />
              </div>

              <div className="space-y-2 pt-2">
                <Skeleton className="h-8 w-36 bg-purple-900/50" />
                <Skeleton className="h-2.5 w-full rounded-full bg-purple-950/50" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-purple-800/30">
                <Skeleton className="h-9 w-full rounded-xl bg-purple-900/40" />
                <Skeleton className="h-9 w-full rounded-xl bg-purple-900/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
