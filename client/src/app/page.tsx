'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import {
  Shield,
  Lock,
  Monitor,
  Key,
  ArrowRight,
  CheckCircle,
  Zap,
  Database,
  Globe,
  Fingerprint,
  RefreshCw,
  Users,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Secure Authentication',
    description: 'JWT access + refresh tokens with HTTP-only cookies and automatic token rotation.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: 'Session Management',
    description: 'Track and manage all active login sessions across multiple devices in real-time.',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: <Key className="w-6 h-6" />,
    title: 'Password Security',
    description: 'Bcrypt hashing with 12 salt rounds, secure reset flows, and session invalidation.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Race Condition Safety',
    description: 'MongoDB atomic operations and transactions prevent duplicate sessions under concurrency.',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: <Fingerprint className="w-6 h-6" />,
    title: 'Device Fingerprinting',
    description: 'Unique device identification via User-Agent and IP for session deduplication.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Token Rotation',
    description: 'Automatic refresh token rotation with silent re-authentication on token expiry.',
    gradient: 'from-amber-500 to-orange-600',
  },
];

const SECURITY_CHECKLIST = [
  'Email verification with expiring tokens',
  'Rate limiting on auth endpoints',
  'CORS and Helmet security headers',
  'Refresh token rotation on every use',
  'Password complexity enforcement',
  'Single-use reset tokens',
  'HTTP-only secure cookies',
  'Generic error messages (no enumeration)',
];

const TECH_STACK = [
  { name: 'Next.js 14', category: 'Frontend', icon: <Globe className="w-5 h-5" /> },
  { name: 'React 18', category: 'UI Library', icon: <Zap className="w-5 h-5" /> },
  { name: 'TypeScript', category: 'Language', icon: <Shield className="w-5 h-5" /> },
  { name: 'Tailwind CSS', category: 'Styling', icon: <Monitor className="w-5 h-5" /> },
  { name: 'Express.js', category: 'Backend', icon: <Database className="w-5 h-5" /> },
  { name: 'MongoDB', category: 'Database', icon: <Database className="w-5 h-5" /> },
  { name: 'JWT', category: 'Auth', icon: <Lock className="w-5 h-5" /> },
  { name: 'Nodemailer', category: 'Email', icon: <Users className="w-5 h-5" /> },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="transparent" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/80 to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-200/30 to-purple-200/20 rounded-full blur-3xl -mt-96" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100/80 text-primary-700 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm border border-primary-200/50">
              <Shield className="w-4 h-4" />
              Production-Grade Security
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="text-surface-900">Secure Auth</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600">
                System
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto leading-relaxed">
              A production-grade authentication system with JWT tokens, multi-device session management,
              email verification, and race-condition-safe concurrent logins.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href={ROUTES.DASHBOARD}>
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary-300/30 hover:shadow-xl hover:shadow-primary-300/40 transition-shadow">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href={ROUTES.REGISTER}>
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary-300/30 hover:shadow-xl hover:shadow-primary-300/40 transition-shadow">
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href={ROUTES.LOGIN}>
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {[
                { value: '10+', label: 'API Endpoints' },
                { value: '4-Layer', label: 'Race Protection' },
                { value: 'JWT', label: 'Token Auth' },
                { value: '12', label: 'Salt Rounds' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                  <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-surface-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900">Everything You Need</h2>
            <p className="mt-3 text-lg text-surface-500 max-w-2xl mx-auto">
              Built with real-world security patterns and production best practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white rounded-2xl border border-surface-200 hover:border-transparent hover:shadow-xl hover:shadow-surface-200/50 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-surface-200/50`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-surface-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-2">Security</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Security-First Architecture</h2>
              <p className="text-surface-400 text-lg leading-relaxed mb-10">
                Every layer is built with security best practices — from password hashing to session
                management and token handling. No shortcuts, no vulnerabilities.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {SECURITY_CHECKLIST.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-surface-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-800/80 rounded-2xl p-6 sm:p-8 border border-surface-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-surface-500 font-mono">session.service.js</span>
              </div>
              <div className="space-y-3 font-mono text-sm leading-relaxed">
                <div className="text-surface-500">{'// Race-condition-safe session creation'}</div>
                <div>
                  <span className="text-purple-400">const </span>
                  <span className="text-blue-300">session</span>
                  <span className="text-surface-300"> = </span>
                  <span className="text-purple-400">await </span>
                  <span className="text-yellow-300">Session</span>
                  <span className="text-surface-300">.</span>
                  <span className="text-green-300">findOneAndUpdate</span>
                  <span className="text-surface-300">(</span>
                </div>
                <div className="pl-4">
                  <span className="text-surface-300">{'{ '}</span>
                  <span className="text-blue-300">userId</span>
                  <span className="text-surface-300">, </span>
                  <span className="text-blue-300">deviceFingerprint</span>
                  <span className="text-surface-300">,</span>
                </div>
                <div className="pl-6">
                  <span className="text-blue-300">isActive</span>
                  <span className="text-surface-300">: </span>
                  <span className="text-green-400">true</span>
                  <span className="text-surface-300">{' },'}</span>
                </div>
                <div className="pl-4">
                  <span className="text-surface-300">{'{ '}</span>
                  <span className="text-orange-400">$set</span>
                  <span className="text-surface-300">: {'{ ... }, '}</span>
                  <span className="text-orange-400">$setOnInsert</span>
                  <span className="text-surface-300">: {'{ ... } },'}</span>
                </div>
                <div className="pl-4">
                  <span className="text-surface-300">{'{ '}</span>
                  <span className="text-blue-300">upsert</span>
                  <span className="text-surface-300">: </span>
                  <span className="text-green-400">true</span>
                  <span className="text-surface-300">, </span>
                  <span className="text-blue-300">new</span>
                  <span className="text-surface-300">: </span>
                  <span className="text-green-400">true</span>
                  <span className="text-surface-300">{' }'}</span>
                </div>
                <div className="text-surface-300">);</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">Tech Stack</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900">Built with Modern Tools</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TECH_STACK.map((tech, index) => (
              <div
                key={index}
                className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-surface-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-10 h-10 bg-surface-100 text-surface-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors duration-300">
                  {tech.icon}
                </div>
                <p className="text-sm font-bold text-surface-900">{tech.name}</p>
                <p className="text-xs text-surface-500 mt-0.5">{tech.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
            Create your account in seconds and explore a production-grade authentication system
            with multi-device session management.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.REGISTER}>
                <Button
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-primary-50 focus:ring-white shadow-xl gap-2"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-surface-50 border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-surface-700">AuthSystem</span>
            </div>
            <p className="text-sm text-surface-400">
              &copy; {new Date().getFullYear()} Secure Authentication System &middot; Built with Next.js, Express &amp; MongoDB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
