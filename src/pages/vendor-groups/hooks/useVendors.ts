/**
 * Vendor Groups - Vendor-related SWR Hooks
 * 
 * Custom hooks for vendor-group-specific operations
 */

import useSWR from 'swr';
import { vendorsApi } from '../api/vendor-groups.api';

/**
 * Hook to fetch all vendors (for dropdown)
 */
export function useVendors() {
  return useSWR(
    'vendors-dropdown',
    () => vendorsApi.getAll(),
    {
      revalidateOnFocus: false,
    }
  );
}

