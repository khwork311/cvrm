/**
 * Companies SWR Hooks
 * 
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { companiesApi, type Company, type CompanyFilters } from '../api/companies.api';

/**
 * Hook to fetch all companies with filters
 */
export function useCompanies(filters?: CompanyFilters) {
  const key = filters ? ['companies', filters] : 'companies';
  
  return useSWR(key, () => companiesApi.getAll(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single company by ID
 */
export function useCompany(id: number | null) {
  return useSWR(
    id ? ['company', id] : null,
    () => companiesApi.getById(id!),
    {
      revalidateOnFocus: false,
    }
  );
}

/**
 * Hook to create a new company
 */
export function useCreateCompany() {
  return useSWRMutation(
    'companies',
    async (_key, { arg }: { arg: FormData }) => {
      return companiesApi.create(arg);
    }
  );
}

/**
 * Hook to update a company
 */
export function useUpdateCompany() {
  return useSWRMutation(
    'companies',
    async (_key, { arg }: { arg: { id: number; data: FormData | Partial<Company> } }) => {
      return companiesApi.update(arg.id, arg.data);
    }
  );
}

/**
 * Hook to toggle company status
 */
export function useToggleCompanyStatus() {
  return useSWRMutation(
    'companies',
    async (_key, { arg }: { arg: number }) => {
      return companiesApi.toggleStatus(arg);
    }
  );
}

/**
 * Hook to activate company
 */
export function useActivateCompany() {
  return useSWRMutation(
    'companies',
    async (_key, { arg }: { arg: number }) => {
      return companiesApi.activate(arg);
    }
  );
}
