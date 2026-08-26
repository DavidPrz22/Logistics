import apiClient from '@/api/client';
import type { LoginInput, RegisterInput, AuthResponse } from '../schemas/schemas';
import type { User } from '../types/types';

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>('/auth/logout');
  return response.data;
};

export const register = async (data: Omit<RegisterInput, 'confirmarPassword'>): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const refreshAccessToken = async (): Promise<{ user: User; accessToken: string }> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh-token');
  console.log(response.data);
  return {
    user: response.data.usuario,
    accessToken: response.data.accessToken,
  };
};
