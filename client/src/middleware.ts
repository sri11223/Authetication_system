import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
const PROTECTED_ROUTES = ['/dashboard', '/sessions'];
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * Check for access token in cookies or Authorization header.
   * Note: The actual token lives in localStorage (client-side), so this middleware
   * uses a lightweight "auth-status" cookie that's set client-side after login
   * to hint at auth state for route protection. The real auth check happens
   * on the backend when the API is called.
   */
  const hasAuthCookie = request.cookies.has('refreshToken');

  // Redirect authenticated users away from auth pages (login/register)
  if (AUTH_ROUTES.some((route) => pathname === route) && hasAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sessions/:path*', '/login', '/register'],
};
