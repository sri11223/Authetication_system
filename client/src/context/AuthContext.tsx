'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { authService } from '@/services/auth.service';
import { ACCESS_TOKEN_KEY } from '@/constants';
import { ROUTES } from '@/constants/routes';
import { clearRefreshTokenCookie } from '@/utils/cookies';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<string>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const clearAuth = useCallback(async () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    // Clear refresh token cookie
    await clearRefreshTokenCookie();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        await clearAuth();
        setIsLoading(false);
        return;
      }

      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        await clearAuth();
      }
    } catch (error: any) {
      // If 401, session is invalid
      if (error?.response?.status === 401) {
        await clearAuth();
        // Only redirect if on protected route
        if (pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
          router.push(ROUTES.LOGIN);
        }
      } else {
        await clearAuth();
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth, pathname, router]);

  // Listen for auth logout events (from axios interceptor)
  useEffect(() => {
    const handleLogout = async () => {
      await clearAuth();
      if (pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        router.push(ROUTES.LOGIN);
      }
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [clearAuth, pathname, router]);

  // Check auth on mount and when pathname changes
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Check auth when page becomes visible (user switches tabs/windows)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // Re-verify auth when user comes back to the tab
        refreshUser();
      }
    };

    // Also check on window focus (user switches back to browser)
    const handleFocus = () => {
      if (user && pathname && (pathname.startsWith('/dashboard') || pathname.startsWith('/sessions'))) {
        refreshUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, refreshUser, pathname]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });

    if (response.success && response.data) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
      setUser(response.data.user);
      router.push(ROUTES.DASHBOARD);
    }
  }, [router]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<string> => {
    const response = await authService.register({ name, email, password, confirmPassword });
    return response.message;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if API call fails, clear local state and cookies
    } finally {
      await clearAuth();
      router.push(ROUTES.LOGIN);
    }
  }, [clearAuth, router]);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } catch {
      // Even if API call fails, clear local state and cookies
    } finally {
      await clearAuth();
      router.push(ROUTES.LOGIN);
    }
  }, [clearAuth, router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutAll,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
