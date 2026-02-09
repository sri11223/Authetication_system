'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { Spinner } from '@/components/ui/Spinner';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, User, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

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
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm w-full mb-4">
            {successMessage}
          </div>

          <p className="text-sm text-slate-400 mb-6">
            Please check your email inbox and click the verification link to activate your account.
            The link will expire in 24 hours.
          </p>

          <Link href={ROUTES.LOGIN} className="w-full">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all duration-200">
              Continue to Login
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join us and get started in seconds">
      <form onSubmit={form.handleSubmit} className="space-y-4">
        {form.serverError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {form.serverError}
          </div>
        )}

        {/* Name input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.values.name}
              onChange={form.handleChange}
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border ${form.errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
              autoComplete="name"
            />
          </div>
          {form.errors.name && (
            <p className="text-red-400 text-sm mt-1.5">{form.errors.name}</p>
          )}
        </div>

        {/* Email input */}
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

        {/* Password input */}
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
              placeholder="Create a strong password"
              value={form.values.password}
              onChange={form.handleChange}
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border ${form.errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
              autoComplete="new-password"
            />
          </div>
          {form.errors.password && (
            <p className="text-red-400 text-sm mt-1.5">{form.errors.password}</p>
          )}
          <div className="mt-3">
            <PasswordStrength password={form.values.password} />
          </div>
        </div>

        {/* Confirm Password input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-slate-500" />
            </div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={form.values.confirmPassword}
              onChange={form.handleChange}
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border ${form.errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
              autoComplete="new-password"
            />
          </div>
          {form.errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1.5">{form.errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition-all duration-200 mt-6"
        >
          {form.isSubmitting ? (
            <>
              <Spinner className="w-5 h-5" />
              Creating Account...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Create Account
            </>
          )}
        </button>

        <p className="text-center text-sm text-slate-500 pt-2">
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
