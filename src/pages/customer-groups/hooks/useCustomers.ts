/**
 * Customer Groups - Customer-related SWR Hooks
 *
 * Custom hooks for customer-group-specific operations
 * Note: For general customer operations, use hooks from @/pages/customers/hooks
 */

import useSWRMutation from 'swr/mutation';
import { customerGroupsApi } from '../api/customer-groups.api';

// Re-export useCustomers from the customers module to avoid duplication
export { useCustomers } from '@/pages/customers/hooks/useCustomers';

/**
 * Hook to attach customers to a group
 */
export function useAttachCustomers() {
  return useSWRMutation(
    'customerGroups',
    async (_key, { arg }: { arg: { groupId: number; customerIds: number[] } }) => {
      return customerGroupsApi.attachCustomers(arg.groupId, arg.customerIds);
    }
  );
}

/**
 * Hook to detach customers from a group
 */
export function useDetachCustomers() {
  return useSWRMutation(
    'customerGroups',
    async (_key, { arg }: { arg: { groupId: number; customerIds: number[] } }) => {
      return customerGroupsApi.detachCustomers(arg.groupId, arg.customerIds);
    }
  );
}
