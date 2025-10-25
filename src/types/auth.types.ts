// Permission interface
export interface Permission {
  id: number;
  name: string;
}

// Role interface
export interface Role {
  id: number;
  name: string;
}

// User interface matching API response
export interface User {
  id: number;
  name: string;
  email: string;
  status: number;
  role: Role;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
  company_id?: number;
}

// Auth tokens
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register credentials
export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// Login API response
export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
}

// Profile API response
export interface ProfileResponse {
  success: boolean;
  data: User;
  message: string;
}

// Refresh token API response
export interface RefreshTokenResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
}

// Forgot password request
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request
export interface ResetPasswordRequest {
  email: string;
  token: string;
  company_id: string;
  password: string;
  password_confirmation: string;
}

// Generic API response
export interface ApiResponse {
  success: boolean;
  message: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
}
