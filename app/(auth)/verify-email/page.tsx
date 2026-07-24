"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const { signUp } = useSignUp();
  const router = useRouter();
  const [status, setStatus] = useState<"input" | "loading" | "success" | "no-signup">("input");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const email = signUp?.emailAddress;

  useEffect(() => {
    // If the sign-up is already complete (e.g. OAuth user), redirect immediately
    if (signUp && signUp.status === "complete") {
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } else if (signUp === null) {
      setStatus("no-signup");
    }
  }, [signUp, router]);

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp) return;
    setSubmitting(true);
    setCodeError("");
    try {
      // v7 API: signUp.verifications.verifyEmailCode({ code })
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        setCodeError(error.longMessage ?? error.message ?? "Invalid code.");
        return;
      }
      // Finalize the sign-up to create the session
      const { error: finalErr } = await signUp.finalize();
      if (finalErr) {
        setCodeError(finalErr.longMessage ?? finalErr.message ?? "Could not complete sign-up.");
        return;
      }
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      const e = err as { errors?: { longMessage?: string; message: string }[] };
      setCodeError(e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? "Invalid code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!signUp) return;
    try {
      await signUp.verifications.sendEmailCode();
    } catch {
      // silently ignore — Clerk rate limits resend
    }
  }

  return (
    <div className="w-full rounded-xl border border-border bg-card p-8 shadow-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        {status === "success" ? (
          <>
            <h1 className="text-2xl font-semibold text-foreground dark:text-foreground">Email verified!</h1>
            <p className="mt-1 text-sm text-foreground0 dark:text-muted-foreground">Redirecting to your dashboard…</p>
          </>
        ) : status === "no-signup" ? (
          <>
            <h1 className="text-2xl font-semibold text-foreground dark:text-foreground">Nothing to verify</h1>
            <p className="mt-1 text-sm text-foreground0 dark:text-muted-foreground">Start by signing up for an account.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-foreground dark:text-foreground">Check your email</h1>
            <p className="mt-1 text-sm text-foreground0 dark:text-muted-foreground">
              {email ? <>Code sent to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>.</> : "Enter the verification code sent to your email."}
            </p>
          </>
        )}
      </div>

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
        </div>
      )}

      {status === "no-signup" && (
        <Link href="/signup" className="block w-full text-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700">
          Sign up
        </Link>
      )}

      {status === "input" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label htmlFor="ve-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Verification code</label>
            <input
              id="ve-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-lg font-mono tracking-widest text-foreground outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-border dark:bg-muted dark:text-foreground"
            />
          </div>
          {codeError && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{codeError}</p>}
          <button type="submit" disabled={submitting || code.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>}
            {submitting ? "Verifying…" : "Verify email"}
          </button>
          <button type="button" onClick={handleResend} className="block w-full text-center text-sm text-foreground0 hover:text-violet-600 dark:text-muted-foreground">
            Didn't receive a code? <span className="underline">Resend</span>
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400">← Back to sign in</Link>
      </div>
    </div>
  );
}
