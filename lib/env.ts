/**
 * Validated environment variables for runtime access.
 * All NEXT_PUBLIC_ vars are safe to expose to the client.
 * Non-public vars are server-only.
 */
export const ENV = {
  // Runtime
  NODE_ENV: process.env.NODE_ENV ?? "development",
  IS_DEV: process.env.NODE_ENV === "development",
  IS_PROD: process.env.NODE_ENV === "production",

  // Clerk (public — safe on client)
  CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",

  // Backend API (public — base URL only)
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
} as const;
