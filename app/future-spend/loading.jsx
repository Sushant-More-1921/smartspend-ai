import { Skeleton } from "@/components/ui/skeleton";

export default function FutureSpendLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-80 mx-auto rounded-xl bg-slate-200" />
          <Skeleton className="h-4 w-96 mx-auto bg-slate-100" />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <Skeleton className="h-12 w-full rounded-xl bg-slate-100" />
          <Skeleton className="h-10 w-36 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
