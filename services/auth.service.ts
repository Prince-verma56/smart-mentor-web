/**
 * services/auth.service.ts
 *
 * Backend auth service. Communicates with FastAPI /api/v1/auth/* endpoints.
 * All requests are automatically authenticated via the axios interceptor.
 */

import apiClient from "@/lib/axios";
import type { BackendUser } from "@/types/auth";

export const authService = {
  /**
   * Fetches the current authenticated user from the FastAPI backend.
   * The backend verifies the Clerk JWT and returns decoded user info.
   */
  async getMe(): Promise<BackendUser> {
    const { data } = await apiClient.get<BackendUser>("/api/v1/auth/me");
    return data;
  },

  /**
   * Lightweight token verification endpoint.
   * Useful for verifying the session is still valid on the backend.
   */
  async verifyToken(): Promise<{ valid: boolean; user_id: string }> {
    const { data } = await apiClient.get<{ valid: boolean; user_id: string }>(
      "/api/v1/auth/verify",
    );
    return data;
  },
};
