import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-purple-950/40 border border-purple-800/20", className)}
      {...props}
    />
  );
}

export { Skeleton };
