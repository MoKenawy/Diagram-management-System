// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginRequest, LoginResponse } from '@/types/index';
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
  refreshToken as refreshTokenApi,
} from '../services/api/authService';
import { AxiosError } from 'axios';

// ─── Helper ────────────────────────────────────────────────────
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    if (data?.message) {
      return data.message;
    }

    if (error.response?.status === 423) {
      return 'Account is locked. Please contact an administrator.';
    }

    if (error.response?.status === 401) {
      return 'Invalid username or password.';
    }

    if (!error.response) {
      return 'Network error. Please check your connection.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

// ─── State Types ───────────────────────────────────────────────
interface AuthState {
  user: User | null;
  accessToken: LoginResponse['accessToken'] | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<Pick<LoginResponse, 'accessToken'>>;
  setAccessToken: (token: LoginResponse['accessToken']) => void;
  clearError: () => void;
}

// ─── Store ─────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response: LoginResponse = await loginApi(credentials);
          set({
            user: response.user,
            accessToken: response.accessToken,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = extractErrorMessage(error);
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await logoutApi();
        } catch (error: unknown) {
          console.error('Logout failed:', extractErrorMessage(error));
        } finally {
          set({ user: null, accessToken: null, isLoading: false, error: null });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const user: User = await getCurrentUser();
          set({ user, isLoading: false });
        } catch {
          set({ user: null, accessToken: null, isLoading: false });
        }
      },

      refreshToken: async () => {
        try {
          const response: Pick<LoginResponse, 'accessToken'> = await refreshTokenApi();
          set({ accessToken: response.accessToken });
          return response;
        } catch (error: unknown) {
          set({ user: null, accessToken: null });
          throw error;
        }
      },

      setAccessToken: (token: LoginResponse['accessToken']) => {
        set({ accessToken: token });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state): Pick<AuthState, 'user' | 'accessToken'> => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);