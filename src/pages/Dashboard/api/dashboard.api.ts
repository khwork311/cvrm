/**
 * Dashboard API Service
 * 
 * API calls related to dashboard statistics and analytics
 */

import { get } from '../../../lib/axios';

// ============================================================================
// Dashboard API
// ============================================================================

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  activeUsers: number;
  revenue: number;
}

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: (): Promise<DashboardStats> => {
    return get('/dashboard/stats');
  },

  /**
   * Get recent activity
   */
  getRecentActivity: (limit?: number): Promise<any[]> => {
    return get(`/dashboard/activity${limit ? `?limit=${limit}` : ''}`);
  },

  /**
   * Get analytics data
   */
  getAnalytics: (startDate: string, endDate: string): Promise<any> => {
    return get(`/dashboard/analytics?start=${startDate}&end=${endDate}`);
  },
};

export default dashboardApi;
