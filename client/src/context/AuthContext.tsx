'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { authService } from '@/services/auth.service';
import { ACCESS_TOKEN_KEY } from '@/constants';
import { ROUTES } from '@/constants/routes';
import { clearRefreshTokenCookie, setAuthCookie, removeAuthCookie } from '@/utils/cookies';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean; userId?: string } | void>;
  loginWith2FA: (userId: string, token: string) => Promise<void>;
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
    removeAuthCookie(); // Clear middleware cookie
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        // Don't clear cookies if we're on a public page (login/register)
        // Just clear local state
        if (pathname && (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/')) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        // Only clear cookies if we're on a protected route
        await clearAuth();
        setIsLoading(false);
        return;
      }

      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        // Only clear cookies if we're not on a public page
        if (pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
          await clearAuth();
        } else {
          setUser(null);
        }
      }
    } catch (error: any) {
      // If 401, session is invalid
      if (error?.response?.status === 401) {
        // Only clear cookies and redirect if on protected route
        if (pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
          await clearAuth();
          router.push(ROUTES.LOGIN);
        } else {
          // Just clear local state on public pages
          setUser(null);
        }
      } else {
        // Only clear cookies if not on public page
        if (pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
          await clearAuth();
        } else {
          setUser(null);
        }
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
  // But skip if we're on a public page (login/register) to avoid unnecessary API calls
  useEffect(() => {
    // Only check auth if we're not on a public page
    if (pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
      refreshUser();
    } else {
      // On public pages, just check if we have a token and set loading to false
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [pathname]); // Use pathname instead of refreshUser to prevent infinite loops

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
    try {
      const response = await authService.login({ email, password });

      // Check if 2FA is required (response.requires2FA is a top-level property)
      if (response.requires2FA && response.data?.userId) {
        return { requires2FA: true, userId: response.data.userId };
      }

      // Normal login success
      if (response.success && response.data) {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
        setAuthCookie(); // Set middleware cookie
        setUser(response.data.user);

        if (response.data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(ROUTES.DASHBOARD);
        }
        return; // Success, no error
      }

      // If we get here, something unexpected happened
      throw new Error(response.message || 'Login failed. Please try again.');
    } catch (error: any) {
      // Extract error message from various possible formats
      let errorMessage = 'Something went wrong. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors[0];
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Re-throw the error so useForm can catch it
      throw new Error(errorMessage);
    }
  }, [router]);

  const loginWith2FA = useCallback(async (userId: string, token: string) => {
    try {
      console.log('[AuthContext] Attempting 2FA login for user:', userId);
      const response = await authService.loginWith2FA({ userId, token });
      console.log('[AuthContext] 2FA login response:', response);

      // Handle both possible response structures (data at root or data inside data)
      const userData = response.data?.user || (response as any).user;
      const accessToken = response.data?.accessToken || (response as any).accessToken;

      if (response.success && accessToken) {
        console.log('[AuthContext] 2FA success, setting token and user');
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        setAuthCookie(); // Set middleware cookie
        setUser(userData);

        // Force a small delay to ensure state updates before redirect
        setTimeout(() => {
          console.log('[AuthContext] Redirecting to dashboard...');
          if (userData.role === 'admin') {
            router.push('/admin');
          } else {
            router.push(ROUTES.DASHBOARD);
          }
        }, 100);
      } else {
        console.error('[AuthContext] 2FA failed or missing token:', response);
        throw new Error(response.message || '2FA verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('[AuthContext] 2FA Error:', error);
      // Re-throw the error so it can be caught by the component
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid 2FA token. Please try again.';
      throw new Error(errorMessage);
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
    loginWith2FA,
    register,
    logout,
    logoutAll,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
