/**
 * Vendor Groups API Service
 *
 * API calls related to vendor groups and vendor assignments
 */

import { del, get, post, put } from '../../../lib/axios';

// ============================================================================
// Vendor Groups API
// ============================================================================

export interface VendorGroup {
  id: number;
  company_id: number;
  name_en: string;
  name_ar: string;
  status: number;
  vendors?: any[];
  vendors_count?: number;
  created_at?: string;
  updated_at?: string;
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

export interface VendorGroupFilters {
  search?: string;
  status?: number;
  page?: number;
  per_page?: number;
}

export const vendorGroupsApi = {
  /**
   * Get all vendor groups with filters
   * GET /api/v1/vendor-groups
   */
  getAll: (filters?: VendorGroupFilters): Promise<PaginatedResponse<VendorGroup>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/vendor-groups?${params.toString()}`);
  },

  /**
   * Get vendor group by ID
   * GET /api/v1/vendor-groups/:id
   */
  getById: (id: number): Promise<ApiResponse<VendorGroup>> => {
    return get(`/vendor-groups/${id}`);
  },

  /**
   * Create new vendor group
   * POST /api/v1/vendor-groups
   */
  create: (groupData: { name_en: string; name_ar: string; status: number }): Promise<ApiResponse<VendorGroup>> => {
    const formData = new FormData();
    formData.append('name_en', groupData.name_en);
    formData.append('name_ar', groupData.name_ar);
    formData.append('status', String(groupData.status));
    return post(`/vendor-groups`, formData);
  },

  /**
   * Update vendor group
   * POST /api/v1/vendor-groups/:id?_method=PUT
   */
  update: (
    id: number,
    groupData: { name_en: string; name_ar: string; status: number }
  ): Promise<ApiResponse<VendorGroup>> => {
    // Backend uses POST with _method=PUT for updates
    const formData = new FormData();
    formData.append('name_en', groupData.name_en);
    formData.append('name_ar', groupData.name_ar);
    formData.append('status', String(groupData.status));
    formData.append('_method', 'PUT');
    return post(`/vendor-groups/${id}`, formData);
  },

  /**
   * Delete vendor group
   * DELETE /api/v1/vendor-groups/:id
   */
  delete: (id: number): Promise<ApiResponse<null>> => {
    return del(`/vendor-groups/${id}`);
  },

  /**
   * Assign vendors to group
   * PUT /api/v1/vendor-groups/:id/assign-vendor
   */
  assignVendors: (groupId: number, vendorIds: number[]): Promise<ApiResponse<VendorGroup>> => {
    return put(
      `/vendor-groups/${groupId}/assign-vendor`,
      { vendor_ids: vendorIds },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};

// ============================================================================
// Vendors API (for dropdown and assignment)
// ============================================================================

export interface Vendor {
  id: number;
  name_en: string;
  name_ar: string;
  email?: string;
  phone?: string;
  vendor_group_id?: number;
  status: number; // 0 = inactive, 1 = active
}

export interface VendorAssignment {
  vendor_id: number;
  vendor_group_id: number;
}

export const vendorsApi = {
  /**
   * Get all vendors (for dropdown)
   * GET /api/v1/vendors/dropdown
   */
  getAll: (): Promise<PaginatedResponse<Vendor>> => {
    return get(`/vendors/dropdown`);
  },
};

// ============================================================================
// Export all Vendor Groups-related APIs
// ============================================================================

export const vendorGroupsApiService = {
  vendorGroups: vendorGroupsApi,
  vendors: vendorsApi,
};

export default vendorGroupsApiService;
