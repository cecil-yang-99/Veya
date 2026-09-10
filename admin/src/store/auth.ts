import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminProfile } from '../types';

/**
 * Authentication state, persisted to localStorage so a page refresh keeps
 * the session until the token expires or the user logs out.
 */
interface AuthState {
  token: string | null;
  admin: AdminProfile | null;
  setAuth: (token: string, admin: AdminProfile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      clearAuth: () => set({ token: null, admin: null }),
    }),
    { name: 'veya-admin-auth' },
  ),
);

/** Convenience selector: true for full-access administrators. */
export const isSuperAdmin = (admin: AdminProfile | null): boolean =>
  admin?.role === 'super_admin';
