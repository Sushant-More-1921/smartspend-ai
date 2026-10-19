import { checkUser } from "@/lib/checkUser";

export default async function MainLayout({ children }) {
  await checkUser();

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}