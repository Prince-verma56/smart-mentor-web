import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <SignIn
      routing="path"
      path="/login"
      signUpUrl="/signup"
      forceRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "w-full rounded-xl border border-border bg-card shadow-md",
          headerTitle: "text-foreground dark:text-foreground font-semibold",
          headerSubtitle: "text-foreground0 dark:text-muted-foreground",
          socialButtonsBlockButton:
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-border dark:bg-muted dark:text-slate-200 dark:hover:bg-slate-700",
          dividerLine: "bg-slate-200 dark:bg-slate-700",
          dividerText: "text-muted-foreground dark:text-foreground0",
          formFieldLabel: "text-slate-700 dark:text-slate-300",
          formFieldInput:
            "border-slate-200 bg-white text-foreground placeholder-slate-400 focus:border-violet-500 focus:ring-violet-500 dark:border-border dark:bg-muted dark:text-foreground",
          formButtonPrimary:
            "bg-violet-600 hover:bg-violet-700 text-white shadow-sm",
          footerActionLink: "text-violet-600 hover:text-violet-700 dark:text-violet-400",
          identityPreviewText: "text-slate-700 dark:text-slate-300",
          formFieldErrorText: "text-rose-500",
          alertText: "text-slate-700 dark:text-slate-300",
        },
      }}
    />
  );
}
