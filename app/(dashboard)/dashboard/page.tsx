import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) ?? "student";

  // Role-based redirect to the appropriate dashboard section
  if (role === "admin") redirect("/dashboard/admin");
  if (role === "instructor") redirect("/dashboard/instructor");

  // Default: student dashboard
  redirect("/dashboard/student");
}
