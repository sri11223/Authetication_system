import apiClient from '@/lib/axios';
import { ApiResponse, LoginResponse, User, ActivityLog } from '@/types';
import { getClientPublicIp } from '@/utils/ip';

export const authService = {
  register: async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    // Try to get real public IP and send it to backend for better IP detection
    let realIp: string | null = null;
    try {
      realIp = await getClientPublicIp();
    } catch {
      // Ignore errors, continue without real IP
    }

    const headers: Record<string, string> = {};
    if (realIp) {
      headers['x-client-real-ip'] = realIp;
    }

    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data, { headers });
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

  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await apiClient.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  updateProfile: async (data: { name: string }) => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data;
  },

  getActivityLog: async (limit = 50) => {
    const response = await apiClient.get<ApiResponse<{ activities: ActivityLog[]; total: number }>>(
      `/auth/activity?limit=${limit}`
    );
    return response.data;
  },

  deleteAccount: async (password: string) => {
    const response = await apiClient.delete<ApiResponse>('/auth/account', { data: { password } });
    return response.data;
  },

  updateEmailNotifications: async (enabled: boolean) => {
    const response = await apiClient.patch<ApiResponse<{ emailNotifications: boolean }>>(
      '/auth/email-notifications',
      { enabled }
    );
    return response.data;
  },
};
