import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import apiClient from "@/api/client";
import type { User, JwtPayload } from "../types/types";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { refreshAccessToken } from "../api/api";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface AuthState {
  user: User | null;
  usuario: User | null; // Compatibility alias for existing codebase
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshToken: () => Promise<string | null>;
  updateUser: (user: User) => void;
  setAuth: (user: User, accessToken: string) => void;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}

const checkTokenExpiry = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  usuario: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  clearAuth: () => {
    localStorage.removeItem("hasSession");
    set({ user: null, usuario: null, accessToken: null, isAuthenticated: false });
  },

  updateUser: (user: User) => {
    set({ user, usuario: user });
  },

  setAuth: (user: User, accessToken: string) => {
    localStorage.setItem("hasSession", "true");
    set({ user, usuario: user, accessToken, isAuthenticated: checkTokenExpiry(accessToken) });
  },

  initializeAuth: async () => {
    if (localStorage.getItem("hasSession") !== "true") {
      set({ isLoading: false, user: null, usuario: null, accessToken: null, isAuthenticated: false });
      return;
    }
    const { accessToken } = get();
    if (accessToken && checkTokenExpiry(accessToken)) {
      set({ isLoading: false, isAuthenticated: true });
      return;
    }
    try {
      await get().refreshToken();
    } catch {
      set({ user: null, usuario: null, accessToken: null, isAuthenticated: false });
      localStorage.removeItem("hasSession");
    } finally {
      set({ isLoading: false });
    }
  },

  refreshToken: async (): Promise<string | null> => {
    try {
      const { user, accessToken: newAccessToken } = await refreshAccessToken();
      set({ user, usuario: user, accessToken: newAccessToken, isAuthenticated: checkTokenExpiry(newAccessToken) });
      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", (error as AxiosError).response?.data);
      get().clearAuth();
      return null;
    }
  },
}));

// Request interceptor
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && !config._retry) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      const newToken = await useAuthStore.getState().refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);
