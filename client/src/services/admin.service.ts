import api from '@/lib/axios';
import { User, Session, ActivityLog } from '@/types';

export interface SystemStats {
    totalUsers: number;
    activeSessions: number;
    verifiedPercentage: number;
    recentLogins: number;
    loginTrends: { name: string; logins: number }[];
    osDistribution: { name: string; value: number }[];
}

export interface UsersResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface UserDetailsResponse {
    user: User;
    sessions: Session[];
    activity: ActivityLog[];
}

export const adminService = {
    getStats: async (): Promise<SystemStats> => {
        const response = await api.get('/admin/stats');
        return response.data.data;
    },

    getUsers: async (page = 1, limit = 10): Promise<UsersResponse> => {
        const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
        return response.data.data;
    },

    getUserDetails: async (userId: string): Promise<UserDetailsResponse> => {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data.data;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/admin/users/${userId}`);
    },

    revokeSession: async (sessionId: string): Promise<void> => {
        await api.delete(`/admin/sessions/${sessionId}`);
    },
};
