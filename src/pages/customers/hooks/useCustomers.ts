/**
 * Customers SWR Hooks
 *
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { CreateCustomerData, customersApi, UpdateCustomerData, type CustomerFilters } from '../api/customers.api';

/**
 * Hook to fetch all customers with filters
 */
export function useCustomers(filters?: CustomerFilters) {
  const key = filters ? ['customers', filters] : 'customers';

  return useSWR(key, () => customersApi.getAll(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single customer by ID
 */
export function useCustomer(id: number | null) {
  return useSWR(id ? ['customer', id] : null, () => customersApi.getById(id!), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to create a new customer
 */
export function useCreateCustomer() {
  return useSWRMutation('customers', async (_key, { arg }: { arg: CreateCustomerData }) => {
    return customersApi.create(arg);
  });
}

/**
 * Hook to update a customer
 */
export function useUpdateCustomer() {
  return useSWRMutation('customers', async (_key, { arg }: { arg: { id: number; data: UpdateCustomerData } }) => {
    return customersApi.update(arg.id, arg.data);
  });
}

/**
 * Hook to toggle customer status
 */
export function useToggleCustomerStatus() {
  return useSWRMutation('customers', async (_key, { arg }: { arg: { id: number; status: number } }) => {
    return customersApi.changeStatus(arg.id, arg.status);
  });
}
