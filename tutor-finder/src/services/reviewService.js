export const reviewService = {
  addReview: async (reviewData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now(),
          ...reviewData,
          timestamp: new Date().toISOString(),
        });
      }, 500);
    });
  },

  getReviews: async (tutorId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 300);
    });
  },

  updateReview: async (reviewId, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: reviewId, ...data });
      }, 500);
    });
  },

  deleteReview: async (reviewId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },
};