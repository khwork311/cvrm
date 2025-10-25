const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_TYPE_KEY = 'token_type';
const EXPIRES_IN_KEY = 'expires_in';

export class TokenManager {
  /**
   * Store tokens in localStorage
   */
  static setTokens(data: {
    access_token: string;
    refresh_token: string;
    token_type?: string;
    expires_in?: number;
  }): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    if (data.token_type) {
      localStorage.setItem(TOKEN_TYPE_KEY, data.token_type);
    }
    if (data.expires_in) {
      localStorage.setItem(EXPIRES_IN_KEY, data.expires_in.toString());
    }
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Get token type from localStorage
   */
  static getTokenType(): string | null {
    return localStorage.getItem(TOKEN_TYPE_KEY);
  }

  /**
   * Get both tokens
   */
  static getTokens(): {
    access_token: string;
    refresh_token: string;
    token_type: string | null;
    expires_in: number | null;
  } | null {
    const access_token = this.getAccessToken();
    const refresh_token = this.getRefreshToken();

    if (!access_token || !refresh_token) {
      return null;
    }

    const token_type = this.getTokenType();
    const expires_in_str = localStorage.getItem(EXPIRES_IN_KEY);
    const expires_in = expires_in_str ? parseInt(expires_in_str, 10) : null;

    return { access_token, refresh_token, token_type, expires_in };
  }

  /**
   * Update only the access token (used after refresh)
   */
  static updateAccessToken(access_token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  }

  /**
   * Clear all tokens from localStorage
   */
  static clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);
  }

  /**
   * Check if tokens exist
   */
  static hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  /**
   * Decode JWT token (without verification - for client-side use only)
   */
  static decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  /**
   * Check if access token is expired
   */
  static isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    return this.isTokenExpired(token);
  }
}
