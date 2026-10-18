import { Skeleton } from "@/components/ui/skeleton";

export default function SmartBudgetLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-80 mx-auto rounded-xl bg-slate-200" />
          <Skeleton className="h-4 w-96 mx-auto bg-slate-100" />
        </div>

        <div className="mt-8 bg-white rounded-2xl p-8 space-y-4 border border-slate-200/80 shadow-xs">
          <Skeleton className="h-4 w-full bg-slate-100" />
          <Skeleton className="h-12 w-full rounded-xl bg-slate-100" />
          <Skeleton className="h-12 w-full rounded-xl bg-slate-100" />
          <Skeleton className="h-10 w-48 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
