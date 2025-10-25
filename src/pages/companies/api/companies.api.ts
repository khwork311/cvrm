/**
 * Companies API Service
 *
 * API calls related to companies and their sub-resources
 * (contacts, bank accounts, addresses, countries/cities)
 */

import { get, patch, post, put } from '../../../lib/axios';

// ============================================================================
// Companies API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Company {
  id: number;
  name_en: string;
  name_ar: string;
  vat_number: string;
  telephone_number?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  website_url?: string | null;
  main_account_number?: string | null;
  sub_account_number?: string | null;
  attachments?: any | null;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  plan_id: number;
  plan?: {
    id: number;
    title_en: string;
    title_ar: string;
  };
  status: 1 | 0;
  status_label?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CompanyFilters {
  search?: string;
  status?: string;
  plan_id?: number;
  page?: number;
  per_page?: number;
}

export const companiesApi = {
  /**
   * Get all companies with filters
   */
  getAll: (
    filters?: CompanyFilters
  ): Promise<
    ApiResponse<{
      current_page: number;
      data: Company[];
      total: number;
      per_page: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }>
  > => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/companies?${params.toString()}`);
  },

  /**
   * Get company by ID
   */
  getById: (id: number): Promise<ApiResponse<Company>> => {
    return get(`/companies/${id}`);
  },

  /**
   * Get companies dropdown (simplified list)
   */
  getDropdown: (): Promise<
    ApiResponse<{
      current_page: number;
      data: Company[];
      total: number;
      per_page: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }>
  > => {
    return get('/companies/dropdown');
  },

  /**
   * Create new company with contact person
   */
  create: (
    companyData:
      | FormData
      | (Omit<Company, 'id'> & {
          first_name_en: string;
          first_name_ar: string;
          last_name_en: string;
          last_name_ar: string;
          email: string;
          position?: string;
        })
  ): Promise<ApiResponse<Company>> => {
    return post('/companies', companyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update company
   * Note: Uses POST with _method=PUT to support FormData with file uploads
   */
  update: (id: number, companyData: FormData | Partial<Company>): Promise<ApiResponse<Company>> => {
    // If FormData, use POST with _method=PUT (Laravel method spoofing)
    if (companyData instanceof FormData) {
      companyData.append('_method', 'PUT');
      return post(`/companies/${id}`, companyData);
    }
    // Otherwise use regular PUT
    return put(`/companies/${id}`, companyData);
  },

  /**
   * Toggle company status
   */
  toggleStatus: (id: number): Promise<ApiResponse<Company>> => {
    return patch(`/companies/${id}/status`);
  },

  /**
   * Activate company and send credentials email
   */
  activate: (id: number): Promise<ApiResponse<Company>> => {
    return patch(`/companies/${id}/status`);
  },
};

// ============================================================================
// Contact Persons API
// ============================================================================

export interface ContactPerson {
  id: number;
  company_id: number;
  first_name_en: string;
  first_name_ar: string;
  last_name_en: string;
  last_name_ar: string;
  email: string;
  position?: string | null;
  status: number; // 0 = inactive, 1 = active
  status_label?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactFilters {
  company_id: number;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const contactsApi = {
  /**
   * Get all contacts for a company
   */
  getAll: (
    filters?: ContactFilters
  ): Promise<
    ApiResponse<{
      current_page: number;
      data: ContactPerson[];
      total: number;
      per_page: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }>
  > => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/contacts?${params.toString()}`);
  },

  /**
   * Get contact by ID
   */
  getById: (id: number): Promise<ApiResponse<ContactPerson>> => {
    return get(`/contacts/${id}`);
  },

  /**
   * Create new contact
   */
  create: (
    companyId: number,
    contactData: Omit<ContactPerson, 'id' | 'company_id'>
  ): Promise<ApiResponse<ContactPerson>> => {
    return post(`/contacts`, { ...contactData, company_id: companyId });
  },

  /**
   * Update contact
   */
  update: (id: number, contactData: Partial<ContactPerson>): Promise<ApiResponse<ContactPerson>> => {
    return put(`/contacts/${id}`, contactData);
  },

  /**
   * Toggle contact status
   */
  toggleStatus: (id: number): Promise<ApiResponse<ContactPerson>> => {
    return patch(`/contacts/${id}/status`);
  },
};

// ============================================================================
// Bank Accounts API
// ============================================================================

export interface BankAccount {
  id: number;
  company_id: number;
  bank_name_en: string;
  bank_name_ar: string;
  iban_number: string;
  swift_code?: string | null;
  branch_en?: string | null;
  branch_ar?: string | null;
  bank_country?: string | null;
  status: number; // 0 = inactive, 1 = active
  status_label?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccountFilters {
  company_id?: number;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const bankAccountsApi = {
  /**
   * Get all bank accounts for a company
   */
  getAll: (
    companyId: number,
    filters?: BankAccountFilters
  ): Promise<
    ApiResponse<{
      current_page: number;
      data: BankAccount[];
      total: number;
      per_page: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }>
  > => {
    const params = new URLSearchParams();
    params.append('company_id', String(companyId));
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/bank-accounts?${params.toString()}`);
  },

  /**
   * Get all countries
   */
  getAllCountries: (): Promise<
    ApiResponse<{
      current_page: number;
      data: Country[];
      total: number;
      per_page: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }>
  > => {
    return get('/countries');
  },

  /**
   * Get bank account by ID
   */
  getById: (id: number): Promise<ApiResponse<BankAccount>> => {
    return get(`/bank-accounts/${id}`);
  },

  /**
   * Create new bank account
   */
  create: (
    companyId: number,
    accountData: Omit<BankAccount, 'id' | 'company_id'>
  ): Promise<ApiResponse<BankAccount>> => {
    return post(`/bank-accounts`, { ...accountData, company_id: companyId });
  },

  /**
   * Update bank account
   */
  update: (id: number, accountData: Partial<BankAccount>): Promise<ApiResponse<BankAccount>> => {
    return put(`/bank-accounts/${id}`, accountData);
  },

  /**
   * Toggle bank account status
   */
  toggleStatus: (id: number): Promise<ApiResponse<BankAccount>> => {
    return patch(`/bank-accounts/${id}/status`);
  },
};

// ============================================================================
// Addresses API
// ============================================================================

export interface Address {
  id: number;
  company_id: number;
  city_id: number;
  city?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  country_id: number;
  country?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  address_name: string;
  street_name: string;
  building_number?: string | null;
  postal_code?: string | null;
  status?: number; // 0 = inactive, 1 = active (optional, defaults to 1)
  status_label?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AddressFilters {
  company_id?: number;
  search?: string;
  status?: string;
  country_id?: number;
  city_id?: number;
  page?: number;
  limit?: number;
}

export const addressesApi = {
  /**
   * Get all addresses for a company
   */
  getAll: (
    companyId: number,
    filters?: AddressFilters
  ): Promise<
    ApiResponse<{
      current_page: number;
      data: Address[];
      total: number;
      per_page: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }>
  > => {
    const params = new URLSearchParams();
    params.append('company_id', String(companyId));
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/addresses?${params.toString()}`);
  },

  /**
   * Get address by ID
   */
  getById: (id: number): Promise<ApiResponse<Address>> => {
    return get(`/addresses/${id}`);
  },

  /**
   * Create new address
   */
  create: (companyId: number, addressData: Omit<Address, 'id' | 'company_id'>): Promise<ApiResponse<Address>> => {
    return post(`/addresses`, { ...addressData, company_id: companyId });
  },

  /**
   * Update address
   */
  update: (id: number, addressData: Partial<Address>): Promise<ApiResponse<Address>> => {
    return put(`/addresses/${id}`, addressData);
  },

  /**
   * Toggle address status
   */
  toggleStatus: (id: number): Promise<ApiResponse<Address>> => {
    return patch(`/addresses/${id}/status`);
  },
};

// ============================================================================
// Countries & Cities API
// ============================================================================

export interface Country {
  id: number;
  name_en: string;
  name_ar: string;
  code?: string;
}

export interface City {
  id: number;
  country_id: number;
  name_en: string;
  name_ar: string;
}

export const countriesApi = {
  /**
   * Get all countries
   */
  getAll: async (): Promise<Country[]> => {
    const response: ApiResponse<{
      current_page: number;
      data: Country[];
      total: number;
      per_page: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }> = await get('/countries');
    return response.data.data;
  },

  /**
   * Get cities by country
   */
  getCities: async (countryId: number): Promise<City[]> => {
    const response: ApiResponse<City[]> = await get(`/countries/${countryId}/cities`);
    return response.data;
  },
};

// ============================================================================
// Export all Companies-related APIs
// ============================================================================

export const companiesApiService = {
  companies: companiesApi,
  contacts: contactsApi,
  bankAccounts: bankAccountsApi,
  addresses: addressesApi,
  countries: countriesApi,
};

export default companiesApiService;
