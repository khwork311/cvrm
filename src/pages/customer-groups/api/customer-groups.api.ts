/**
 * Customer Groups API Service
 *
 * API calls related to customer groups and customer assignments
 */

import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { get, patch, post, put } from '../../../lib/axios';

// ============================================================================
// Customer Groups API
// ============================================================================

export interface CustomerGroup {
  id: number;
  company_id?: number;
  name_en: string;
  name_ar: string;
  company?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  customers?: Array<{
    id: number;
    name_en: string;
    name_ar: string;
  }>;
  customers_count?: number;
  created_at: string;
  updated_at: string;
  status: number; // 0 = inactive, 1 = active
}

export interface CustomerGroupFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const customerGroupsApi = {
  /**
   * Get all customer groups with filters
   */
  getAll: (filters?: CustomerGroupFilters): Promise<PaginatedResponse<CustomerGroup>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/customer-groups?${params.toString()}`);
  },

  /**
   * Get customer group by ID
   */
  getById: (id: number): Promise<ApiResponse<CustomerGroup>> => {
    return get(`/customer-groups/${id}`);
  },

  /**
   * Create new customer group
   */
  create: (groupData: Omit<CustomerGroup, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<CustomerGroup>> => {
    return post('/customer-groups', groupData);
  },

  /**
   * Update customer group
   */
  update: (id: number, groupData: Partial<CustomerGroup>): Promise<ApiResponse<CustomerGroup>> => {
    return put(`/customer-groups/${id}`, groupData);
  },

  /**
   * Attach customers to group
   */
  attachCustomers: (groupId: number, customerIds: number[]): Promise<ApiResponse<CustomerGroup>> => {
    return post(`/customer-groups/${groupId}/attach-customers`, { customer_ids: customerIds });
  },

  /**
   * Detach customers from group
   */
  detachCustomers: (groupId: number, customerIds: number[]): Promise<ApiResponse<CustomerGroup>> => {
    return post(`/customer-groups/${groupId}/detach-customers`, { customer_ids: customerIds });
  },

  /**
   * Toggle customer group status
   */
  toggleStatus: (id: number, status: number): Promise<ApiResponse<CustomerGroup>> => {
    return patch(`/customer-groups/${id}/status`, { status });
  },
};

// ============================================================================
// Export all Customer Groups-related APIs
// ============================================================================

export default customerGroupsApi;
