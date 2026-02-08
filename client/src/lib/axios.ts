import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_KEY } from '@/constants';
import { clearRefreshTokenCookie } from '@/utils/cookies';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => {
    console.error('[Axios] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Clears auth state (localStorage + cookies) and redirects to login
 */
const clearAuthAndRedirect = async () => {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    
    // Clear refresh token cookie (HTTP-only, needs backend call)
    await clearRefreshTokenCookie();
    
    // Dispatch custom event to notify AuthContext
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    // Force redirect
    window.location.href = '/login';
  }
};

apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Axios] Response ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Axios] Error ${error.response?.status || 'NETWORK'} ${error.config?.url}`, error.response?.data || error.message);
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // If it's a login/register/clear-cookie endpoint, don't try to refresh or clear cookies
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/clear-cookie') ||
        originalRequest.url?.includes('/auth/forgot-password') ||
        originalRequest.url?.includes('/auth/reset-password') ||
        originalRequest.url?.includes('/auth/verify-email')
      ) {
        return Promise.reject(error);
      }

      // If refresh token endpoint fails, session is definitely invalid
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        await clearAuthAndRedirect();
        return Promise.reject(error);
      }

      // Try to refresh token
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          // Queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          const newAccessToken = data.data.accessToken;
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - session is invalid
          processQueue(refreshError as AxiosError, null);
          await clearAuthAndRedirect();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
