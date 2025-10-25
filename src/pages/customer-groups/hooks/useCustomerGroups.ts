/**
 * Customer Groups SWR Hooks
 *
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { customerGroupsApi, type CustomerGroup, type CustomerGroupFilters } from '../api/customer-groups.api';

/**
 * Hook to fetch all customer groups with filters
 */
export function useCustomerGroups(filters?: CustomerGroupFilters) {
  const key = filters ? ['customerGroups', filters] : 'customerGroups';

  return useSWR(key, () => customerGroupsApi.getAll(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single customer group by ID
 */
export function useCustomerGroup(id: number | null) {
  return useSWR(id ? ['customerGroup', id] : null, () => customerGroupsApi.getById(id!), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to create a new customer group
 */
export function useCreateCustomerGroup() {
  return useSWRMutation('customerGroups', async (_key, { arg }: { arg: CustomerGroup }) => {
    return customerGroupsApi.create(arg);
  });
}

/**
 * Hook to update a customer group
 */
export function useUpdateCustomerGroup() {
  return useSWRMutation(
    'customerGroups',
    async (_key, { arg }: { arg: { id: number; data: Partial<CustomerGroup> } }) => {
      return customerGroupsApi.update(arg.id, arg.data);
    }
  );
}

/**
 * Hook to toggle customer group status
 */
export function useToggleCustomerGroupStatus() {
  return useSWRMutation('customerGroups', async (_key, { arg }: { arg: { id: number; status: number } }) => {
    return customerGroupsApi.toggleStatus(arg.id, arg.status);
  });
}
