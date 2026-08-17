import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0326] via-[#1a0033] to-[#1a1630] p-8 text-gray-200 pt-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-xl bg-[#15101a] border border-purple-900/30 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="p-6 bg-[#191021] rounded-xl border border-[#2d2036] space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>

        {/* Export Buttons Skeleton */}
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
