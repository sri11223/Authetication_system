'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Spinner } from '@/components/ui/Spinner';
import { useForm } from '@/hooks/useForm';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

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
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm w-full mb-4">
            {successMessage}
          </div>

          <p className="text-sm text-slate-400 mb-6">
            If an account with that email exists, you will receive a password reset link shortly.
          </p>

          <Link href={ROUTES.LOGIN} className="w-full">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset link">
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

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition-all duration-200"
        >
          {form.isSubmitting ? (
            <>
              <Spinner className="w-5 h-5" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Reset Link
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
