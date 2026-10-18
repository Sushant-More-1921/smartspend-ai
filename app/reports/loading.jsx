import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-8 text-slate-800 pt-24 pb-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48 rounded-xl bg-slate-200" />
            <Skeleton className="h-4 w-72 bg-slate-100" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28 rounded-lg bg-slate-200" />
            <Skeleton className="h-9 w-36 rounded-lg bg-slate-200" />
          </div>
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
            >
              <Skeleton className="h-4 w-24 bg-slate-100" />
              <Skeleton className="h-8 w-32 mt-2 bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <Skeleton className="h-6 w-48 bg-slate-200" />
          <Skeleton className="h-[300px] w-full rounded-xl bg-slate-100" />
        </div>

        {/* Export Buttons Skeleton */}
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-200" />
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
