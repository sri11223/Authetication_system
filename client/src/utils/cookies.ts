/**
 * Cookie utility functions
 * Note: HTTP-only cookies cannot be deleted from JavaScript
 * We need to call the backend to clear them
 */

/**
 * Clears the refresh token cookie by calling the backend
 * This works even if the session is invalid (public endpoint)
 */
let isClearingCookie = false;

export const clearRefreshTokenCookie = async (): Promise<void> => {
  // Prevent multiple simultaneous calls
  if (isClearingCookie) {
    return;
  }

  isClearingCookie = true;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    // First try the public clear-cookie endpoint (no auth required)
    await fetch(`${apiUrl}/api/auth/clear-cookie`, {
      method: 'POST',
      credentials: 'include', // Important: sends cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // If that fails, try the logout endpoint (might require auth)
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (logoutError) {
      // Even if both fail, we continue
      // The cookie might still be cleared by the browser on redirect
      console.warn('Failed to clear refresh token cookie:', error);
    }
  } finally {
    isClearingCookie = false;
  }
};

/**
 * Clears all cookies by setting them to expire
 * This only works for non-HTTP-only cookies
 */
export const clearAllCookies = (): void => {
  if (typeof document !== 'undefined') {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Clear each cookie by setting it to expire
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Set cookie to expire in the past
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
  }
};
