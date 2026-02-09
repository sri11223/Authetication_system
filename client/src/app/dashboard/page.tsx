'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { sessionService } from '@/services/session.service';
import {
  Shield,
  Monitor,
  Mail,
  Calendar,
  CheckCircle,
  ArrowRight,
  Lock,
  Fingerprint,
  Activity,
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

  useEffect(() => {
    const fetchSessionCount = async () => {
      try {
        const response = await sessionService.getActiveSessions();
        if (response.success && response.data) {
          setSessionCount(response.data.total);
        }
      } catch {
        // Silently handle
      }
    };
    fetchSessionCount();
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
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
            </div>
            <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Security</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white mt-0.5">Protected</p>
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Profile Information</h2>
                <p className="text-sm text-surface-500 dark:text-slate-400">Your account details and verification status</p>
              </div>

              <div className="space-y-3">
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
                    <p className="text-xs text-surface-500 dark:text-slate-500 uppercase tracking-wider font-medium">Email Address</p>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user?.email}</p>
                  </div>
                  <Badge variant={user?.isEmailVerified ? 'success' : 'warning'} className="flex-shrink-0">
                    {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
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
                    <p className="text-sm font-mono text-surface-600 dark:text-slate-400 truncate">{user?.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Security Info */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Race-Condition Safe</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Your sessions are protected by MongoDB atomic operations and transactions.
                    Concurrent login attempts from the same device are safely deduplicated using
                    unique compound indexes and atomic upserts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Quick Actions</h3>

              <div className="space-y-2">
                <Link href={ROUTES.SESSIONS}>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-slate-800/50 hover:bg-surface-100 dark:hover:bg-slate-800 border border-surface-200 dark:border-white/5 rounded-xl text-surface-700 dark:text-white transition-all group">
                    <span className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Manage Sessions
                    </span>
                    <ArrowRight className="w-4 h-4 text-surface-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href={ROUTES.SECURITY}>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-slate-800/50 hover:bg-surface-100 dark:hover:bg-slate-800 border border-surface-200 dark:border-white/5 rounded-xl text-surface-700 dark:text-white transition-all group">
                    <span className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Security Settings
                    </span>
                    <ArrowRight className="w-4 h-4 text-surface-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Security Checklist</h3>
              <ul className="space-y-3">
                {[
                  { text: 'Email verified', done: user?.isEmailVerified },
                  { text: 'Strong password set', done: true },
                  { text: 'Review active sessions', done: false },
                  { text: 'Enable 2FA', done: user?.twoFactorEnabled },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-surface-100 dark:bg-slate-800 text-surface-400 dark:text-slate-500'
                      }`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm ${item.done ? 'text-surface-700 dark:text-white' : 'text-surface-500 dark:text-slate-400'}`}>
                      {item.text}
                    </span>
                    {item.done && (
                      <span className="ml-auto text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-0.5 rounded-full">Done</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Activity */}
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Session Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-surface-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-surface-400 dark:text-slate-500" />
                  <span>Access token expires every 15min</span>
                </div>
                <div className="flex items-center gap-2 text-surface-600 dark:text-slate-400">
                  <Lock className="w-4 h-4 text-surface-400 dark:text-slate-500" />
                  <span>Refresh token rotates on use</span>
                </div>
                <div className="flex items-center gap-2 text-surface-600 dark:text-slate-400">
                  <Activity className="w-4 h-4 text-surface-400 dark:text-slate-500" />
                  <span>Sessions auto-expire after 7 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
