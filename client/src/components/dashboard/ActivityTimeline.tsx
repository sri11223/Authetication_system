'use client';

import React from 'react';
import { History, LogIn, LogOut, Key, Shield, CheckCircle, Settings, AlertCircle } from 'lucide-react';
import { Activity } from '@/services/activity.service';

interface ActivityTimelineProps {
    activities: Activity[];
    isLoading?: boolean;
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'login':
            return { icon: LogIn, color: 'from-emerald-500 to-green-500' };
        case 'logout':
        case 'logout_all':
            return { icon: LogOut, color: 'from-slate-500 to-gray-500' };
        case 'password_reset':
        case 'password_changed':
            return { icon: Key, color: 'from-amber-500 to-orange-500' };
        case 'email_verified':
            return { icon: CheckCircle, color: 'from-blue-500 to-cyan-500' };
        case 'session_revoked':
            return { icon: AlertCircle, color: 'from-red-500 to-rose-500' };
        case 'profile_updated':
            return { icon: Settings, color: 'from-purple-500 to-pink-500' };
        default:
            return { icon: Shield, color: 'from-slate-500 to-gray-500' };
    }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
                <div className="animate-pulse">
                    <div className="h-4 w-32 bg-slate-700 rounded mb-6" />
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-8 h-8 bg-slate-700 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-3 w-3/4 bg-slate-700 rounded mb-2" />
                                    <div className="h-2 w-1/4 bg-slate-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Recent Activity</h3>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {activities.map((activity, index) => {
                        const { icon: Icon, color } = getActivityIcon(activity.type);
                        const isLast = index === activities.length - 1;

                        return (
                            <div key={activity._id} className="relative flex gap-3">
                                {/* Timeline line */}
                                {!isLast && (
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 dark:from-slate-600 to-transparent" />
                                )}

                                {/* Icon */}
                                <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br ${color} rounded-full flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                    <p className="text-sm text-surface-800 dark:text-white font-medium">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                        <span>{activity.timeAgo}</span>
                                        {activity.ip && activity.ip !== 'Unknown' && (
                                            <>
                                                <span>•</span>
                                                <span className="font-mono">{activity.ip}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
