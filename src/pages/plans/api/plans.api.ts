/**
 * Plans API Service
 *
 * API calls related to subscription plans management
 */

import { del, get, patch, post, put } from '../../../lib/axios';

// ============================================================================
// Plans API - Matching backend API structure
// ============================================================================

export interface Plan {
  id: number;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  users_limit: number;
  customers_limit: number;
  vendors_limit: number;
  status: number; // 0 = inactive, 1 = active, 2 = all
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PlanFilters {
  search?: string;
  status?: number;
  page?: number;
  per_page?: number;
  last_id?: number;
}

export interface CreatePlanData {
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  users_limit: number;
  customers_limit: number;
  vendors_limit: number;
  status: number;
}

export interface UpdatePlanData {
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  users_limit: number;
  customers_limit: number;
  vendors_limit: number;
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

export const plansApi = {
  /**
   * Get all plans with filters
   * GET /api/plans
   */
  getAll: (filters?: PlanFilters): Promise<PaginatedResponse<Plan>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/plans?${params.toString()}`);
  },

  /**
   * Get plans dropdown (simplified list)
   * GET /api/plans/dropdown
   */
  getDropdown: (filters?: PlanFilters): Promise<ApiResponse<Pick<Plan, 'id' | 'title_en' | 'title_ar'>[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/plans/dropdown?${params.toString()}`);
  },

  /**
   * Get plan by ID
   * GET /api/plans/{id}
   */
  getById: (id: number): Promise<ApiResponse<Plan>> => {
    return get(`/plans/${id}`);
  },

  /**
   * Create new plan
   * POST /api/plans
   */
  create: (planData: CreatePlanData): Promise<ApiResponse<CreatePlanData>> => {
    return post('/plans', planData);
  },

  /**
   * Update plan
   * PUT /api/plans/{id}
   */
  update: (id: number, planData: UpdatePlanData): Promise<ApiResponse<UpdatePlanData>> => {
    return put(`/plans/${id}`, planData);
  },

  /**
   * Delete plan
   * DELETE /api/plans/{id}
   */
  delete: (id: number): Promise<ApiResponse<null>> => {
    return del(`/plans/${id}`);
  },

  /**
   * Toggle plan status
   * PATCH /api/plans/{id}/toggle-status
   */
  toggleStatus: (id: number, status: number): Promise<ApiResponse<Plan>> => {
    return patch(`/plans/${id}/toggle-status`, { status });
  },
};

export default plansApi;
