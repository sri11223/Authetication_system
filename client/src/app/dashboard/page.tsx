'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { sessionService } from '@/services/session.service';
import { activityService, ActivityStats, Activity } from '@/services/activity.service';
import { SecurityScore } from '@/components/dashboard/SecurityScore';
import { LoginActivityChart } from '@/components/dashboard/LoginActivityChart';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { SecurityTips } from '@/components/dashboard/SecurityTips';
import {
  Shield,
  Monitor,
  Mail,
  Calendar,
  CheckCircle,
  ArrowRight,
  Lock,
  Fingerprint,
  Activity as ActivityIcon,
  Clock,
  User,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch session count
        const sessionResponse = await sessionService.getActiveSessions();
        if (sessionResponse.success && sessionResponse.data) {
          setSessionCount(sessionResponse.data.total);
        }

        // Fetch activity stats
        const statsResponse = await activityService.getStats();
        if (statsResponse.success && statsResponse.data) {
          setActivityStats(statsResponse.data);
        }

        // Fetch recent activity
        const activityResponse = await activityService.getRecentActivity(8);
        if (activityResponse.success && activityResponse.data) {
          setRecentActivity(activityResponse.data.activities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Default security score for loading state
  const defaultSecurityScore = {
    score: 0,
    maxScore: 100,
    breakdown: {
      emailVerified: { points: 25, earned: false },
      twoFactorEnabled: { points: 30, earned: false },
      recentPasswordChange: { points: 20, earned: false },
      activeSessions: { points: 15, earned: false },
      accountAge: { points: 10, earned: false },
    },
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/30">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
                  {getGreeting()}, {user?.name?.split(' ')[0]}!
                </h1>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-surface-500 dark:text-slate-400 text-sm">
                Here&apos;s an overview of your account security status
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-5 hover:shadow-lg dark:hover:shadow-purple-500/5 hover:border-green-200 dark:hover:border-green-500/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <Badge variant={user?.isEmailVerified ? 'success' : 'warning'}>
                {user?.isEmailVerified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Email Status</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white mt-0.5">
              {user?.isEmailVerified ? 'Confirmed' : 'Unverified'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-5 hover:shadow-lg dark:hover:shadow-purple-500/5 hover:border-blue-200 dark:hover:border-blue-500/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${(activityStats?.securityScore?.breakdown?.twoFactorEnabled?.earned || user?.twoFactorEnabled) ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-blue-100 dark:bg-blue-500/20'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Shield className={`w-5 h-5 ${(activityStats?.securityScore?.breakdown?.twoFactorEnabled?.earned || user?.twoFactorEnabled) ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
              </div>
              <Badge variant={(activityStats?.securityScore?.breakdown?.twoFactorEnabled?.earned || user?.twoFactorEnabled) ? 'success' : 'warning'}>
                {(activityStats?.securityScore?.breakdown?.twoFactorEnabled?.earned || user?.twoFactorEnabled) ? '2FA On' : '2FA Off'}
              </Badge>
            </div>
            <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Security</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white mt-0.5">
              {(activityStats?.securityScore?.breakdown?.twoFactorEnabled?.earned || user?.twoFactorEnabled) ? 'Protected' : 'Basic'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-5 hover:shadow-lg dark:hover:shadow-purple-500/5 hover:border-purple-200 dark:hover:border-purple-500/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Active Sessions</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white mt-0.5">{sessionCount} {sessionCount === 1 ? 'Device' : 'Devices'}</p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-5 hover:shadow-lg dark:hover:shadow-purple-500/5 hover:border-amber-200 dark:hover:border-amber-500/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Auth Method</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white mt-0.5">JWT + Cookies</p>
          </div>
        </div>

        {/* Main Content Grid - 3 columns */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Security Score */}
          <SecurityScore
            score={activityStats?.securityScore || defaultSecurityScore}
            isLoading={isLoading}
          />

          {/* Login Activity Chart */}
          <LoginActivityChart
            data={activityStats?.dailyLogins || []}
            isLoading={isLoading}
          />

          {/* Security Tips */}
          <SecurityTips
            score={activityStats?.securityScore || defaultSecurityScore}
            activeSessions={activityStats?.activeSessions || sessionCount}
          />
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Profile Information</h2>
                <p className="text-sm text-surface-500 dark:text-slate-400">Your account details and verification status</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Full Name</p>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Email</p>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Member Since</p>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Account ID</p>
                    <p className="text-sm font-mono text-surface-600 dark:text-slate-400 truncate">{user?.id?.slice(0, 12)}...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link href={ROUTES.SESSIONS}>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-slate-800/50 hover:bg-surface-100 dark:hover:bg-slate-800 border border-surface-200 dark:border-white/5 rounded-xl text-surface-700 dark:text-white transition-all group">
                    <span className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm">Sessions</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-surface-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href={ROUTES.SECURITY}>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-slate-800/50 hover:bg-surface-100 dark:hover:bg-slate-800 border border-surface-200 dark:border-white/5 rounded-xl text-surface-700 dark:text-white transition-all group">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm">Security</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-surface-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href={ROUTES.SECURITY}>
                  {(activityStats?.securityScore?.breakdown?.twoFactorEnabled?.earned || user?.twoFactorEnabled) ? (
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl text-white transition-all group">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">2FA Active</span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white transition-all group">
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Enable 2FA</span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <ActivityTimeline
            activities={recentActivity}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
