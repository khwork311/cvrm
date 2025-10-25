import { AuthService } from '@/pages/AuthPages/api/auth.service';
import { AuthContextType, LoginCredentials, ResetPasswordRequest, User } from '@/types/auth.types';
import { TokenManager } from '@/utils/tokenManager';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  /**
   *
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = TokenManager.getTokens();

        if (!tokens) {
          setIsLoading(false);
          return;
        }

        // Check if access token is expired
        if (TokenManager.isAccessTokenExpired()) {
          // Try to refresh
          await refreshAuth();
        } else {
          // Fetch user profile
          await fetchUserProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        TokenManager.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Fetch user profile
   */
  const fetchUserProfile = async () => {
    try {
      const response = await AuthService.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  };

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        const response = await AuthService.login(credentials);

        // Store tokens
        TokenManager.setTokens({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in,
        });

        // Set user
        setUser(response.data.user);

        // Navigate to dashboard
        navigate('/');
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await AuthService.logout().catch(() => {
        // Ignore errors on logout endpoint
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user state
      TokenManager.clearTokens();
      setUser(null);
    }
  }, [navigate]);

  /**
   * Refresh authentication
   */
  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await AuthService.refreshToken(refreshToken);

      // Update tokens
      TokenManager.setTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
      });

      // Fetch updated user profile
      await fetchUserProfile();
    } catch (error) {
      console.error('Token refresh error:', error);
      TokenManager.clearTokens();
      setUser(null);
      throw error;
    }
  }, []);

  /**
   * Forgot password
   */
  const forgotPassword = useCallback(async (email: string) => {
    try {
      await AuthService.forgotPassword({ email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }, []);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    try {
      await AuthService.resetPassword(data);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
