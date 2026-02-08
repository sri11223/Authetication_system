import apiClient from '@/lib/axios';
import { ApiResponse, LoginResponse, User } from '@/types';

export const authService = {
  register: async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post<ApiResponse>('/auth/verify-email', { token });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: { token: string; password: string; confirmPassword: string }) => {
    const response = await apiClient.post<ApiResponse>('/auth/reset-password', data);
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await apiClient.post<ApiResponse>('/auth/resend-verification', { email });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  logoutAll: async () => {
    const response = await apiClient.post<ApiResponse>('/auth/logout-all');
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token');
    return response.data;
  },
};
