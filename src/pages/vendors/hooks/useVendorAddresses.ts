/**
 * Vendor Addresses SWR Hooks
 * 
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { vendorAddressesApi, type VendorAddressFilters, type VendorAddressRequest } from '../api/vendors.api';

/**
 * Hook to fetch all addresses for a vendor
 */
export function useVendorAddresses(vendorId: number | null, filters?: VendorAddressFilters) {
  const key = vendorId ? ['vendorAddresses', vendorId, filters] : null;
  
  return useSWR(
    key,
    () => vendorAddressesApi.getAll(vendorId!, filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );
}

/**
 * Hook to fetch a single address by ID
 */
export function useVendorAddress(id: number | null) {
  return useSWR(
    id ? ['vendorAddress', id] : null,
    () => vendorAddressesApi.getById(id!),
    {
      revalidateOnFocus: false,
    }
  );
}

/**
 * Hook to create a new address
 */
export function useCreateVendorAddress(vendorId: number) {
  return useSWRMutation(
    ['vendorAddresses', vendorId],
    async (_key, { arg }: { arg: VendorAddressRequest }) => {
      return vendorAddressesApi.create(vendorId, arg);
    }
  );
}

/**
 * Hook to update an address
 */
export function useUpdateVendorAddress(vendorId: number) {
  return useSWRMutation(
    ['vendorAddresses', vendorId],
    async (_key, { arg }: { arg: { id: number; data: VendorAddressRequest } }) => {
      return vendorAddressesApi.update(vendorId, arg.id, arg.data);
    }
  );
}

/**
 * Hook to toggle address status
 */
export function useToggleVendorAddressStatus(vendorId: number) {
  return useSWRMutation(
    ['vendorAddresses', vendorId],
    async (_key, { arg }: { arg: number }) => {
      return vendorAddressesApi.toggleStatus(arg);
    }
  );
}
