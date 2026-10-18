import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="w-full text-slate-900 p-6 space-y-8 max-w-7xl mx-auto pt-20 pb-16">
      {/* Header Skeleton */}
      <div className="flex gap-4 items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-xl bg-slate-200" />
          <Skeleton className="h-4 w-32 bg-slate-100" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-8 w-36 ml-auto bg-slate-200" />
          <Skeleton className="h-4 w-28 ml-auto bg-slate-100" />
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs h-[340px] space-y-4">
        <Skeleton className="h-6 w-44 bg-slate-200" />
        <Skeleton className="h-[240px] w-full rounded-xl bg-slate-100" />
      </div>

      {/* Transaction Table Skeleton */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40 bg-slate-200" />
          <Skeleton className="h-8 w-32 rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-slate-100"
            >
              <Skeleton className="h-4 w-44 bg-slate-200" />
              <Skeleton className="h-4 w-24 bg-slate-100" />
              <Skeleton className="h-4 w-20 bg-slate-100" />
              <Skeleton className="h-5 w-20 bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
