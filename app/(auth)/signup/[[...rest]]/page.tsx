import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <SignUp
      routing="path"
      path="/signup"
      signInUrl="/login"
      forceRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "w-full rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30",
          headerTitle: "text-slate-900 dark:text-slate-50 font-semibold",
          headerSubtitle: "text-slate-500 dark:text-slate-400",
          socialButtonsBlockButton:
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
          dividerLine: "bg-slate-200 dark:bg-slate-700",
          dividerText: "text-slate-400 dark:text-slate-500",
          formFieldLabel: "text-slate-700 dark:text-slate-300",
          formFieldInput:
            "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
          formButtonPrimary:
            "bg-violet-600 hover:bg-violet-700 text-white shadow-sm",
          footerActionLink: "text-violet-600 hover:text-violet-700 dark:text-violet-400",
          formFieldErrorText: "text-rose-500",
          alertText: "text-slate-700 dark:text-slate-300",
        },
      }}
    />
  );
}
