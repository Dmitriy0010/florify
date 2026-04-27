import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) => {
        set({ accessToken, refreshToken, user });
      },
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'florify-admin-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
