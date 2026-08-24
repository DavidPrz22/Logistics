import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '../schemas/schemas';

interface AuthState {
  usuario: Usuario | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (usuario: Usuario, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hidratar: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (usuario, accessToken, refreshToken) =>
        set({
          usuario,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          usuario: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      hidratar: () => {
        // This is handled by persist middleware
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
