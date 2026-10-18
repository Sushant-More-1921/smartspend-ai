import { Skeleton } from "@/components/ui/skeleton";

export default function GoalsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-2">
        <Skeleton className="h-6 w-32 rounded-full bg-slate-200" />
        <Skeleton className="h-10 w-64 bg-slate-200" />
        <Skeleton className="h-4 w-96 bg-slate-100" />
      </div>

      {/* 6 Overview Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-20 bg-slate-200" />
              <Skeleton className="h-7 w-7 rounded-lg bg-slate-100" />
            </div>
            <Skeleton className="h-7 w-28 bg-slate-200" />
            <Skeleton className="h-3 w-24 bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Goals Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28 bg-slate-200" />
                  <Skeleton className="h-3 w-16 bg-slate-100" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full bg-slate-100" />
            </div>

            <div className="space-y-2 pt-2">
              <Skeleton className="h-8 w-36 bg-slate-200" />
              <Skeleton className="h-2.5 w-full rounded-full bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
              <Skeleton className="h-9 w-full rounded-xl bg-slate-100" />
              <Skeleton className="h-9 w-full rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
