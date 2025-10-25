/**
 * Calendar API Service
 *
 * API calls related to calendar events management
 */

import { del, get, post, put } from '../../../lib/axios';

// ============================================================================
// Calendar API
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  allDay?: boolean;
  calendar: 'Danger' | 'Success' | 'Primary' | 'Warning';
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEventFilters {
  start_date?: string;
  end_date?: string;
  calendar?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

export const calendarApi = {
  /**
   * Get all calendar events with filters
   */
  getAll: (filters?: CalendarEventFilters): Promise<{ events: CalendarEvent[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return get(`/calendar/events?${params.toString()}`);
  },

  /**
   * Get event by ID
   */
  getById: (id: string): Promise<CalendarEvent> => {
    return get(`/calendar/events/${id}`);
  },

  /**
   * Create new event
   */
  create: (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> => {
    return post('/calendar/events', eventData);
  },

  /**
   * Update event
   */
  update: (id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    return put(`/calendar/events/${id}`, eventData);
  },

  /**
   * Delete event
   */
  delete: (id: string): Promise<void> => {
    return del(`/calendar/events/${id}`);
  },

  /**
   * Get events for a specific date range
   */
  getByDateRange: (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
    return get(`/calendar/events/range?start=${startDate}&end=${endDate}`);
  },
};

export default calendarApi;
