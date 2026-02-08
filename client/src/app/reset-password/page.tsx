'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { useForm } from '@/hooks/useForm';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { PASSWORD_REQUIREMENTS } from '@/constants';
import { Lock, CheckCircle } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.password) errors.password = 'Password is required';
      if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';
      if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      return errors;
    },
    onSubmit: async (values) => {
      if (!token) {
        form.setServerError('Reset token is missing');
        return;
      }
      const response = await authService.resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      setSuccessMessage(response.message);
    },
  });

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="The reset link is invalid or has expired">
        <Alert variant="error" message="Reset token is missing from the URL" />
        <div className="mt-6">
          <Link href={ROUTES.FORGOT_PASSWORD}>
            <Button fullWidth>Request New Reset Link</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (successMessage) {
    return (
      <AuthLayout title="Password Reset!" subtitle="Your password has been updated">
        <div className="flex flex-col items-center py-4">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <Alert variant="success" message={successMessage} className="w-full mb-6" />
          <p className="text-sm text-surface-500 text-center mb-6">
            All your existing sessions have been invalidated for security.
          </p>
          <Link href={ROUTES.LOGIN} className="w-full">
            <Button fullWidth size="lg">Sign In with New Password</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      <form onSubmit={form.handleSubmit} className="space-y-5">
        {form.serverError && <Alert variant="error" message={form.serverError} />}

        <Input
          label="New Password"
          name="password"
          type="password"
          placeholder="Enter new password"
          value={form.values.password}
          onChange={form.handleChange}
          error={form.errors.password}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={form.values.confirmPassword}
          onChange={form.handleChange}
          error={form.errors.confirmPassword}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <div className="bg-surface-50 rounded-lg p-3">
          <p className="text-xs font-medium text-surface-600 mb-2">Password Requirements:</p>
          <ul className="space-y-1">
            {PASSWORD_REQUIREMENTS.map((req, index) => (
              <li key={index} className="text-xs text-surface-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-surface-400 rounded-full" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <Button type="submit" fullWidth isLoading={form.isSubmitting} size="lg">
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Reset Password" subtitle="Loading...">
        <div className="flex flex-col items-center py-8">
          <Spinner size="lg" label="Loading..." />
        </div>
      </AuthLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
