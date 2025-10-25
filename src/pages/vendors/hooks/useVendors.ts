/**
 * Vendors SWR Hooks
 *
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { invitationApi, vendorsApi, type VendorFilters } from '../api/vendors.api';

/**
 * Hook to fetch all vendors with filters
 */
export function useVendors(filters?: VendorFilters & { company_id: number }) {
  const key = ['vendors', filters];

  return useSWR(key, () => vendorsApi.getAll(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single vendor by ID
 */
export function useVendor(id: number | null) {
  return useSWR(id ? ['vendor', id] : null, () => vendorsApi.getById(id!), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to create a new vendor
 */
export function useCreateVendor() {
  return useSWRMutation('vendors', async (_key, { arg }: { arg: any }) => {
    return vendorsApi.create(arg);
  });
}

/**
 * Hook to update a vendor
 */
export function useUpdateVendor() {
  return useSWRMutation('vendors', async (_key, { arg }: { arg: { id: number; data: any } }) => {
    return vendorsApi.update(arg.id, arg.data);
  });
}

/**
 * Hook to toggle vendor status
 */
export function useToggleVendorStatus() {
  return useSWRMutation('vendors', async (_key, { arg }: { arg: { id: number; status: number } }) => {
    return vendorsApi.toggleStatus(arg.id, arg.status);
  });
}

/**
 * Hook to send invitation
 */
export function useSendInvitation() {
  return useSWRMutation('vendors', async (_key, { arg }: { arg: { email: string; exp_duration?: number } }) => {
    return vendorsApi.sendInvitation(arg);
  });
}

/**
 * Hook to validate invitation token
 */
export function useValidateInvitationToken(token: string | null) {
  return useSWR(token ? ['validate-invitation-token', token] : null, () => invitationApi.validateToken(token!), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
}

/**
 * Hook to accept invitation
 */
export function useAcceptInvitation() {
  return useSWRMutation(
    'accept-invitation',
    async (
      _key,
      {
        arg,
      }: {
        arg: {
          token: string;
          name_en: string;
          name_ar: string;
          email: string;
          phone_number: string;
          tax_number: string;
          password: string;
          password_confirmation: string;
        };
      }
    ) => {
      return invitationApi.acceptInvitation(arg);
    }
  );
}

/**
 * Hook to fetch vendors dropdown
 */
export function useVendorsDropdown(filters?: VendorFilters) {
  const key = ['vendors-dropdown', filters];

  return useSWR(key, () => vendorsApi.getDropdown(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to delete a vendor
 */
export function useDeleteVendor() {
  return useSWRMutation('vendors', async (_key, { arg }: { arg: number }) => {
    return vendorsApi.delete(arg);
  });
}

/**
 * Hook to export vendors to Excel
 */
export function useExportVendors() {
  return useSWRMutation('vendors-export', async () => {
    return vendorsApi.exportExcel();
  });
}
