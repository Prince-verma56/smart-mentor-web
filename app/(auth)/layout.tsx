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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground px-4 py-10">
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
