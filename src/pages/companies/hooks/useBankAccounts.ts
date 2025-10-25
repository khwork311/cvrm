/**
 * Bank Accounts SWR Hooks
 *
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { bankAccountsApi, type BankAccountFilters } from '../api/companies.api';
import type { BankAccountFormData } from '../schemas';

/**
 * Hook to fetch all bank accounts for a company
 */
export function useBankAccounts(companyId: number | null, filters?: BankAccountFilters) {
  const key = companyId ? ['bankAccounts', companyId, filters] : null;

  return useSWR(key, () => bankAccountsApi.getAll(companyId!, filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}
export function useCountries() {
  return useSWR('countries', () => bankAccountsApi.getAllCountries(), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single bank account by ID
 */
export function useBankAccount(id: number | null) {
  return useSWR(id ? ['bankAccount', id] : null, () => bankAccountsApi.getById(id!), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to create a new bank account
 */
export function useCreateBankAccount(companyId: number) {
  return useSWRMutation(['bankAccounts', companyId], async (_key, { arg }: { arg: BankAccountFormData }) => {
    return bankAccountsApi.create(companyId, arg as any);
  });
}

/**
 * Hook to update a bank account
 */
export function useUpdateBankAccount() {
  return useSWRMutation('bankAccounts', async (_key, { arg }: { arg: { id: number; data: BankAccountFormData } }) => {
    return bankAccountsApi.update(arg.id, arg.data);
  });
}

/**
 * Hook to toggle bank account status
 */
export function useToggleBankAccountStatus() {
  return useSWRMutation('bankAccounts', async (_key, { arg }: { arg: number }) => {
    return bankAccountsApi.toggleStatus(arg);
  });
}
