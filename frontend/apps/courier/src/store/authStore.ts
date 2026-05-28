import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserRole } from '../lib/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  roles: UserRole[];
  displayName: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (userId: string, roles: UserRole[], displayName: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      roles: [],
      displayName: null,
      isAuthenticated: false,
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
      setUser: (userId, roles, displayName) => {
        set({ userId, roles, displayName, isAuthenticated: true });
      },
      setAccessToken: (accessToken) => {
        set({ accessToken, isAuthenticated: true });
      },
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          roles: [],
          displayName: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'courier-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
