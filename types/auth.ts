// ─── User Roles ───────────────────────────────────────────────────────────────
export type UserRole = "student" | "instructor" | "admin";

// ─── Auth State ───────────────────────────────────────────────────────────────
export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  role: UserRole | null;
}

// ─── Auth User (from Clerk — client-side) ────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  role: UserRole;
}

// ─── Backend Verified User (from FastAPI /api/v1/auth/me) ────────────────────
export interface BackendUser {
  user_id: string;
  email: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  metadata: Record<string, unknown>;
}

// ─── Auth API Payload ─────────────────────────────────────────────────────────
export interface AuthPayload {
  token: string;
}

// ─── Auth Error ───────────────────────────────────────────────────────────────
export interface AuthError {
  code: string;
  message: string;
}
