'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useForm } from '@/hooks/useForm';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email.trim()) errors.email = 'Email is required';
      if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Invalid email address';
      return errors;
    },
    onSubmit: async (values) => {
      const response = await authService.forgotPassword(values.email);
      setSuccessMessage(response.message);
    },
  });

  if (successMessage) {
    return (
      <AuthLayout title="Check Your Email" subtitle="We've sent a reset link if the email exists">
        <Alert variant="success" message={successMessage} />
        <p className="mt-4 text-sm text-surface-600 text-center">
          If an account with that email exists, you will receive a password reset link shortly.
        </p>
        <div className="mt-6">
          <Link href={ROUTES.LOGIN}>
            <Button variant="outline" fullWidth className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset link">
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

        <Button type="submit" fullWidth isLoading={form.isSubmitting} size="lg">
          Send Reset Link
        </Button>

        <div className="text-center">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center gap-1 text-sm font-medium text-surface-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
