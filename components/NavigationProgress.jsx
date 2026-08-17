"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest("a");
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        !target.target &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        const targetUrl = new URL(target.href);
        if (targetUrl.pathname !== window.location.pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-purple-950 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-[pulse_1s_infinite] w-full shadow-[0_0_12px_#a855f7]" />
    </div>
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressIndicator />
    </Suspense>
  );
}
