export default function AuthLayout({ children }) {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20 pb-8">
      {children}
    </div>
  );
}