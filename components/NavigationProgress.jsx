"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (loading) {
      setLoading(false);
    }
  }

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
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-slate-100 overflow-hidden">
      <div className="h-full bg-blue-600 animate-[pulse_1s_infinite] w-full" />
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
