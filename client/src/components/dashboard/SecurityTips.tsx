'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Shield, Key, Smartphone, Monitor, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SecurityScore } from '@/services/activity.service';
import { ROUTES } from '@/constants/routes';

interface SecurityTipsProps {
    score: SecurityScore;
    activeSessions: number;
}

interface Tip {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    action: { label: string; href: string };
    priority: number;
}

export const SecurityTips: React.FC<SecurityTipsProps> = ({ score, activeSessions }) => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    // Generate tips based on security status
    const generateTips = (): Tip[] => {
        const tips: Tip[] = [];

        if (!score.breakdown.twoFactorEnabled.earned) {
            tips.push({
                id: '2fa',
                title: 'Enable Two-Factor Authentication',
                description: 'Add an extra layer of security to your account with 2FA. It protects you even if your password is compromised.',
                icon: Smartphone,
                color: 'from-purple-500 to-pink-500',
                action: { label: 'Enable 2FA', href: ROUTES.SECURITY },
                priority: 1,
            });
        }

        if (!score.breakdown.recentPasswordChange.earned) {
            tips.push({
                id: 'password',
                title: 'Update Your Password',
                description: 'Your password hasn\'t been changed in over 90 days. Regular password updates help keep your account secure.',
                icon: Key,
                color: 'from-amber-500 to-orange-500',
                action: { label: 'Change Password', href: ROUTES.SECURITY },
                priority: 2,
            });
        }

        if (!score.breakdown.activeSessions.earned) {
            tips.push({
                id: 'sessions',
                title: 'Review Active Sessions',
                description: `You have ${activeSessions} active sessions. Consider revoking sessions you don't recognize.`,
                icon: Monitor,
                color: 'from-blue-500 to-cyan-500',
                action: { label: 'Manage Sessions', href: ROUTES.SESSIONS },
                priority: 3,
            });
        }

        if (!score.breakdown.emailVerified.earned) {
            tips.push({
                id: 'email',
                title: 'Verify Your Email',
                description: 'A verified email helps you recover your account and receive important security alerts.',
                icon: Shield,
                color: 'from-emerald-500 to-green-500',
                action: { label: 'Verify Email', href: ROUTES.SECURITY },
                priority: 0,
            });
        }

        // If all secured, show congratulations
        if (tips.length === 0) {
            tips.push({
                id: 'secure',
                title: 'Your Account is Well Protected!',
                description: 'Great job! You\'ve enabled all recommended security features. Keep up the good security hygiene!',
                icon: Shield,
                color: 'from-emerald-500 to-green-500',
                action: { label: 'Security Settings', href: ROUTES.SECURITY },
                priority: 10,
            });
        }

        return tips.sort((a, b) => a.priority - b.priority);
    };

    const tips = generateTips();

    // Auto-rotate tips every 8 seconds
    useEffect(() => {
        if (tips.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [tips.length]);

    const currentTip = tips[currentTipIndex];
    const Icon = currentTip.icon;

    return (
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">Security Tips</h3>
                </div>
                {tips.length > 1 && (
                    <div className="flex gap-1">
                        {tips.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentTipIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentTipIndex ? 'bg-purple-500 w-4' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="relative overflow-hidden">
                <div
                    className="transition-all duration-500 ease-in-out"
                    key={currentTip.id}
                >
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${currentTip.color} rounded-full mb-3`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-medium text-white">{currentTip.title}</span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {currentTip.description}
                    </p>

                    <Link href={currentTip.action.href}>
                        <button className="inline-flex items-center gap-1 text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors group">
                            {currentTip.action.label}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
