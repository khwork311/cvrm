import useSWR, { SWRConfiguration } from 'swr';
import { User } from '../types/auth.types';
import { useAuth } from './useAuth';

/**
 * Hook to fetch and cache user data with SWR
 */
export const useUser = (config?: SWRConfiguration) => {
  const { isAuthenticated } = useAuth();

  const { data, error, isLoading, mutate, isValidating } = useSWR<User>(
    isAuthenticated ? '/auth/me' : null,
    config,
  );

  return {
    user: data,
    isLoading,
    isValidating,
    isError: !!error,
    error,
    mutate,
    refetch: mutate,
  };
};
