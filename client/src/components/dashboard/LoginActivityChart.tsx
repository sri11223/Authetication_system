'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { DailyLogin } from '@/services/activity.service';

interface LoginActivityChartProps {
    data: DailyLogin[];
    isLoading?: boolean;
}

export const LoginActivityChart: React.FC<LoginActivityChartProps> = ({ data, isLoading }) => {
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
                <div className="animate-pulse">
                    <div className="h-4 w-32 bg-slate-700 rounded mb-6" />
                    <div className="flex items-end gap-2 h-32">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="flex-1 bg-slate-700 rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">Login Activity</h3>
                </div>
                <span className="text-xs text-slate-500">Last 7 days</span>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-2 h-32 mb-4">
                {data.map((day, index) => {
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    const isToday = index === data.length - 1;

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center group">
                            {/* Tooltip */}
                            <div className="relative mb-1">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {day.count} login{day.count !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {/* Bar */}
                            <div
                                className={`w-full rounded-t transition-all duration-500 ${isToday
                                        ? 'bg-gradient-to-t from-purple-600 to-pink-500'
                                        : 'bg-gradient-to-t from-blue-600 to-cyan-400 opacity-70 hover:opacity-100'
                                    }`}
                                style={{ height: `${Math.max(height, 4)}%` }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Day labels */}
            <div className="flex gap-2">
                {data.map((day, index) => {
                    const isToday = index === data.length - 1;
                    return (
                        <div key={day.date} className="flex-1 text-center">
                            <span className={`text-xs ${isToday ? 'text-purple-400 font-semibold' : 'text-slate-500'}`}>
                                {isToday ? 'Today' : day.day}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-surface-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-sm text-slate-500">Total logins this week</span>
                <span className="text-lg font-bold text-surface-900 dark:text-white">
                    {data.reduce((sum, d) => sum + d.count, 0)}
                </span>
            </div>
        </div>
    );
};
