import apiClient from '@/lib/axios';
import { ApiResponse, Session } from '@/types';

export const sessionService = {
  getActiveSessions: async () => {
    const response = await apiClient.get<ApiResponse<{ sessions: Session[]; total: number }>>('/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string) => {
    const response = await apiClient.delete<ApiResponse>(`/sessions/${sessionId}`);
    return response.data;
  },

  revokeOtherSessions: async () => {
    const response = await apiClient.delete<ApiResponse>('/sessions');
    return response.data;
  },
};
