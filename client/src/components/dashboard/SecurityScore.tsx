'use client';

import React from 'react';
import { Shield, Check, X } from 'lucide-react';
import { SecurityScore as SecurityScoreType } from '@/services/activity.service';

interface SecurityScoreProps {
    score: SecurityScoreType;
    isLoading?: boolean;
}

export const SecurityScore: React.FC<SecurityScoreProps> = ({ score, isLoading }) => {
    const percentage = Math.round((score.score / score.maxScore) * 100);
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getScoreColor = () => {
        if (percentage >= 80) return { stroke: '#10b981', bg: 'from-emerald-500 to-green-500' };
        if (percentage >= 60) return { stroke: '#f59e0b', bg: 'from-amber-500 to-orange-500' };
        if (percentage >= 40) return { stroke: '#f97316', bg: 'from-orange-500 to-red-500' };
        return { stroke: '#ef4444', bg: 'from-red-500 to-rose-500' };
    };

    const getScoreLabel = () => {
        if (percentage >= 80) return 'Excellent';
        if (percentage >= 60) return 'Good';
        if (percentage >= 40) return 'Fair';
        return 'Needs Work';
    };

    const colors = getScoreColor();

    const breakdownItems = [
        { key: 'emailVerified', label: 'Email Verified' },
        { key: 'twoFactorEnabled', label: '2FA Enabled' },
        { key: 'recentPasswordChange', label: 'Password Updated (90 days)' },
        { key: 'activeSessions', label: 'Limited Sessions (≤3)' },
        { key: 'accountAge', label: 'Account Age (>7 days)' },
    ];

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-32 h-32 bg-slate-700 rounded-full mb-4" />
                    <div className="h-4 w-24 bg-slate-700 rounded mb-2" />
                    <div className="h-3 w-32 bg-slate-700 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className={`w-8 h-8 bg-gradient-to-br ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Shield className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Security Score</h3>
            </div>

            {/* Circular Progress */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            className="text-slate-200 dark:text-slate-700"
                            strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={colors.stroke}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-surface-900 dark:text-white">{percentage}</span>
                        <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                </div>
                <span className={`mt-3 text-sm font-semibold`} style={{ color: colors.stroke }}>
                    {getScoreLabel()}
                </span>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
                {breakdownItems.map((item) => {
                    const data = score.breakdown[item.key as keyof typeof score.breakdown];
                    return (
                        <div
                            key={item.key}
                            className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-white/5 last:border-0"
                        >
                            <div className="flex items-center gap-2">
                                {data.earned ? (
                                    <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <X className="w-4 h-4 text-slate-400" />
                                )}
                                <span className={`text-sm ${data.earned ? 'text-surface-700 dark:text-white' : 'text-slate-400'}`}>
                                    {item.label}
                                </span>
                            </div>
                            <span className={`text-xs font-medium ${data.earned ? 'text-emerald-500' : 'text-slate-400'}`}>
                                +{data.points}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
