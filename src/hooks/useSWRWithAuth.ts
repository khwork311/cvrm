import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { useAuth } from './useAuth';

/**
 * Custom hook that wraps useSWR and only fetches when authenticated
 */
export function useSWRWithAuth<T = any>(
  key: string | null,
  config?: SWRConfiguration,
): SWRResponse<T, any> {
  const { isAuthenticated } = useAuth();

  return useSWR<T>(isAuthenticated ? key : null, config);
}

/**
 * Hook for paginated data fetching with authentication
 */
export function usePaginatedSWR<T = any>(
  endpoint: string,
  page: number = 1,
  limit: number = 10,
  config?: SWRConfiguration,
) {
  const { isAuthenticated } = useAuth();

  const key = isAuthenticated
    ? `${endpoint}?page=${page}&limit=${limit}`
    : null;

  return useSWR<T>(key, config);
}

/**
 * Hook for infinite loading with SWR
 * Note: Install @swr/infinite package for full infinite loading support
 */
export function useInfiniteSWRWithAuth<T = any>(
  getKey: (pageIndex: number, previousPageData: T | null) => string | null,
  config?: SWRConfiguration,
) {
  const { isAuthenticated } = useAuth();

  // Basic implementation - for full infinite loading, use useSWRInfinite from @swr/infinite
  return useSWR<T>(isAuthenticated ? getKey(0, null) : null, config);
}
