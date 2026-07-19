import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | SuperMentor AI",
    default: "Auth | SuperMentor AI",
  },
  description: "Sign in or create your SuperMentor AI account.",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
      {/* Subtle gradient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl"
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
