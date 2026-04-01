// src/services/api/authService.ts

import axios, {
  AxiosError
} from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import type { LoginRequest, LoginResponse, User } from '@/types/index';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // For refresh token cookie
});

// Request interceptor: attach Authorization header
authApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 → refresh → retry once
authApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // If no config or already retried, reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken } = useAuthStore.getState();
      const newToken = await refreshToken();

      if (newToken) {
        // Update the header and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authApi(originalRequest);
      }

      // refreshToken() already called logout() if it failed
      return Promise.reject(error);
    }

    // If 401 on retry (second 401), logout
    if (error.response?.status === 401 && originalRequest._retry) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);




export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await authApi.post<LoginResponse>('/api/auth/login', credentials);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await authApi.post('/api/auth/logout');
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await authApi.post<{ accessToken: string }>('/api/auth/refresh');
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await authApi.get<User>('/api/auth/me');
  return response.data;
};