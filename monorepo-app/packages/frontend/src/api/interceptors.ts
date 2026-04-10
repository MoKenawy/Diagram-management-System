import { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { privateApi, publicApi } from '@/api/axiosClient';
import { useAuthStore } from '@/stores/authStore';
import { log } from '@/utils/logger';


log.debug('INTERCEPTOR TEST');

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  metadata?: {
    startTime: number;
    requestId: string;
  };
}
const logResponse = (response: AxiosResponse) => {
  const config = response.config as CustomAxiosRequestConfig;
  const duration = Date.now() - (config.metadata?.startTime || Date.now());
  log.info('API Response', {
    url: config.url,
    status: response.status,
    duration,
    requestId: config.metadata?.requestId,
  });
  return response;
};

export const setupInterceptors = () => {
  
  // --- 1. REQUEST LOGGING (Apply to both) ---
  const requestHandler = (config: CustomAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    // Only add token if it's a privateApi call (you can check config.baseURL or a custom flag)
    if (accessToken && config.headers && !config.url?.includes('/auth/refresh')) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    config.headers['x-request-id'] = crypto.randomUUID();
    config.metadata = { startTime: Date.now(), requestId: config.headers['x-request-id'] };
    return config;
  };

  privateApi.interceptors.request.use(requestHandler);
  publicApi.interceptors.request.use(requestHandler);

  // --- 2. PUBLIC API RESPONSE (Logging ONLY) ---
  publicApi.interceptors.response.use(
    logResponse, 
    (error) => Promise.reject(error) // No 401 logic here!
  );

  // --- 3. PRIVATE API RESPONSE (Logging + 401 Refresh Logic) ---
  privateApi.interceptors.response.use(
    logResponse,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;
      
      // Standard logging for errors
      log.error('API Error', error, { url: originalRequest?.url });

      // 🔁 THE REFRESH LOGIC (Only runs for privateApi failures)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const { refreshToken } = useAuthStore.getState();
        // refreshToken calls publicApi internally
        const newToken = await refreshToken(); 

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return privateApi(originalRequest); // Retry
        }
      }

      // Final logout check
      if (error.response?.status === 401 && originalRequest._retry) {
        useAuthStore.getState().logout();
      }

      return Promise.reject(error);
    }
  );
};