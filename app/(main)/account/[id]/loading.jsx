import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden p-6 space-y-8 max-w-6xl mx-auto pt-20">
      {/* Header Skeleton */}
      <div className="flex gap-4 items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-8 w-36 ml-auto" />
          <Skeleton className="h-4 w-28 ml-auto" />
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="p-6 bg-[#1a1a1a]/80 border border-gray-800 rounded-2xl h-[340px] space-y-4">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-[240px] w-full rounded-xl" />
      </div>

      {/* Transaction Table Skeleton */}
      <div className="p-6 bg-[#1a1a1a]/80 border border-gray-800 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-gray-800/40">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
