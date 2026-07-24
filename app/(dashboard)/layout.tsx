import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Dashboard — SuperMentor AI",
    default: "Dashboard | SuperMentor AI",
  },
  description: "Your SuperMentor AI dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="flex-1 flex flex-col w-full bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex-1">
        {children}
      </main>
    </div>
  );
}
