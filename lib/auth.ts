/**
 * lib/auth.ts
 *
 * Server-side Clerk helpers. Only import in Server Components,
 * Route Handlers, and Server Actions.
 *
 * Do NOT import in Client Components — use hooks/useAuth.ts instead.
 */

export { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Retrieves the current authenticated user and throws an error
 * if the user is not signed in. Use in protected Server Components.
 */
export async function requireServerAuth() {
  const { auth: clerkAuth } = await import("@clerk/nextjs/server");
  const { redirect } = await import("next/navigation");

  const { userId } = await clerkAuth();
  if (!userId) {
    redirect("/login");
  }
  return userId;
}

/**
 * Reads the user's role from Clerk's publicMetadata.
 * Falls back to "student" if no role is set.
 */
export async function getServerUserRole(): Promise<"student" | "instructor" | "admin"> {
  const { currentUser: clerkCurrentUser } = await import("@clerk/nextjs/server");
  const user = await clerkCurrentUser();
  return (user?.publicMetadata?.role as "student" | "instructor" | "admin") ?? "student";
}
