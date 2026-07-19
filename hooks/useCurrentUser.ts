"use client";

/**
 * hooks/useCurrentUser.ts
 *
 * Returns the backend-verified user from the FastAPI /api/v1/auth/me endpoint.
 * Uses TanStack Query for caching and deduplication.
 *
 * The difference between useAuth and useCurrentUser:
 *   - useAuth: Clerk session state (fast, local, from browser)
 *   - useCurrentUser: Backend-verified user with role from FastAPI (network call)
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import type { BackendUser } from "@/types/auth";

interface UseCurrentUserReturn {
  user: BackendUser | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const { isSignedIn, isLoaded } = useAuth();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BackendUser, Error>({
    queryKey: ["current-user"],
    queryFn: () => authService.getMe(),
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1_000, // 5 minutes
    retry: false,
  });

  return {
    user: user ?? null,
    isLoading: isLoaded && isSignedIn ? isLoading : false,
    isError,
    error: error ?? null,
    refetch,
  };
}
