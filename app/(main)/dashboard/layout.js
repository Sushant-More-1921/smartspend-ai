import DashboardSidebar from "@/components/dashboard-sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <DashboardSidebar />
          <div className="flex-1 min-w-0 w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
