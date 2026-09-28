import { authFetch, buildQuery } from './apiClient';

export const adminService = {
  // ==================== OVERVIEW ====================
  getStats: async () => authFetch(`/api/admin/stats`, { method: 'GET' }),

  // ==================== STUDENTS ====================
  getStudents: async (params = {}) =>
    authFetch(`/api/admin/users${buildQuery(params)}`, { method: 'GET' }),

  // ==================== TUTORS ====================
  getTutors: async (params = {}) =>
    authFetch(`/api/admin/tutors${buildQuery(params)}`, { method: 'GET' }),

  // ==================== MODERATION ====================
  setUserSuspended: async (userId, suspended, reason = '') =>
    authFetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended, reason }),
    }),

  deleteUser: async (userId) =>
    authFetch(`/api/admin/users/${userId}`, { method: 'DELETE' }),

  setTutorVerified: async (tutorProfileId, verified) =>
    authFetch(`/api/admin/tutors/${tutorProfileId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified }),
    }),

  setTutorListingActive: async (tutorProfileId, active) =>
    authFetch(`/api/admin/tutors/${tutorProfileId}/listing`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    }),

  // ==================== BOOKINGS ====================
  getBookings: async (params = {}) =>
    authFetch(`/api/admin/bookings${buildQuery(params)}`, { method: 'GET' }),

  setBookingStatus: async (bookingId, status) =>
    authFetch(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
};
