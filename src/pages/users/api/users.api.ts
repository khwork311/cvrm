import { del, get, patch, post, put } from '../../../lib/axios';

// ============================================================================
// Users API - Matching backend API structure
// ============================================================================

export interface Role {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  status: number; // 0 = inactive, 1 = active
  role: Role;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  role_id?: number; // For forms
}

export interface UserFilters {
  search?: string;
  status?: number;
  role_id?: number;
  page?: number;
  per_page?: number;
  last_id?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role_id: number;
}

export interface UpdateUserData {
  name: string;
  email: string;
  role_id: number;
  status: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    current_page: number;
    data: T[];
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const usersApi = {
  /**
   * Get all users with filters
   * GET /api/users
   */
  getAll: (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/users?${params.toString()}`);
  },

  /**
   * Get users dropdown (simplified list)
   * GET /api/users/dropdown
   */
  getDropdown: (filters?: UserFilters): Promise<PaginatedResponse<Pick<User, 'id' | 'name' | 'email' | 'role_id'>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/users/dropdown?${params.toString()}`);
  },

  /**
   * Get user by ID
   * GET /api/users/{id}
   */
  getById: (id: number): Promise<ApiResponse<User>> => {
    return get(`/users/${id}`);
  },

  /**
   * Create new user
   * POST /api/users
   */
  create: (userData: CreateUserData): Promise<ApiResponse<User>> => {
    return post('/users', userData);
  },

  /**
   * Update user
   * PUT /api/users/{id}
   */
  update: (id: number, userData: UpdateUserData): Promise<ApiResponse<User>> => {
    return put(`/users/${id}`, userData);
  },

  /**
   * Delete user
   * DELETE /api/users/{id}
   */
  delete: (id: number): Promise<ApiResponse<null>> => {
    return del(`/users/${id}`);
  },

  /**
   * Change user status
   * PATCH /api/users/{id}/status
   */
  changeStatus: (id: number, status: number): Promise<ApiResponse<User>> => {
    return patch(`/users/${id}/status`, { status });
  },

  /**
   * Reset user password
   * POST /api/users/{id}/reset-password
   */
  resetPassword: (id: number): Promise<ApiResponse<null>> => {
    return post(`/users/${id}/reset-password`);
  },
  /**
   * Toggle plan status
   * PATCH /api/users/{id}/toggle-status
   */
  toggleStatus: ({ id, status }: { id: number; status: number }): Promise<ApiResponse<User>> => {
    return patch(`/users/${id}/status`, { status });
  },
};

export default usersApi;
