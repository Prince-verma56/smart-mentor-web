import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/login");

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-foreground0 dark:text-muted-foreground">
          Manage users, courses, and platform settings.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
        <p className="text-sm text-slate-600 dark:text-muted-foreground">
          Admin features coming soon.
        </p>
      </div>
    </div>
  );
}
