import apiClient from '@/api/client';
import type { LoginInput, RegisterInput, AuthResponse } from '../schemas/schemas';

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const register = async (data: Omit<RegisterInput, 'confirmarPassword'>): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};
