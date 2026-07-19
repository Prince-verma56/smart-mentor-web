"use client";

/**
 * hooks/useAuth.ts
 *
 * Thin wrapper around Clerk's useAuth + useUser hooks.
 * Exposes typed, consistent auth state across the app.
 *
 * This is the ONLY auth hook that should be used in client components.
 * Do NOT use Clerk hooks directly in components — use this instead.
 */

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import type { UserRole, AuthState, AuthUser } from "@/types/auth";

export interface UseAuthReturn extends AuthState {
  user: AuthUser | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const {
    isLoaded: authLoaded,
    isSignedIn,
    userId,
    getToken,
    signOut,
  } = useClerkAuth();

  const { isLoaded: userLoaded, user: clerkUser } = useUser();

  const isLoaded = authLoaded && userLoaded;
  const role = (clerkUser?.publicMetadata?.role as UserRole) ?? "student";

  const user: AuthUser | null =
    isLoaded && isSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          role,
        }
      : null;

  return {
    isLoaded,
    isSignedIn: !!isSignedIn,
    userId: userId ?? null,
    role: isSignedIn ? role : null,
    user,
    getToken: async () => getToken(),
    signOut: async () => {
      await signOut();
    },
  };
}
