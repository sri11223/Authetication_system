'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Lock, Key, Fingerprint } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Floating icons */}
      <div className="absolute top-24 left-[10%] hidden lg:block animate-float">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Shield className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="absolute top-32 right-[15%] hidden lg:block animate-float" style={{ animationDelay: '500ms' }}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Lock className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="absolute bottom-32 left-[15%] hidden lg:block animate-float" style={{ animationDelay: '1000ms' }}>
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Key className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="absolute bottom-24 right-[10%] hidden lg:block animate-float" style={{ animationDelay: '1500ms' }}>
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Fingerprint className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href={ROUTES.HOME} className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:shadow-xl group-hover:shadow-purple-600/40 transition-all duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                AuthSystem
              </span>
            </Link>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-slate-300 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Secure Authentication</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{title}</h1>
            <p className="text-slate-400">{subtitle}</p>
          </div>

          {/* Form Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              {children}
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Protected by JWT &amp; bcrypt encryption</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-6 text-center border-t border-white/5">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} AuthSystem &middot; Enterprise-Grade Security
        </p>
      </div>
    </div>
  );
};
