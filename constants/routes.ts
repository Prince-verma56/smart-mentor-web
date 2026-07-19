/**
 * constants/routes.ts
 *
 * Canonical URL map for the SuperMentor AI application.
 * Always use these constants instead of hard-coding paths.
 */

export const ROUTES = {
  // ─── Public ───────────────────────────────────────────────────────────────
  home: "/",
  about: "/about",
  contact: "/contact",
  pricing: "/pricing",
  features: "/features",

  // ─── Auth ─────────────────────────────────────────────────────────────────
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",

  // ─── Dashboard (authenticated) ────────────────────────────────────────────
  dashboard: "/dashboard",
  adminDashboard: "/dashboard/admin",
  instructorDashboard: "/dashboard/instructor",
  studentDashboard: "/dashboard/student",

  // ─── OAuth callback ───────────────────────────────────────────────────────
  ssoCallback: "/sso-callback",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
