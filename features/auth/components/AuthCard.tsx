import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50",
        "dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30",
        className,
      )}
    >
      {children}
    </div>
  );
}
