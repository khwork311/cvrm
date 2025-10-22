/**
 * Vendors API Service
 *
 * API calls related to vendors and their sub-resources
 * (addresses, bank accounts, invitations)
 */

import { get, patch, post, del } from '../../../lib/axios';

// ============================================================================
// Vendors API
// ============================================================================

export interface Vendor {
  id: number;
  company_id: number;
  name_en: string;
  name_ar?: string;
  phone_number: string;
  email: string;
  tax_number?: string;
  status: number; // 0 = inactive, 1 = active
  status_label?: string; // "Active" or "Inactive"
  invited_at?: string | null;
  invitation_token?: string | null;
  invitation_expires_at?: string | null;
  invitation_status?: string; // "never_invited", "pending", "accepted", "expired"
  has_user?: boolean;
  user_id?: number | null;
  user?: {
    id: number;
    name: string;
    email: string;
    status: number;
    role?: {
      id: number;
      name: string;
    };
  } | null;
  company?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  addresses?: any[];
  banks?: any[];
  groups?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface VendorFilters {
  search?: string;
  status?: number;
  has_user?: boolean;
  invitation_status?: string;
  page?: number;
  per_page?: number;
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

export const vendorsApi = {
  /**
   * Get all vendors with filters
   * GET /api/v1/vendors
   */
  getAll: (filters?: VendorFilters): Promise<PaginatedResponse<Vendor>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/vendors?${params.toString()}`);
  },

  /**
   * Get vendor by ID
   * GET /api/v1/vendors/:vendor
   */
  getById: (vendorId: number): Promise<ApiResponse<Vendor>> => {
    return get(`/vendors/${vendorId}`);
  },

  /**
   * Get vendors dropdown (simplified list)
   * GET /api/v1/vendors/dropdown
   */
  getDropdown: (filters?: VendorFilters): Promise<PaginatedResponse<Pick<Vendor, 'id' | 'name_en' | 'name_ar'>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/vendors/dropdown?${params.toString()}`);
  },

  /**
   * Create new vendor
   * POST /api/v1/vendors
   * Requires: name_en, name_ar, email, phone_number, tax_number, status, role_id, group_ids[]
   */
  create: (vendorData: any): Promise<ApiResponse<Vendor>> => {
    const formData = new FormData();
    
    // Add all vendor fields except arrays
    Object.entries(vendorData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !Array.isArray(value)) {
        formData.append(key, String(value));
      }
    });
    
    // Handle group_ids array
    if (vendorData.group_ids && Array.isArray(vendorData.group_ids)) {
      vendorData.group_ids.forEach((id: number) => {
        formData.append('group_ids[]', String(id));
      });
    }
    
    // Add required fields if not present
    if (!vendorData.role_id) {
      formData.append('role_id', '4'); // Default vendor role
    }
    
    return post(`/vendors`, formData);
  },

  /**
   * Update vendor
   * POST /api/v1/vendors/:vendor?_method=PUT
   */
  update: (vendorId: number, vendorData: any): Promise<ApiResponse<Vendor>> => {
    // Backend uses POST with _method=PUT for updates
    const formData = new FormData();
    Object.entries(vendorData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !Array.isArray(value)) {
        formData.append(key, String(value));
      }
    });
    
    // Handle group_ids array
    if (vendorData.group_ids && Array.isArray(vendorData.group_ids)) {
      vendorData.group_ids.forEach((id: number) => {
        formData.append('group_ids[]', String(id));
      });
    }
    
    formData.append('_method', 'PUT');
    return post(`/vendors/${vendorId}`, formData);
  },

  /**
   * Toggle vendor status (activate/deactivate)
   * PATCH /api/v1/vendors/:vendor/status
   */
  toggleStatus: (vendorId: number): Promise<ApiResponse<Vendor>> => {
    return patch(`/vendors/${vendorId}/status`);
  },

  /**
   * Send invitation to vendor
   * POST /api/v1/vendors/invite
   */
  sendInvitation: (data: { email: string; exp_duration?: number }): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('email', data.email);
    if (data.exp_duration) {
      formData.append('exp_duration', String(data.exp_duration));
    }
    return post(`/vendors/invite`, formData);
  },

  /**
   * Export vendors to Excel
   * GET /api/v1/vendors/export/excel
   */
  exportExcel: (): Promise<ApiResponse<{ file_path: string }>> => {
    return get(`/vendors/export/excel`);
  },

  /**
   * Delete vendor
   * DELETE /api/v1/vendors/:vendor
   */
  delete: (vendorId: number): Promise<ApiResponse<null>> => {
    return del(`/vendors/${vendorId}`);
  },
};

// ============================================================================
// Vendor Addresses API
// ============================================================================

export interface VendorAddress {
  id: number;
  city_id: number;
  city: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  country_id: number;
  country: {
    id: number;
    name_en: string;
    name_ar: string;
    code?: string;
  };
  address_name: string;
  street_name: string;
  building_number?: string | null;
  postal_code?: string | null;
  address_type: 'billing' | 'shipping' | 'other';
  is_default: boolean;
  status: number; // 0 = inactive, 1 = active
  created_at?: string;
  updated_at?: string;
}

export interface VendorAddressFilters {
  search?: string;
  status?: number;
  address_type?: 'billing' | 'shipping' | 'other';
  page?: number;
  limit?: number;
}

export interface VendorAddressRequest {
  city_id: number;
  country_id: number;
  address_name: string;
  street_name: string;
  building_number?: string;
  postal_code?: string;
  address_type: 'billing' | 'shipping' | 'other';
  is_default: boolean;
  status: number;
}

export const vendorAddressesApi = {
  /**
   * Get all addresses for a vendor
   * GET /api/v1/vendor/addresses
   */
  getAll: (vendorId: number, filters?: VendorAddressFilters): Promise<PaginatedResponse<VendorAddress>> => {
    const params = new URLSearchParams();
    params.append('vendor_id', String(vendorId));
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/vendor/addresses?${params.toString()}`);
  },

  /**
   * Get address by ID
   * GET /api/v1/vendor/addresses/:id
   */
  getById: (addressId: number): Promise<ApiResponse<VendorAddress>> => {
    return get(`/vendor/addresses/${addressId}`);
  },

  /**
   * Create new address
   * POST /api/v1/vendor/addresses
   */
  create: (vendorId: number, addressData: any): Promise<ApiResponse<VendorAddress>> => {
    const formData = new FormData();
    formData.append('vendor_id', String(vendorId));
    Object.entries(addressData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    return post(`/vendor/addresses`, formData);
  },

  /**
   * Update address
   * POST /api/v1/vendor/addresses/:id?_method=PUT
   */
  update: (vendorId: number, addressId: number, addressData: any): Promise<ApiResponse<VendorAddress>> => {
    // Backend uses POST with _method=PUT for updates
    const formData = new FormData();
    formData.append('vendor_id', String(vendorId));
    Object.entries(addressData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append('_method', 'PUT');
    return post(`/vendor/addresses/${addressId}`, formData);
  },

  /**
   * Toggle address status
   * PATCH /api/v1/vendor/addresses/:id/toggleStatus
   */
  toggleStatus: (addressId: number): Promise<ApiResponse<VendorAddress>> => {
    return patch(`/vendor/addresses/${addressId}/toggleStatus`);
  },

  /**
   * Set default address
   * PATCH /api/v1/vendor/addresses/:id/default?type=billing|shipping
   */
  setDefault: (addressId: number, type: 'billing' | 'shipping'): Promise<ApiResponse<VendorAddress>> => {
    return patch(`/vendor/addresses/${addressId}/default?type=${type}`);
  },
};

// ============================================================================
// Vendor Bank Accounts API
// ============================================================================

export interface VendorBankAccount {
  id: number;
  bank_name_en: string;
  bank_name_ar: string;
  account_holder_name: string;
  account_number: string;
  iban_number: string;
  swift_code?: string | null;
  branch_en?: string | null;
  branch_ar?: string | null;
  bank_country?: string | null;
  currency?: string | null;
  is_default: boolean;
  status: number; // 0 = inactive, 1 = active
  created_at?: string;
  updated_at?: string;
}

export interface VendorBankAccountFilters {
  search?: string;
  status?: number;
  page?: number;
  limit?: number;
}

export interface VendorBankAccountRequest {
  bank_name_en: string;
  bank_name_ar: string;
  account_holder_name: string;
  account_number: string;
  iban_number: string;
  swift_code?: string;
  branch_en?: string;
  branch_ar?: string;
  bank_country?: string;
  currency?: string;
  is_default: boolean;
  status: number;
}

export const vendorBankAccountsApi = {
  /**
   * Get all bank accounts for a vendor
   * GET /api/v1/vendor/banks
   */
  getAll: (vendorId: number, filters?: VendorBankAccountFilters): Promise<PaginatedResponse<VendorBankAccount>> => {
    const params = new URLSearchParams();
    params.append('vendor_id', String(vendorId));
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/vendor/banks?${params.toString()}`);
  },

  /**
   * Get bank account by ID
   * GET /api/v1/vendor/banks/:id
   */
  getById: (bankId: number): Promise<ApiResponse<VendorBankAccount>> => {
    return get(`/vendor/banks/${bankId}`);
  },

  /**
   * Create new bank account
   * POST /api/v1/vendor/banks
   */
  create: (vendorId: number, bankData: any): Promise<ApiResponse<VendorBankAccount>> => {
    const formData = new FormData();
    formData.append('vendor_id', String(vendorId));
    Object.entries(bankData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    return post(`/vendor/banks`, formData);
  },

  /**
   * Update bank account
   * POST /api/v1/vendor/banks/:id?_method=PUT
   */
  update: (vendorId: number, bankId: number, bankData: any): Promise<ApiResponse<VendorBankAccount>> => {
    // Backend uses POST with _method=PUT for updates
    const formData = new FormData();
    formData.append('vendor_id', String(vendorId));
    Object.entries(bankData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append('_method', 'PUT');
    return post(`/vendor/banks/${bankId}`, formData);
  },

  /**
   * Toggle bank account status
   * PATCH /api/v1/vendor/banks/:id/toggleStatus
   */
  toggleStatus: (bankId: number): Promise<ApiResponse<VendorBankAccount>> => {
    return patch(`/vendor/banks/${bankId}/toggleStatus`);
  },

  /**
   * Set default bank account
   * PATCH /api/v1/vendor/banks/:id/default
   */
  setDefault: (bankId: number): Promise<ApiResponse<VendorBankAccount>> => {
    return patch(`/vendor/banks/${bankId}/default`);
  },
};

// ============================================================================
// Vendor Groups API
// ============================================================================

export interface VendorGroup {
  id: number;
  company_id: number;
  name_en: string;
  name_ar: string;
  status: number;
  vendors?: Vendor[];
  vendors_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VendorGroupFilters {
  search?: string;
  status?: number;
  page?: number;
  limit?: number;
}

export const vendorGroupsApi = {
  /**
   * Get all vendor groups
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
  getById: (groupId: number): Promise<ApiResponse<VendorGroup>> => {
    return get(`/vendor-groups/${groupId}`);
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
  update: (groupId: number, groupData: { name_en: string; name_ar: string; status: number }): Promise<ApiResponse<VendorGroup>> => {
    // Backend uses POST with _method=PUT for updates
    const formData = new FormData();
    formData.append('name_en', groupData.name_en);
    formData.append('name_ar', groupData.name_ar);
    formData.append('status', String(groupData.status));
    formData.append('_method', 'PUT');
    return post(`/vendor-groups/${groupId}`, formData);
  },

  /**
   * Delete vendor group
   * DELETE /api/v1/vendor-groups/:id
   */
  delete: (groupId: number): Promise<ApiResponse<null>> => {
    return del(`/vendor-groups/${groupId}`);
  },

  /**
   * Assign vendors to group
   * PUT /api/v1/vendor-groups/:id/assign-vendor
   */
  assignVendors: (groupId: number, vendorIds: number[]): Promise<ApiResponse<VendorGroup>> => {
    return post(`/vendor-groups/${groupId}/assign-vendor`, { vendor_ids: vendorIds }, {
      headers: { 'Content-Type': 'application/json' }
    });
  },
};

// ============================================================================
// Invitation Acceptance API (Public - No Auth Required)
// ============================================================================

export interface InvitationValidation {
  valid: boolean;
  vendor?: {
    id: number;
    name_en: string;
    email: string;
    company_name: string;
  };
  message?: string;
}

export interface AcceptInvitationData {
  token: string;
  name_en: string;
  name_ar: string;
  email: string;
  phone_number: string;
  tax_number: string;
  password: string;
  password_confirmation: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  data: Vendor;
  message: string;
}

export const invitationApi = {
  /**
   * Validate invitation token
   */
  validateToken: (token: string): Promise<InvitationValidation> => {
    return get(`/auth/invitations/validate?token=${token}`);
  },

  /**
   * Accept invitation and create vendor account
   * POST /api/v1/auth/invitations/accept
   */
  acceptInvitation: (data: AcceptInvitationData): Promise<AcceptInvitationResponse> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    return post('/auth/invitations/accept', formData);
  },
};

// ============================================================================
// Export all Vendors-related APIs
// ============================================================================

export const vendorsApiService = {
  vendors: vendorsApi,
  addresses: vendorAddressesApi,
  bankAccounts: vendorBankAccountsApi,
  groups: vendorGroupsApi,
  invitation: invitationApi,
};

export default vendorsApiService;
