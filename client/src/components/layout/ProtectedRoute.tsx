'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { PageSpinner } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and not authenticated, redirect immediately
    if (!isLoading && !isAuthenticated) {
      const currentPath = pathname || '';
      // Only redirect if we're on a protected route
      if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/sessions')) {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Re-check auth when component mounts or pathname changes
  useEffect(() => {
    if (pathname && (pathname.startsWith('/dashboard') || pathname.startsWith('/sessions'))) {
      refreshUser();
    }
  }, [pathname, refreshUser]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return <PageSpinner />;
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
