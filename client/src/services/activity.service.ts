import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types';

export interface DailyLogin {
    date: string;
    day: string;
    count: number;
}

export interface SecurityScoreBreakdown {
    emailVerified: { points: number; earned: boolean };
    twoFactorEnabled: { points: number; earned: boolean };
    recentPasswordChange: { points: number; earned: boolean };
    activeSessions: { points: number; earned: boolean };
    accountAge: { points: number; earned: boolean };
}

export interface SecurityScore {
    score: number;
    maxScore: number;
    breakdown: SecurityScoreBreakdown;
}

export interface ActivityStats {
    dailyLogins: DailyLogin[];
    totalLogins: number;
    securityScore: SecurityScore;
    activeSessions: number;
}

export interface Activity {
    _id: string;
    userId: string;
    type: string;
    description: string;
    ip: string;
    userAgent: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    timeAgo: string;
}

export interface RecentActivityResponse {
    activities: Activity[];
    total: number;
}

export const activityService = {
    /**
     * Get activity stats including 7-day login chart and security score
     */
    getStats: async (): Promise<ApiResponse<ActivityStats>> => {
        const response = await apiClient.get<ApiResponse<ActivityStats>>('/activity/stats');
        return response.data;
    },

    /**
     * Get recent activity for timeline
     */
    getRecentActivity: async (limit = 10): Promise<ApiResponse<RecentActivityResponse>> => {
        const response = await apiClient.get<ApiResponse<RecentActivityResponse>>(
            `/activity/recent?limit=${limit}`
        );
        return response.data;
    },
};
