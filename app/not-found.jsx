import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center bg-gradient-to-br from-black via-purple-950 to-black overflow-hidden">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide 
                         bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                         bg-clip-text text-transparent mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>
      <Link href="/">
        <Button className="hover:bg-purple-400">Return Home</Button>
      </Link>
    </div>
  );
}
