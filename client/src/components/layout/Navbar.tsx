'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { Shield, Menu, X, LogOut, Monitor, LayoutDashboard, ChevronDown, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  variant?: 'default' | 'transparent';
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'default' }) => {
  const { user, isAuthenticated, logout, logoutAll } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  const navLinkClass = (route: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(route)
        ? 'bg-primary-50 text-primary-700'
        : `${variant === 'transparent' ? 'text-surface-700' : 'text-surface-600'} hover:text-primary-600 hover:bg-primary-50/50`
    }`;

  return (
    <nav
      className={`sticky top-0 z-40 transition-all duration-300 ${
        variant === 'transparent'
          ? 'bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-700/50'
          : 'bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-200/50 group-hover:shadow-lg group-hover:shadow-primary-300/50 transition-shadow duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-surface-900 to-surface-700 bg-clip-text text-transparent">
              AuthSystem
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link href={ROUTES.DASHBOARD} className={navLinkClass(ROUTES.DASHBOARD)}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href={ROUTES.SESSIONS} className={navLinkClass(ROUTES.SESSIONS)}>
                  <Monitor className="w-4 h-4" />
                  Sessions
                </Link>
                <Link href={ROUTES.SECURITY} className={navLinkClass(ROUTES.SECURITY)}>
                  <Settings className="w-4 h-4" />
                  Security
                </Link>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-2" />

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-100 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block max-w-[120px] truncate">{user?.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-surface-200/50 border border-surface-200 py-2 animate-slide-down z-20">
                        <div className="px-4 py-3 border-b border-surface-100">
                          <p className="text-sm font-semibold text-surface-900">{user?.name}</p>
                          <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href={ROUTES.SESSIONS}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
                          >
                            <Monitor className="w-4 h-4" />
                            Manage Sessions
                          </Link>
                          <Link
                            href={ROUTES.SECURITY}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Security Settings
                          </Link>
                        </div>
                        <div className="border-t border-surface-100 py-1">
                          <button
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                          <button
                            onClick={() => { logoutAll(); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout All Devices
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button size="sm">Sign Up Free</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-surface-600 hover:bg-surface-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-surface-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-surface-900 truncate">{user?.name}</p>
                    <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  href={ROUTES.DASHBOARD}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm ${isActive(ROUTES.DASHBOARD) ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-surface-700 hover:bg-surface-100'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href={ROUTES.SESSIONS}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm ${isActive(ROUTES.SESSIONS) ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-surface-700 hover:bg-surface-100'}`}
                >
                  <Monitor className="w-4 h-4" />
                  Sessions
                </Link>
                <Link
                  href={ROUTES.SECURITY}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm ${isActive(ROUTES.SECURITY) ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-surface-700 hover:bg-surface-100'}`}
                >
                  <Settings className="w-4 h-4" />
                  Security
                </Link>
                <hr className="border-surface-200 my-2" />
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-surface-600 hover:bg-surface-100"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <button
                  onClick={() => { logoutAll(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout All Devices
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link href={ROUTES.LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth>Log In</Button>
                </Link>
                <Link href={ROUTES.REGISTER} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button fullWidth>Sign Up Free</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
