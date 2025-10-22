/**
 * Vendor Bank Accounts SWR Hooks
 * 
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { vendorBankAccountsApi, type VendorBankAccountFilters, type VendorBankAccountRequest } from '../api/vendors.api';

/**
 * Hook to fetch all bank accounts for a vendor
 */
export function useVendorBankAccounts(vendorId: number | null, filters?: VendorBankAccountFilters) {
  const key = vendorId ? ['vendorBankAccounts', vendorId, filters] : null;
  
  return useSWR(
    key,
    () => vendorBankAccountsApi.getAll(vendorId!, filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );
}

/**
 * Hook to fetch a single bank account by ID
 */
export function useVendorBankAccount(id: number | null) {
  return useSWR(
    id ? ['vendorBankAccount', id] : null,
    () => vendorBankAccountsApi.getById(id!),
    {
      revalidateOnFocus: false,
    }
  );
}

/**
 * Hook to create a new bank account
 */
export function useCreateVendorBankAccount(vendorId: number) {
  return useSWRMutation(
    ['vendorBankAccounts', vendorId],
    async (_key, { arg }: { arg: VendorBankAccountRequest }) => {
      return vendorBankAccountsApi.create(vendorId, arg);
    }
  );
}

/**
 * Hook to update a bank account
 */
export function useUpdateVendorBankAccount(vendorId: number) {
  return useSWRMutation(
    ['vendorBankAccounts', vendorId],
    async (_key, { arg }: { arg: { id: number; data: VendorBankAccountRequest } }) => {
      return vendorBankAccountsApi.update(vendorId, arg.id, arg.data);
    }
  );
}

/**
 * Hook to toggle bank account status
 */
export function useToggleVendorBankAccountStatus(vendorId: number) {
  return useSWRMutation(
    ['vendorBankAccounts', vendorId],
    async (_key, { arg }: { arg: number }) => {
      return vendorBankAccountsApi.toggleStatus(arg);
    }
  );
}
