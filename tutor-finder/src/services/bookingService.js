export const bookingService = {
  createBooking: async (bookingData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `book_${Date.now()}`,
          ...bookingData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }, 500);
    });
  },

  getBookings: async (userId, userType) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockBookings = [
          {
            id: 'book_1',
            tutorId: 1,
            tutorName: 'Dr. Sarah Mitchell',
            tutorAvatar: 'SM',
            studentId: 1,
            studentName: 'John Doe',
            subject: 'Calculus',
            date: '2024-01-20',
            time: '14:00',
            duration: 60,
            status: 'confirmed',
            price: 75,
            totalAmount: 75,
            createdAt: '2024-01-15T10:00:00Z',
          },
          {
            id: 'book_2',
            tutorId: 2,
            tutorName: 'James Rodriguez',
            tutorAvatar: 'JR',
            studentId: 1,
            studentName: 'John Doe',
            subject: 'Physics',
            date: '2024-01-22',
            time: '15:30',
            duration: 90,
            status: 'pending',
            price: 65,
            totalAmount: 97.50,
            createdAt: '2024-01-16T14:30:00Z',
          },
          {
            id: 'book_3',
            tutorId: 3,
            tutorName: 'Emily Chen',
            tutorAvatar: 'EC',
            studentId: 2,
            studentName: 'Sarah Johnson',
            subject: 'Chemistry',
            date: '2024-01-18',
            time: '10:00',
            duration: 60,
            status: 'completed',
            price: 70,
            totalAmount: 70,
            createdAt: '2024-01-10T09:00:00Z',
          },
        ];

        const filtered = userType === 'student'
          ? mockBookings.filter(b => b.studentId === userId)
          : mockBookings.filter(b => b.tutorId === userId);

        resolve(filtered);
      }, 300);
    });
  },

  updateBookingStatus: async (bookingId, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: bookingId,
          status,
          updatedAt: new Date().toISOString(),
        });
      }, 500);
    });
  },

  cancelBooking: async (bookingId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: bookingId,
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });
      }, 500);
    });
  },

  getUpcomingBookings: async (userId, userType) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUpcoming = [
          {
            id: 'book_1',
            tutorId: 1,
            tutorName: 'Dr. Sarah Mitchell',
            tutorAvatar: 'SM',
            studentId: 1,
            studentName: 'John Doe',
            subject: 'Calculus',
            date: '2024-01-20',
            time: '14:00',
            duration: 60,
            status: 'confirmed',
            price: 75,
          },
          {
            id: 'book_2',
            tutorId: 2,
            tutorName: 'James Rodriguez',
            tutorAvatar: 'JR',
            studentId: 1,
            studentName: 'John Doe',
            subject: 'Physics',
            date: '2024-01-22',
            time: '15:30',
            duration: 90,
            status: 'pending',
            price: 65,
          },
        ];

        resolve(mockUpcoming);
      }, 300);
    });
  },

  getBookingHistory: async (userId, userType) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockHistory = [
          {
            id: 'book_3',
            tutorId: 3,
            tutorName: 'Emily Chen',
            tutorAvatar: 'EC',
            studentId: 2,
            studentName: 'Sarah Johnson',
            subject: 'Chemistry',
            date: '2024-01-18',
            time: '10:00',
            duration: 60,
            status: 'completed',
            price: 70,
            completedAt: '2024-01-18T11:00:00Z',
          },
        ];

        resolve(mockHistory);
      }, 300);
    });
  },

  getEarnings: async (tutorId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalEarnings: 1240,
          thisMonth: 450,
          thisWeek: 180,
          totalBookings: 32,
          completedBookings: 28,
          pendingBookings: 4,
          averageRating: 4.8,
        });
      }, 300);
    });
  },
};