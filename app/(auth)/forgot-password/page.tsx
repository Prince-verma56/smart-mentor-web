"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "done">("request");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Send reset code to email
  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError("");
    try {
      // v7 API: signIn.create({ strategy: "reset_password_email_code", identifier })
      const { error: createErr } = await signIn.create({
        identifier: email,
        strategy: "reset_password_email_code" as never,
      });
      if (createErr) {
        setError(createErr.longMessage ?? createErr.message ?? "Something went wrong.");
        return;
      }
      // After create with reset_password_email_code, send the code
      const { error: sendErr } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendErr) {
        setError(sendErr.longMessage ?? sendErr.message ?? "Failed to send code.");
        return;
      }
      setStep("verify");
    } catch (err: unknown) {
      const e = err as { errors?: { longMessage?: string; message: string }[] };
      setError(e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify code + set new password
  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError("");
    try {
      // Verify the code first
      const { error: verifyErr } = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verifyErr) {
        setError(verifyErr.longMessage ?? verifyErr.message ?? "Invalid code.");
        return;
      }
      // Submit new password (status becomes 'complete' after this)
      const { error: pwErr } = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
      if (pwErr) {
        setError(pwErr.longMessage ?? pwErr.message ?? "Failed to set password.");
        return;
      }
      // Finalize to create the session
      await signIn.finalize();
      setStep("done");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      const e = err as { errors?: { longMessage?: string; message: string }[] };
      setError(e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {step === "done" ? "Password reset!" : "Forgot password?"}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {step === "request" && "Enter your email and we'll send a reset code."}
          {step === "verify" && `Enter the code sent to ${email} and your new password.`}
          {step === "done" && "Redirecting you to the dashboard…"}
        </p>
      </div>

      {/* Step 1 */}
      {step === "request" && (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label htmlFor="fp-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{error}</p>}
          <button type="submit" disabled={loading || !email} className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>}
            {loading ? "Sending…" : "Send reset code"}
          </button>
        </form>
      )}

      {/* Step 2: Verify code + new password */}
      {step === "verify" && (
        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          <div>
            <label htmlFor="fp-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reset code</label>
            <input id="fp-code" type="text" inputMode="numeric" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code"
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>
          <div>
            <label htmlFor="fp-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New password</label>
            <div className="relative mt-1">
              <input id="fp-password" type={showPassword ? "text" : "password"} required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters"
                className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label={showPassword ? "Hide" : "Show"}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{error}</p>}
          <button type="submit" disabled={loading || !code || newPassword.length < 8} className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>}
            {loading ? "Resetting…" : "Reset password"}
          </button>
          <button type="button" onClick={() => { setStep("request"); setError(""); }} className="block w-full text-center text-sm text-slate-500 hover:text-violet-600">← Use a different email</button>
        </form>
      )}

      {/* Step 3: Done */}
      {step === "done" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Password changed successfully!</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400">← Back to sign in</Link>
      </div>
    </div>
  );
}
