/**
 * lib/axios.ts
 *
 * Axios instance pre-configured for the SuperMentor AI FastAPI backend.
 *
 * IMPORTANT: This module is client-side only. It uses Clerk's getToken()
 * from the browser session to attach Authorization: Bearer <token> to
 * every outgoing API request.
 *
 * For server-side data fetching, use fetch() with auth() from lib/auth.ts.
 */

import axios from "axios";
import { ENV } from "@/lib/env";

// ─── Base Instance ─────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

// ─── Request Interceptor — Attach Bearer Token ────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // window.__clerk_frontend_api is set by ClerkProvider
      // We access the session token through Clerk's global client
      const { Clerk } = window as unknown as {
        Clerk?: { session?: { getToken: () => Promise<string | null> } };
      };
      const token = await Clerk?.session?.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If Clerk isn't ready, proceed without token (public endpoints)
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — Handle Auth Errors ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
