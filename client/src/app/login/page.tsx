'use client';

import React from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

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
      await login(values.email, values.password);
    },
  });

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
