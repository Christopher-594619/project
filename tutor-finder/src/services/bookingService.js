import { authFetch, buildQuery } from './apiClient';

export const bookingService = {
  // ==================== CREATE BOOKING ====================
  // bookingData: { tutorId, subject, date, time, duration, notes }
  createBooking: async (bookingData) => {
    const data = await authFetch(`/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return data.booking;
  },

  // ==================== LIST BOOKINGS ====================
  // The server infers whether you're a student or tutor from your session,
  // so userId/userType are kept only for call-site compatibility.
  getBookings: async (_userId, _userType, extra = {}) => {
    const data = await authFetch(`/api/bookings${buildQuery(extra)}`, {
      method: 'GET',
    });
    return data.bookings || [];
  },

  getUpcomingBookings: async (userId, userType) =>
    bookingService.getBookings(userId, userType, { scope: 'upcoming' }),

  getBookingHistory: async (userId, userType) =>
    bookingService.getBookings(userId, userType, { scope: 'history' }),

  // ==================== UPDATE / CANCEL ====================
  updateBookingStatus: async (bookingId, status) => {
    const data = await authFetch(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return data.booking;
  },

  cancelBooking: async (bookingId) => bookingService.updateBookingStatus(bookingId, 'cancelled'),

  // ==================== TUTOR EARNINGS ====================
  getEarnings: async () => {
    const data = await authFetch(`/api/bookings/earnings`, { method: 'GET' });
    return data.earnings;
  },
};
