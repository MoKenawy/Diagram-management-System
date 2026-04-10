import { privateApi, publicApi } from '@/api/axiosClient';
import type { LoginRequest, LoginResponse, User } from '@/types/index';

/**
 * Handles user login. 
 * Uses publicApi because we don't have a token yet.
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await publicApi.post<LoginResponse>('/api/auth/login', credentials);
    return data;
};



export const refreshToken = async (): Promise<{ accessToken: string }> => {
    console.log('Attempting to refresh token...');
    const response = await publicApi.post<{ accessToken: string }>('/api/auth/refresh');
    return response.data;
};




/**
 * Logs the user out.
 * Uses privateApi to ensure the current session token is sent for invalidation.
 */
export const logout = async (): Promise<void> => {
    await privateApi.post('/api/auth/logout');
};


/**
 * Fetches the current authenticated user's profile.
 */
export const getCurrentUser = async (): Promise<User> => {
    const { data } = await privateApi.get<User>('/api/auth/me');
    return data;
};