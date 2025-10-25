/**
 * Roles API Service
 *
 * API calls related to roles management
 */

import { del, get, patch, post, put } from '../../../lib/axios';

// ============================================================================
// Roles API - Matching backend API structure
// ============================================================================

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  pivot?: {
    role_id: number;
    permission_id: number;
  };
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  permissions_count?: number;
  users_count?: number;
  permissions?: Permission[];
  status?: number;
}

export interface RoleFilters {
  search?: string;
  status?: number;
  page?: number;
  per_page?: number;
}

export interface CreateRoleData {
  role_name: string;
}

export interface UpdateRoleData {
  role_name: string;
}

export interface AssignPermissionsRequest {
  permission_ids: number[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface DropdownRole {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    current_page: number;
    data: T;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  message: string;
}

export const rolesApi = {
  /**
   * Get all roles
   * GET /api/roles
   */
  getAll: (filters?: RoleFilters): Promise<PaginatedResponse<Role[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/roles?${params.toString()}`);
  },
  /**
   * Get all dropdown roles
   * GET /api/roles/dropdown
   */
  getAllDropDown: (): Promise<PaginatedResponse<DropdownRole[]>> => {
    return get(`/roles/dropdown`);
  },

  /**
   * Get role by ID
   * GET /api/roles/{id}
   */
  getById: (id: number): Promise<ApiResponse<Role>> => {
    return get(`/roles/${id}`);
  },

  /**
   * Create new role
   * POST /api/roles
   */
  create: (roleData: CreateRoleData): Promise<ApiResponse<Role>> => {
    return post('/roles', roleData);
  },

  /**
   * Update role
   * PUT /api/roles/{id}
   */
  update: (id: number, roleData: UpdateRoleData): Promise<ApiResponse<Role>> => {
    return put(`/roles/${id}`, roleData);
  },

  /**
   * Delete role
   * DELETE /api/roles/{id}
   */
  delete: (id: number): Promise<ApiResponse<null>> => {
    return del(`/roles/${id}`);
  },

  /**
   * Get permissions for a role
   * GET /api/roles/{id}/permissions
   */
  getPermissions: (roleId: number): Promise<ApiResponse<Permission[]>> => {
    return get(`/roles/${roleId}/permissions`);
  },

  /**
   * Assign permissions to role
   * PUT /api/roles/{id}/permissions
   */
  assignPermissions: (roleId: number, permissionData: AssignPermissionsRequest): Promise<ApiResponse<Role>> => {
    return put(`/roles/${roleId}/permissions`, permissionData);
  },

  /**
   * Get all available permissions
   * GET /api/permissions
   */
  getAllPermissions: (): Promise<ApiResponse<Permission[]>> => {
    return get('/permissions');
  },

  /**
   * Toggle role status
   * PATCH /api/roles/{id}/toggle-status
   */
  toggleStatus: ({ id, status }: { id: number; status: number }): Promise<ApiResponse<Role>> => {
    return patch(`/roles/${id}/status`, { status });
  },
};

export default rolesApi;
