/**
 * Customers API Service
 *
 * API calls related to customers
 */

import { User } from '@/types/auth.types';
import { del, get, patch, post, put } from '../../../lib/axios';

// ============================================================================
// Customers API - Matching backend API structure
// ============================================================================

export interface Company {
  id: number;
  name_en: string;
  name_ar: string;
}

export interface Customer {
  id: number;
  company_id: number;
  user_id: number;
  name_en: string;
  name_ar: string;
  phone_number: string;
  email?: string; // Email is at root level in API response
  tax_number: string;
  group_id?: string;
  company?: Company;
  user?: User;
  groups?: Array<{
    id: number;
    name_en: string;
    name_ar: string;
  }>;
  created_at: string;
  updated_at: string;
  status?: number; // 0 = inactive, 1 = active
  status_label?: string; // "Active" or "Inactive"
  has_user?: boolean;
}

export interface CustomerFilters {
  search?: string;
  status?: number;
  company_id?: number;
  page?: number;
  per_page?: number;
  last_id?: number;
}

export interface CreateCustomerData {
  company_id: number;
  name_en: string;
  name_ar: string;
  phone_number: string;
  email: string;
  tax_number: string;
  role_id: number;
  name: string; // User name
  password?: string; // Password for user account
  group_id?: string;
  status?: string;
}

export interface InviteCustomerData {
  company_id: number;
  email: string;
}

export interface RegisterFromInvitationData {
  token: string;
  company_id: number;
  name_en: string;
  name_ar: string;
  phone_number: string;
  email: string;
  tax_number: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateCustomerData {
  company_id: number;
  name_en: string;
  name_ar: string;
  phone_number: string;
  email: string;
  tax_number: string;
  role_id: number;
  name: string; // User name
  password?: string; // Optional password update
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

export const customersApi = {
  /**
   * Get all customers with filters
   * GET /api/customers
   */
  getAll: (filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/customers?${params.toString()}`);
  },

  /**
   * Get customers dropdown (simplified list)
   * GET /api/customers/dropdown
   */
  getDropdown: (
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Pick<Customer, 'id' | 'name_en' | 'name_ar' | 'email'>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/customers/dropdown?${params.toString()}`);
  },

  /**
   * Get customer by ID
   * GET /api/customers/{id}
   */
  getById: (id: number): Promise<ApiResponse<Customer>> => {
    return get(`/customers/${id}`);
  },

  /**
   * Create new customer
   * POST /api/customers
   */
  create: (customerData: CreateCustomerData): Promise<ApiResponse<Customer>> => {
    return post('/customers', customerData);
  },

  /**
   * Invite new customer
   * POST /api/customers/invite
   */
  invite: (customerData: InviteCustomerData): Promise<ApiResponse<Customer>> => {
    return post('/customers/invite', customerData);
  },

  /**
   * Invite new customer
   * POST /api/customers/register
   */
  registerFromInvitation: (customerData: RegisterFromInvitationData): Promise<ApiResponse<Customer>> => {
    return put('/customers/register', customerData);
  },

  /**
   * Update customer
   * PUT /api/customers/{id}
   */
  update: (id: number, customerData: UpdateCustomerData): Promise<ApiResponse<Customer>> => {
    return put(`/customers/${id}`, customerData);
  },

  /**
   * Delete customer
   * DELETE /api/customers/{id}
   */
  delete: (id: number): Promise<ApiResponse<null>> => {
    return del(`/customers/${id}`);
  },

  /**
   * Change customer status
   * PATCH /api/customers/{id}/status
   */
  changeStatus: (id: number, status: number): Promise<ApiResponse<Customer>> => {
    return patch(`/customers/${id}/status`, { status });
  },
};

export default customersApi;
