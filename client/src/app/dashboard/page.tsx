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
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-primary-200/50">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
                {getGreeting()}, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-surface-500 text-sm">
                Here&apos;s an overview of your account security status
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-md hover:border-green-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant={user?.isEmailVerified ? 'success' : 'warning'}>
                {user?.isEmailVerified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Email Status</p>
            <p className="text-lg font-bold text-surface-900 mt-0.5">
              {user?.isEmailVerified ? 'Confirmed' : 'Unverified'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Security</p>
            <p className="text-lg font-bold text-surface-900 mt-0.5">Protected</p>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-md hover:border-purple-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Monitor className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Active Sessions</p>
            <p className="text-lg font-bold text-surface-900 mt-0.5">{sessionCount} {sessionCount === 1 ? 'Device' : 'Devices'}</p>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-md hover:border-amber-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Auth Method</p>
            <p className="text-lg font-bold text-surface-900 mt-0.5">JWT + Cookies</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Profile Information" subtitle="Your account details and verification status" />

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Full Name</p>
                    <p className="text-sm font-semibold text-surface-900 truncate">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Email Address</p>
                    <p className="text-sm font-semibold text-surface-900 truncate">{user?.email}</p>
                  </div>
                  <Badge variant={user?.isEmailVerified ? 'success' : 'warning'} className="flex-shrink-0">
                    {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Member Since</p>
                    <p className="text-sm font-semibold text-surface-900">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Account ID</p>
                    <p className="text-sm font-mono text-surface-600 truncate">{user?.id}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Session Security Info */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Race-Condition Safe</h3>
                  <p className="text-primary-100 text-sm leading-relaxed">
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
            <Card>
              <CardHeader title="Quick Actions" />

              <div className="space-y-2">
                <Link href={ROUTES.SESSIONS}>
                  <Button variant="outline" fullWidth className="justify-between h-12">
                    <span className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-primary-600" />
                      Manage Sessions
                    </span>
                    <ArrowRight className="w-4 h-4 text-surface-400" />
                  </Button>
                </Link>
                <Link href={ROUTES.SECURITY}>
                  <Button variant="outline" fullWidth className="justify-between h-12">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary-600" />
                      Security Settings
                    </span>
                    <ArrowRight className="w-4 h-4 text-surface-400" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Security Tips */}
            <Card>
              <CardHeader title="Security Checklist" />
              <ul className="space-y-3">
                {[
                  { text: 'Email verified', done: user?.isEmailVerified },
                  { text: 'Strong password set', done: true },
                  { text: 'Review active sessions', done: false },
                  { text: 'Revoke unknown devices', done: false },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done
                        ? 'bg-green-100 text-green-600'
                        : 'bg-surface-100 text-surface-400'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm ${item.done ? 'text-surface-700' : 'text-surface-500'}`}>
                      {item.text}
                    </span>
                    {item.done && (
                      <Badge variant="success" className="ml-auto text-[10px]">Done</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader title="Session Info" />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-surface-600">
                  <Clock className="w-4 h-4 text-surface-400" />
                  <span>Access token expires every 15min</span>
                </div>
                <div className="flex items-center gap-2 text-surface-600">
                  <Lock className="w-4 h-4 text-surface-400" />
                  <span>Refresh token rotates on use</span>
                </div>
                <div className="flex items-center gap-2 text-surface-600">
                  <Activity className="w-4 h-4 text-surface-400" />
                  <span>Sessions auto-expire after 7 days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
