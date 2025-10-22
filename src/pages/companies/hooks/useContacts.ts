/**
 * Contact Persons SWR Hooks
 *
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { contactsApi, type ContactFilters } from '../api/companies.api';
import type { ContactPersonFormData } from '../schemas';

/**
 * Hook to fetch all contacts for a company
 */
export function useContacts(filters?: ContactFilters) {
  const key = ['contacts', filters];

  return useSWR(key, () => contactsApi.getAll(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single contact by ID
 */
export function useContact(id: number | null) {
  return useSWR(id ? ['contact', id] : null, () => contactsApi.getById(id!), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to create a new contact
 */
export function useCreateContact(companyId: number) {
  return useSWRMutation(['contacts', companyId], async (_key, { arg }: { arg: ContactPersonFormData }) => {
    return contactsApi.create(companyId, arg as any);
  });
}

/**
 * Hook to update a contact
 */
export function useUpdateContact() {
  return useSWRMutation('contacts', async (_key, { arg }: { arg: { id: number; data: ContactPersonFormData } }) => {
    return contactsApi.update(arg.id, arg.data);
  });
}

/**
 * Hook to toggle contact status
 */
export function useToggleContactStatus() {
  return useSWRMutation('contacts', async (_key, { arg }: { arg: number }) => {
    return contactsApi.toggleStatus(arg);
  });
}
