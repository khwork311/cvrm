/**
 * Shared API Types
 * 
 * Common interfaces used across multiple API services
 */

// ============================================================================
// Common Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
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

// ============================================================================
// Common Filter Types
// ============================================================================

export interface BaseFilters {
  search?: string;
  page?: number;
  per_page?: number;
  last_id?: number;
}

export interface StatusFilter {
  status?: number; // 0 = inactive, 1 = active
}

// ============================================================================
// Common Entity Types
// ============================================================================

export interface Company {
  id: number;
  name_en: string;
  name_ar: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name?: string;
}

export interface Country {
  id: number;
  name_en: string;
  name_ar: string;
  code: string;
}

export interface City {
  id: number;
  country_id: number;
  name_en: string;
  name_ar: string;
}

// ============================================================================
// Common Status Values
// ============================================================================

export enum Status {
  INACTIVE = 0,
  ACTIVE = 1,
}

// ============================================================================
// Common HTTP Methods Type
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// ============================================================================
// Error Response Type
// ============================================================================

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
