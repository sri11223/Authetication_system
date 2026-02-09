import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
const PROTECTED_ROUTES = ['/dashboard', '/sessions', '/security'];
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * Note: Since the backend is on a different domain (Render) and sets HttpOnly cookies,
   * the Next.js Middleware (Vercel) cannot read them.
   * We use a client-side 'auth-status' cookie to signal authentication state.
   */
  const hasAuthCookie = request.cookies.has('auth-status');

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
  matcher: ['/dashboard/:path*', '/sessions/:path*', '/security/:path*', '/login', '/register'],
};
