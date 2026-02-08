'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50/30 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href={ROUTES.HOME} className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200/50 group-hover:shadow-xl group-hover:shadow-primary-300/50 transition-shadow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-surface-900 to-surface-700 bg-clip-text text-transparent">
                AuthSystem
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">{title}</h1>
            <p className="mt-2 text-surface-500">{subtitle}</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/30 border border-surface-200/80 p-6 sm:p-8">
            {children}
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-surface-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured with JWT &amp; bcrypt encryption</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-sm text-surface-400">
          &copy; {new Date().getFullYear()} AuthSystem &middot; Secure Authentication
        </p>
      </div>
    </div>
  );
};
