/**
 * Roles SWR Hooks
 *
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { rolesApi, type AssignPermissionsRequest, type RoleFilters } from '../api/roles.api';

/**
 * Hook to fetch all roles with filters
 */
export function useRoles(filters?: RoleFilters) {
  const key = filters ? ['roles', filters] : 'roles';

  return useSWR(key, () => rolesApi.getAll(filters), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch all dropdown roles
 */
export function useDropdownRoles() {
  return useSWR('roles-dropdown', rolesApi.getAllDropDown, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single role by ID
 */
export function useRole(id: number | null) {
  return useSWR(id ? ['role', id] : null, () => rolesApi.getById(id!), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to create a new role
 */
export function useCreateRole() {
  return useSWRMutation('roles', async (_key, { arg }: { arg: { role_name: string; permissions: string[] } }) => {
    return rolesApi.create(arg);
  });
}

/**
 * Hook to update a role
 */
export function useUpdateRole() {
  return useSWRMutation(
    'roles',
    async (_key, { arg }: { arg: { id: number; role_name: string; permissions: string[] } }) => {
      return rolesApi.update(arg.id, { role_name: arg.role_name });
    }
  );
}

/**
 * Hook to fetch permissions for a role
 */
export function useRolePermissions(roleId: number | null) {
  return useSWR(roleId ? ['rolePermissions', roleId] : null, () => rolesApi.getPermissions(roleId!), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to assign permissions to a role
 */
export function useAssignPermissions() {
  return useSWRMutation(
    'rolePermissions',
    async (_key, { arg }: { arg: { roleId: number; permissions: AssignPermissionsRequest } }) => {
      return rolesApi.assignPermissions(arg.roleId, arg.permissions);
    }
  );
}

/**
 * Hook to fetch all available permissions
 */
export function useAllPermissions() {
  return useSWR('permissions', () => rolesApi.getAllPermissions(), {
    revalidateOnFocus: false,
  });
}

/**
 * Hook to toggle role status
 */
export function useToggleRoleStatus() {
  return useSWRMutation('roles', async (_, { arg }: { arg: { id: number; status: number } }) => {
    return rolesApi.toggleStatus(arg);
  });
}
