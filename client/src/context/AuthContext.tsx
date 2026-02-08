'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authService } from '@/services/auth.service';
import { ACCESS_TOKEN_KEY } from '@/constants';
import { ROUTES } from '@/constants/routes';

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

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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
      // Even if API call fails, clear local state
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } catch {
      // Even if API call fails, clear local state
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

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
