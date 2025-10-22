import { AxiosError } from 'axios';
import { SWRConfiguration } from 'swr';
import { get } from './axios';

/**
 * Default fetcher function for SWR using axios
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  return get<T>(url);
};

/**
 * Default SWR configuration
 */
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 1,
  errorRetryInterval: 5000,
  dedupingInterval: 2000,
  onError: (error: AxiosError) => {
    // Global error handling
    console.error('SWR Error:', error);

    // You can add custom error handling here
    // For example, show a toast notification
    if (error.response?.status === 403) {
      console.error('Access forbidden');
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('Server error');
    }
  },
};

/**
 * Helper function to create SWR key with parameters
 */
export const createKey = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;

  const queryString = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string>
    )
  ).toString();

  return queryString ? `${endpoint}?${queryString}` : endpoint;
};
