import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserRole, BackendUser } from "@/types/auth";

interface AuthStoreState {
  // Backend-verified user (from FastAPI)
  backendUser: BackendUser | null;
  role: UserRole;
  isHydrated: boolean;

  // Actions
  setBackendUser: (user: BackendUser | null) => void;
  setRole: (role: UserRole) => void;
  setHydrated: (value: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  backendUser: null,
  role: "student" as UserRole,
  isHydrated: false,
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setBackendUser: (user) =>
        set({ backendUser: user, role: user?.role ?? "student" }),

      setRole: (role) => set({ role }),

      setHydrated: (value) => set({ isHydrated: value }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: "supermentor-auth",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        backendUser: state.backendUser,
        role: state.role,
      }),
    },
  ),
);
