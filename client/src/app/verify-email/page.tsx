'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { CheckCircle, XCircle } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const verifyEmail = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing');
      return;
    }

    try {
      const response = await authService.verifyEmail(token);
      setStatus('success');
      setMessage(response.message);
    } catch (error: unknown) {
      setStatus('error');
      const axiosError = error as { response?: { data?: { message?: string } } };
      setMessage(axiosError?.response?.data?.message || 'Verification failed. The link may have expired.');
    }
  }, [token]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  if (status === 'loading') {
    return (
      <AuthLayout title="Verifying Email" subtitle="Please wait while we verify your email">
        <div className="flex flex-col items-center py-8">
          <Spinner size="lg" label="Verifying your email..." />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={status === 'success' ? 'Email Verified!' : 'Verification Failed'}
      subtitle={status === 'success' ? 'Your account is now active' : 'Something went wrong'}
    >
      <div className="flex flex-col items-center text-center py-4">
        {status === 'success' ? (
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
        )}

        <Alert variant={status === 'success' ? 'success' : 'error'} message={message} className="w-full mb-6" />

        <Link href={ROUTES.LOGIN} className="w-full">
          <Button fullWidth size="lg">
            {status === 'success' ? 'Go to Login' : 'Back to Login'}
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Verifying Email" subtitle="Please wait...">
        <div className="flex flex-col items-center py-8">
          <Spinner size="lg" label="Loading..." />
        </div>
      </AuthLayout>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
