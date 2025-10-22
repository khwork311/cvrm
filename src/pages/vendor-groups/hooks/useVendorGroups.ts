/**
 * Vendor Groups SWR Hooks
 * 
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { vendorGroupsApi, type VendorGroupFilters } from '../api/vendor-groups.api';

/**
 * Hook to fetch all vendor groups with filters
 */
export function useVendorGroups(filters?: VendorGroupFilters) {
  const key = ['vendorGroups', filters];
  
  return useSWR(key, () => vendorGroupsApi.getAll(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single vendor group by ID
 */
export function useVendorGroup(id: number | null) {
  return useSWR(
    id ? ['vendorGroup', id] : null,
    () => vendorGroupsApi.getById(id!),
    {
      revalidateOnFocus: false,
    }
  );
}

/**
 * Hook to create a new vendor group
 */
export function useCreateVendorGroup() {
  return useSWRMutation(
    'vendorGroups',
    async (_key, { arg }: { arg: { name_en: string; name_ar: string; status: number } }) => {
      return vendorGroupsApi.create(arg);
    }
  );
}

/**
 * Hook to update a vendor group
 */
export function useUpdateVendorGroup() {
  return useSWRMutation(
    'vendorGroups',
    async (_key, { arg }: { arg: { id: number; data: { name_en: string; name_ar: string; status: number } } }) => {
      return vendorGroupsApi.update(arg.id, arg.data);
    }
  );
}

/**
 * Hook to delete a vendor group
 */
export function useDeleteVendorGroup() {
  return useSWRMutation(
    'vendorGroups',
    async (_key, { arg }: { arg: number }) => {
      return vendorGroupsApi.delete(arg);
    }
  );
}

/**
 * Hook to assign vendors to a group
 */
export function useAssignVendors() {
  return useSWRMutation(
    'vendorGroups',
    async (_key, { arg }: { arg: { groupId: number; vendorIds: number[] } }) => {
      return vendorGroupsApi.assignVendors(arg.groupId, arg.vendorIds);
    }
  );
}
