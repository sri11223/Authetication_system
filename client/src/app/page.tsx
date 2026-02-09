'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ChevronRight,
  Play,
  Star,
  Activity,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Secure Authentication',
    description: 'JWT access + refresh tokens with HTTP-only cookies and automatic token rotation.',
    gradient: 'from-blue-500 to-indigo-600',
    delay: '0ms',
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: 'Session Management',
    description: 'Track and manage all active login sessions across multiple devices in real-time.',
    gradient: 'from-purple-500 to-pink-600',
    delay: '100ms',
  },
  {
    icon: <Key className="w-6 h-6" />,
    title: 'Password Security',
    description: 'Bcrypt hashing with 12 salt rounds, secure reset flows, and session invalidation.',
    gradient: 'from-orange-500 to-red-600',
    delay: '200ms',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Race Condition Safety',
    description: 'MongoDB atomic operations and transactions prevent duplicate sessions under concurrency.',
    gradient: 'from-green-500 to-emerald-600',
    delay: '300ms',
  },
  {
    icon: <Fingerprint className="w-6 h-6" />,
    title: 'Two-Factor Authentication',
    description: 'TOTP-based 2FA with authenticator apps and secure backup codes for account recovery.',
    gradient: 'from-cyan-500 to-blue-600',
    delay: '400ms',
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Token Rotation',
    description: 'Automatic refresh token rotation with silent re-authentication on token expiry.',
    gradient: 'from-amber-500 to-orange-600',
    delay: '500ms',
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
  { name: 'Tailwind CSS', category: 'Styling', icon: <Sparkles className="w-5 h-5" /> },
  { name: 'Express.js', category: 'Backend', icon: <Activity className="w-5 h-5" /> },
  { name: 'MongoDB', category: 'Database', icon: <Database className="w-5 h-5" /> },
  { name: 'JWT', category: 'Auth', icon: <Lock className="w-5 h-5" /> },
  { name: 'Nodemailer', category: 'Email', icon: <Users className="w-5 h-5" /> },
];

// Floating animation component
function FloatingElement({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={`animate-float ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}{suffix}</span>;
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <Navbar variant="transparent" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0">
          {/* Gradient orbs */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px]" />

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          {/* Subtle radial gradient */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950" />
        </div>

        {/* Floating elements */}
        <FloatingElement className="absolute top-32 left-[15%] hidden lg:block" delay={0}>
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 backdrop-blur-sm">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </FloatingElement>

        <FloatingElement className="absolute top-48 right-[20%] hidden lg:block" delay={500}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
        </FloatingElement>

        <FloatingElement className="absolute bottom-48 left-[20%] hidden lg:block" delay={1000}>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Key className="w-5 h-5 text-white" />
          </div>
        </FloatingElement>

        <FloatingElement className="absolute bottom-32 right-[15%] hidden lg:block" delay={1500}>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
        </FloatingElement>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm font-medium mb-8 hover:bg-white/10 transition-colors cursor-default group">
              <div className="relative">
                <Sparkles className="w-4 h-4 text-amber-400 group-hover:animate-spin-slow" />
                <div className="absolute inset-0 blur-sm bg-amber-400/50 rounded-full animate-pulse" />
              </div>
              <span className="text-slate-300">Production-Grade Security</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              <span className="text-white">Secure Your App</span>
              <br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient-x">
                  With Confidence
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 4 150 6C200 8 250 4 298 10" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" className="animate-draw" />
                  <defs>
                    <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade authentication with JWT tokens, multi-device sessions,
              two-factor auth, and bulletproof security — all in one beautiful package.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href={ROUTES.DASHBOARD}>
                  <Button size="lg" className="group gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-2xl shadow-purple-600/25 border-0 text-white px-8">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href={ROUTES.REGISTER}>
                    <Button size="lg" className="group gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-2xl shadow-purple-600/25 border-0 text-white px-8">
                      Start Building Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href={ROUTES.LOGIN}>
                    <Button variant="outline" size="lg" className="gap-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8">
                      <Play className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { value: 10, suffix: '+', label: 'API Endpoints' },
                { value: 4, suffix: '-Layer', label: 'Security' },
                { value: 2, suffix: 'FA', label: 'Authentication' },
                { value: 12, suffix: '', label: 'Salt Rounds' },
              ].map((stat, index) => (
                <div key={index} className="text-center group cursor-default">
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-slate-500 mt-2 group-hover:text-slate-400 transition-colors">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm font-medium text-purple-400 mb-6">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Built with real-world security patterns and production best practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 cursor-pointer overflow-hidden`}
                style={{ animationDelay: feature.delay }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Icon */}
                <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                  {feature.icon}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-500">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-500">
                  {feature.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-6 flex items-center gap-2 text-slate-500 group-hover:text-purple-400 transition-colors duration-500">
                  <span className="text-sm font-medium">Learn more</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-medium text-emerald-400 mb-6">
                <Shield className="w-4 h-4" />
                Security First
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Built for Security,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Designed for Scale
                </span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-10">
                Every layer is built with security best practices — from password hashing to session
                management and token handling. No shortcuts, no vulnerabilities.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {SECURITY_CHECKLIST.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 group cursor-default">
                    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-500/30 transition-colors">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code preview */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  <span className="ml-3 text-xs text-slate-500 font-mono">twoFactor.service.js</span>
                </div>
                <div className="space-y-3 font-mono text-sm leading-relaxed overflow-x-auto">
                  <div className="text-slate-500">{'// TOTP-based 2FA verification'}</div>
                  <div>
                    <span className="text-purple-400">const </span>
                    <span className="text-blue-300">isValid</span>
                    <span className="text-slate-300"> = </span>
                    <span className="text-yellow-300">speakeasy</span>
                    <span className="text-slate-300">.</span>
                    <span className="text-green-300">totp</span>
                    <span className="text-slate-300">.</span>
                    <span className="text-green-300">verify</span>
                    <span className="text-slate-300">{'({'}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-300">secret</span>
                    <span className="text-slate-300">, </span>
                    <span className="text-blue-300">token</span>
                    <span className="text-slate-300">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-300">encoding</span>
                    <span className="text-slate-300">: </span>
                    <span className="text-amber-300">'base32'</span>
                    <span className="text-slate-300">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-300">window</span>
                    <span className="text-slate-300">: </span>
                    <span className="text-emerald-400">4</span>
                    <span className="text-slate-500"> // Time tolerance</span>
                  </div>
                  <div className="text-slate-300">{'});'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-slate-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400 mb-6">
              <Database className="w-4 h-4" />
              Tech Stack
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Built with Modern Tools
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TECH_STACK.map((tech, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 text-center cursor-default overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 mx-auto bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all duration-300">
                    {tech.icon}
                  </div>
                  <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{tech.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{tech.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/90 mb-8">
            <Star className="w-4 h-4" />
            Get Started Today
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Build
            <br />
            Something Secure?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Create your account in seconds and explore production-grade authentication
            with all the features you need.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.REGISTER}>
                <Button
                  size="lg"
                  className="group bg-white text-purple-700 hover:bg-white/90 shadow-2xl shadow-black/20 border-0 px-10 gap-2"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">AuthSystem</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Secure Authentication System &middot; Built with Next.js, Express & MongoDB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
