import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { RefreshTokenResponse } from '../types/auth.types';
import { TokenManager } from '../utils/tokenManager';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
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
 * Request Interceptor - Add access token to requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle token refresh on 401 errors
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If the failed request was to the refresh endpoint, logout user
    if (originalRequest.url?.includes('/auth/refresh')) {
      TokenManager.clearTokens();
      window.location.href = '/signin';
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = TokenManager.getRefreshToken();

    if (!refreshToken) {
      TokenManager.clearTokens();
      window.location.href = '/signin';
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh the token
      const response = await axios.post<RefreshTokenResponse>(`${axiosInstance.defaults.baseURL}/auth/refresh-token`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefreshToken, token_type, expires_in } = response.data.data;

      // Update tokens
      TokenManager.setTokens({
        access_token,
        refresh_token: newRefreshToken,
        token_type,
        expires_in,
      });

      // Update the failed request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }

      // Process queued requests
      processQueue(null, access_token);

      // Retry the original request
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear tokens and redirect to login
      processQueue(refreshError as AxiosError, null);
      TokenManager.clearTokens();
      window.location.href = '/signin';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Helper function to make GET requests
 */
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.get<T>(url, config).then((response) => response.data);
};

/**
 * Helper function to make POST requests
 */
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.post<T>(url, data, config).then((response) => response.data);
};

/**
 * Helper function to make PUT requests
 */
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.put<T>(url, data, config).then((response) => response.data);
};

/**
 * Helper function to make PATCH requests
 */
export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.patch<T>(url, data, config).then((response) => response.data);
};

/**
 * Helper function to make DELETE requests
 */
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.delete<T>(url, config).then((response) => response.data);
};

export default axiosInstance;
