import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-slate-50 text-slate-900">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center mb-6 shadow-2xs">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
        Page Not Found
      </h1>

      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The page you are looking for doesn&apos;t exist, has been moved, or the link you followed was incorrect.
      </p>

      <Link href="/">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-5 py-2.5 shadow-xs flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Button>
      </Link>
    </div>
  );
}
