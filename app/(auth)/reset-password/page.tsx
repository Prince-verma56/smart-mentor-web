"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

function ResetPasswordForm() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [ticketMissing, setTicketMissing] = useState(false);

  const ticket = searchParams.get("__clerk_ticket");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!ticket && !token) {
      setTicketMissing(true);
    }
  }, [ticket, token]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;

    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setStatus("loading");
    setError("");

    try {
      // v7: use ticket-based sign-in first, then submit password
      if (ticket) {
        const { error: ticketErr } = await signIn.ticket({ ticket });
        if (ticketErr) {
          setError(ticketErr.longMessage ?? ticketErr.message ?? "Invalid reset link.");
          setStatus("error");
          return;
        }
      }
      // Submit the new password
      const { error: pwErr } = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (pwErr) {
        setError(pwErr.longMessage ?? pwErr.message ?? "Failed to reset password.");
        setStatus("error");
        return;
      }
      // Finalize the sign-in
      const { error: finalErr } = await signIn.finalize();
      if (finalErr) {
        setError(finalErr.longMessage ?? finalErr.message ?? "Reset incomplete.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      const e = err as { errors?: { longMessage?: string; message: string }[] };
      setError(e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? "Failed to reset password.");
      setStatus("error");
    }
  }

  if (ticketMissing) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
          <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Invalid reset link</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">This link is missing or expired.</p>
        <Link href="/forgot-password" className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {status === "success" ? "Password updated!" : "Set new password"}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {status === "success" ? "Redirecting…" : "Choose a strong password for your account."}
        </p>
      </div>

      {status === "success" ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label htmlFor="rp-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New password</label>
            <div className="relative mt-1">
              <input id="rp-password" type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="rp-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm new password</label>
            <input id="rp-confirm" type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password"
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            {confirmPassword && password !== confirmPassword && <p className="mt-1 text-xs text-rose-500">Passwords do not match.</p>}
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{error}</p>}
          <button type="submit" disabled={status === "loading" || !password || password.length < 8 || password !== confirmPassword}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            {status === "loading" && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>}
            {status === "loading" ? "Updating…" : "Update password"}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400">← Back to sign in</Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
      <Suspense fallback={<div className="flex items-center justify-center py-12"><svg className="h-6 w-6 animate-spin text-violet-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
