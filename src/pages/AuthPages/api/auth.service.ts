import { get, post } from '@/lib/axios';
import {
  ApiResponse,
  ForgotPasswordRequest,
  LoginCredentials,
  LoginResponse,
  ProfileResponse,
  RefreshTokenResponse,
  ResetPasswordRequest,
} from '@/types/auth.types';

/**
 * Auth Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return post<LoginResponse>('/auth/login', credentials);
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  static async logout(): Promise<ApiResponse> {
    return post<ApiResponse>('/auth/logout');
  }

  /**
   * Get user profile
   * GET /api/auth/profile
   */
  static async getProfile(): Promise<ProfileResponse> {
    return get<ProfileResponse>('/auth/profile');
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh-token
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return post<RefreshTokenResponse>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
  }

  /**
   * Forgot password - Send reset link
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    return post<ApiResponse>('/auth/forgot-password', data);
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    return post<ApiResponse>('/auth/reset-password', data);
  }
}
