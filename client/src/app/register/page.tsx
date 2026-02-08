'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, User, CheckCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.name.trim()) errors.name = 'Name is required';
      if (values.name.length > 0 && values.name.length < 2) errors.name = 'Name must be at least 2 characters';
      if (!values.email.trim()) errors.email = 'Email is required';
      if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Invalid email address';
      if (!values.password) errors.password = 'Password is required';
      if (values.password && values.password.length < 8) errors.password = 'Password must be at least 8 characters';
      if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
      return errors;
    },
    onSubmit: async (values) => {
      const message = await register(values.name, values.email, values.password, values.confirmPassword);
      setSuccessMessage(message);
    },
  });

  if (successMessage) {
    return (
      <AuthLayout title="Check Your Email" subtitle="We've sent you a verification link">
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <Alert variant="success" message={successMessage} className="w-full" />
          <p className="mt-4 text-sm text-surface-600">
            Please check your email inbox and click the verification link to activate your account.
            The link will expire in 24 hours.
          </p>
          <Link href={ROUTES.LOGIN} className="mt-6 w-full">
            <Button fullWidth variant="outline" className="gap-2">
              Continue to Login
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join us and get started in seconds">
      <form onSubmit={form.handleSubmit} className="space-y-4">
        {form.serverError && <Alert variant="error" message={form.serverError} />}

        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={form.values.name}
          onChange={form.handleChange}
          error={form.errors.name}
          icon={<User className="w-4 h-4" />}
          autoComplete="name"
        />

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
            placeholder="Create a strong password"
            value={form.values.password}
            onChange={form.handleChange}
            error={form.errors.password}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
          />
          <div className="mt-3">
            <PasswordStrength password={form.values.password} />
          </div>
        </div>

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={form.values.confirmPassword}
          onChange={form.handleChange}
          error={form.errors.confirmPassword}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth isLoading={form.isSubmitting} size="lg">
          Create Account
        </Button>

        <p className="text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
