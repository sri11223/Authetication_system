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
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';

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
        // Error will be handled by useForm hook
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
      <AuthLayout title="Two-Factor Authentication" subtitle="Enter the 6-digit code from your authenticator app">
        <form onSubmit={handle2FASubmit} className="space-y-5">
          {twoFactorError && <Alert variant="error" message={twoFactorError} />}

          <div>
            <label htmlFor="twoFactorToken" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Authentication Code
            </label>
            <Input
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
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
              autoComplete="one-time-code"
            />
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-2 text-center">
              Enter the 6-digit code from your authenticator app or use a backup code
            </p>
          </div>

          <Button type="submit" fullWidth isLoading={isSubmitting2FA} size="lg" className="gap-2">
            {isSubmitting2FA ? (
              <>
                <Spinner className="w-4 h-4" />
                Verifying...
              </>
            ) : (
              <>
                Verify
                <Shield className="w-4 h-4" />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setRequires2FA(false);
              setUserId(null);
              setTwoFactorToken('');
              setTwoFactorError('');
            }}
            className="w-full text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
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
        {form.serverError && <Alert variant="error" message={form.serverError} />}

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={form.values.email}
          onChange={form.handleChange}
          error={form.errors.email}
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.values.password}
            onChange={form.handleChange}
            error={form.errors.password}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={form.isSubmitting} size="lg" className="gap-2">
          Sign In
          <ArrowRight className="w-4 h-4" />
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-surface-400 uppercase tracking-wider">New here?</span>
          </div>
        </div>

        <Link href={ROUTES.REGISTER}>
          <Button variant="outline" fullWidth>
            Create Account
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}
