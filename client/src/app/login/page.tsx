'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, ArrowRight, Shield, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWith2FA } = useAuth();
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [isSubmitting2FA, setIsSubmitting2FA] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email.trim()) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    },
    onSubmit: async (values) => {
      console.log('[LoginPage] Form submitted with email:', values.email);
      try {
        const result = await login(values.email, values.password);
        console.log('[LoginPage] Login result:', result);
        if (result && 'requires2FA' in result && result.requires2FA) {
          setRequires2FA(true);
          setUserId(result.userId || null);
        }
      } catch (error) {
        console.error('[LoginPage] Login error caught:', error);
        throw error;
      }
    },
  });

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !twoFactorToken) return;

    setTwoFactorError('');
    setIsSubmitting2FA(true);

    try {
      await loginWith2FA(userId, twoFactorToken);
    } catch (error: any) {
      setTwoFactorError(error.response?.data?.message || 'Invalid 2FA token. Please try again.');
      setTwoFactorToken('');
    } finally {
      setIsSubmitting2FA(false);
    }
  };

  if (requires2FA) {
    return (
      <AuthLayout title="Two-Factor Auth" subtitle="Enter the 6-digit code from your authenticator app">
        <form onSubmit={handle2FASubmit} className="space-y-6">
          {twoFactorError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {twoFactorError}
            </div>
          )}

          <div>
            <label htmlFor="twoFactorToken" className="block text-sm font-medium text-slate-300 mb-3">
              Authentication Code
            </label>
            <input
              id="twoFactorToken"
              type="text"
              placeholder="000000"
              value={twoFactorToken}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setTwoFactorToken(value);
                setTwoFactorError('');
              }}
              maxLength={6}
              className="w-full px-4 py-4 bg-slate-800/50 border border-white/10 rounded-xl text-white text-center text-3xl tracking-[0.5em] font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              autoFocus
              autoComplete="one-time-code"
            />
            <p className="text-xs text-slate-500 mt-3 text-center">
              Enter the 6-digit code from your authenticator app or use a backup code
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting2FA || twoFactorToken.length !== 6}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition-all duration-200"
          >
            {isSubmitting2FA ? (
              <>
                <Spinner className="w-5 h-5" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Verify & Sign In
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setRequires2FA(false);
              setUserId(null);
              setTwoFactorToken('');
              setTwoFactorError('');
            }}
            className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
          >
            ← Back to login
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
      <form onSubmit={form.handleSubmit} className="space-y-5">
        {form.serverError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {form.serverError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-slate-500" />
            </div>
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.values.email}
              onChange={form.handleChange}
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border ${form.errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
              autoComplete="email"
            />
          </div>
          {form.errors.email && (
            <p className="text-red-400 text-sm mt-1.5">{form.errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-slate-500" />
            </div>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.values.password}
              onChange={form.handleChange}
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border ${form.errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
              autoComplete="current-password"
            />
          </div>
          {form.errors.password && (
            <p className="text-red-400 text-sm mt-1.5">{form.errors.password}</p>
          )}
          <div className="flex justify-end mt-2">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition-all duration-200"
        >
          {form.isSubmitting ? (
            <>
              <Spinner className="w-5 h-5" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-slate-900 text-slate-500 uppercase tracking-wider">New here?</span>
          </div>
        </div>

        <Link href={ROUTES.REGISTER}>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all duration-200"
          >
            <KeyRound className="w-4 h-4" />
            Create Account
          </button>
        </Link>
      </form>
    </AuthLayout>
  );
}
