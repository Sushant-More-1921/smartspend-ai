import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Budget Progress Skeleton */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-36 bg-slate-200" />
          <Skeleton className="h-7 w-20 rounded-full bg-slate-100" />
        </div>
        <Skeleton className="h-3 w-full rounded-full bg-slate-100" />
        <div className="flex justify-between text-xs pt-1">
          <Skeleton className="h-4 w-24 bg-slate-100" />
          <Skeleton className="h-4 w-24 bg-slate-100" />
        </div>
      </div>

      {/* Dashboard Overview Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-44 bg-slate-200" />
            <Skeleton className="h-8 w-28 rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2.5 border-b border-slate-100"
              >
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36 bg-slate-200" />
                  <Skeleton className="h-3 w-20 bg-slate-100" />
                </div>
                <Skeleton className="h-5 w-16 bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <Skeleton className="h-6 w-48 bg-slate-200" />
          <div className="flex items-center justify-center h-[260px]">
            <Skeleton className="h-48 w-48 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Account Cards Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4 h-44"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-28 bg-slate-200" />
              <Skeleton className="h-4 w-16 rounded-full bg-slate-100" />
            </div>
            <Skeleton className="h-7 w-36 mt-4 bg-slate-200" />
            <div className="flex justify-between text-xs pt-4 border-t border-slate-100">
              <Skeleton className="h-3 w-20 bg-slate-100" />
              <Skeleton className="h-3 w-24 bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
