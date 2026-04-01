// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

export type UserRole = 'VIEWER' | 'ENGINEER' | 'DC' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  departmentId: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;

  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      login: async (credentials: { username: string; password: string }) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/api/auth/login', credentials, {
            withCredentials: true,
          });

          const { user, accessToken } = response.data;

          set({
            user,
            accessToken,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Fire-and-forget logout request
        const token = get().accessToken;
        if (token) {
          axios
            .post(
              '/api/auth/logout',
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              }
            )
            .catch(() => {
              // Silently ignore logout API errors
            });
        }

        set({
          user: null,
          accessToken: null,
          isLoading: false,
        });
      },

      refreshToken: async () => {
        try {
          const response = await axios.post(
            '/api/auth/refresh',
            {},
            {
              withCredentials: true,
            }
          );

          const { accessToken, user } = response.data;

          set({ accessToken, user });
          return accessToken;
        } catch {
          get().logout();
          return null;
        }
      },

      setUser: (user: User | null) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);