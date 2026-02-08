import apiClient from '@/lib/axios';
import { ApiResponse, LoginResponse, User, ActivityLog } from '@/types';
import { getClientPublicIp } from '@/utils/ip';

export const authService = {
  register: async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    console.log('[AuthService] Login attempt for:', data.email);
    console.log('[AuthService] API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
    
    // Try to get real public IP and send it to backend for better IP detection
    let realIp: string | null = null;
    try {
      realIp = await getClientPublicIp();
      console.log('[AuthService] Client IP detected:', realIp);
    } catch (error) {
      console.warn('[AuthService] Failed to get client IP:', error);
    }

    const headers: Record<string, string> = {};
    if (realIp) {
      headers['x-client-real-ip'] = realIp;
    }

    try {
      console.log('[AuthService] Sending login request to /auth/login');
      const response = await apiClient.post<ApiResponse<LoginResponse> & { requires2FA?: boolean; data?: { userId?: string } }>('/auth/login', data, { headers });
      console.log('[AuthService] Login response received:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Login error:', error);
      console.error('[AuthService] Error response:', error?.response?.data);
      console.error('[AuthService] Error status:', error?.response?.status);
      // Re-throw with proper error message
      throw error;
    }
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

  loginWith2FA: async (data: { userId: string; token: string }) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login-2fa', data);
    return response.data;
  },

  generate2FASecret: async () => {
    const response = await apiClient.get<ApiResponse<{ secret: string; qrCode: string; manualEntryKey: string }>>(
      '/auth/2fa/secret'
    );
    return response.data;
  },

  enable2FA: async (token: string) => {
    const response = await apiClient.post<ApiResponse<{ backupCodes: string[] }>>('/auth/2fa/enable', { token });
    return response.data;
  },

  disable2FA: async (password: string) => {
    const response = await apiClient.post<ApiResponse>('/auth/2fa/disable', { password });
    return response.data;
  },
};
