import { getUserLocation } from "../utils/location";
import { authFetch } from "./apiClient";

export const tutorService = {
  // ==================== GET ALL TUTORS ====================
  getTutors: async () => {
    try {
      const coords = await getUserLocation();
      const queryParams = new URLSearchParams();
      if (coords) {
        queryParams.append('lat', coords.lat);
        queryParams.append('lng', coords.lng);
      }

      const data = await authFetch(`/api/tutors?${queryParams.toString()}`, {
        method: 'GET',
      });
      return data.tutors || [];
    } catch (error) {
      console.error('Error fetching tutors:', error);
      throw error;
    }
  },

  // ==================== GET TUTOR BY ID ====================
  getTutorById: async (id, currentLocation = null) => {
    const coords = currentLocation || await getUserLocation();
    const queryParams = new URLSearchParams();
    if (coords) {
      queryParams.append('lat', coords.lat);
      queryParams.append('lng', coords.lng);
    }

    const data = await authFetch(`/api/tutors/${id}?${queryParams.toString()}`, {
      method: 'GET',
    });
    return data.tutor;   // now has .distance
  },

  // ==================== SEARCH TUTORS ====================

  searchTutors: async (params) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.query) queryParams.append('q', params.query);
      if (params.subject) queryParams.append('subject', params.subject);
      if (params.level) queryParams.append('level', params.level);
      if (params.mode) queryParams.append('mode', params.mode);
      if (params.rating) queryParams.append('rating', params.rating);
      if (params.distance) queryParams.append('distance', params.distance);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
      if (params.availability) queryParams.append('availability', params.availability);

      // Attach user's coordinates (null-safe)
      const coords = await getUserLocation();
      if (coords) {
        queryParams.append('lat', coords.lat);
        queryParams.append('lng', coords.lng);
      }

      const data = await authFetch(`/api/tutors/search?${queryParams.toString()}`, {
        method: 'GET',
      });
      return data.tutors || [];
    } catch (error) {
      console.error('Error searching tutors:', error);
      throw error;
    }
  },

  // ==================== GET FEATURED TUTORS ====================
  getFeaturedTutors: async () => {
    try {
      const data = await authFetch(`/api/tutors/featured`, { method: 'GET' });
      return data.tutors || [];
    } catch (error) {
      console.error('Error fetching featured tutors:', error);
      // Fallback: fetch all and filter client-side
      try {
        const allTutors = await tutorService.getTutors();
        return allTutors
          .filter(t => t.rating >= 4.5)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6);
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        return [];
      }
    }
  },

  // ==================== GET POPULAR SUBJECTS ====================
  getPopularSubjects: async () => {
    try {
      const data = await authFetch(`/api/tutors/popular-subjects`, { method: 'GET' });
      return data.subjects || [];
    } catch (error) {
      console.error('Error fetching popular subjects:', error);
      // Fallback: compute from all tutors
      try {
        const allTutors = await tutorService.getTutors();
        const subjectCounts = {};

        allTutors.forEach(tutor => {
          tutor.subjects?.forEach(subject => {
            subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
          });
        });

        const subjectIcons = {
          'Mathematics': '📐',
          'Physics': '⚛️',
          'Chemistry': '🧪',
          'Biology': '🧬',
          'English': '📚',
          'Computer Science': '💻',
          'History': '📜',
          'Economics': '📊',
          'Psychology': '🧠',
          'Music': '🎵',
          'Art': '🎨',
          'Engineering': '⚙️',
          'Programming': '👨‍💻',
          'Spanish': '🇪🇸',
          'French': '🇫🇷',
        };

        return Object.entries(subjectCounts)
          .map(([name, count]) => ({
            name,
            count,
            icon: subjectIcons[name] || '📖',
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        return [];
      }
    }
  },

  // ==================== GET TESTIMONIALS ====================
  getTestimonials: async () => {
    try {
      const data = await authFetch(`/api/reviews/testimonials`, { method: 'GET' });
      return data.testimonials || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback: get top reviews
      try {
        const data = await authFetch(`/api/reviews/top?limit=3`, { method: 'GET' });
        return data.reviews || [];
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        return [];
      }
    }
  },

  // ==================== GET TUTOR REVIEWS ====================
  getTutorReviews: async (tutorId) => {
    try {
      const data = await authFetch(`/api/tutors/${tutorId}/reviews`, { method: 'GET' });
      return data.reviews || [];
    } catch (error) {
      console.error('Error fetching tutor reviews:', error);
      return [];
    }
  },

  // ==================== GET TUTOR BY USER ID ====================
  getTutorByUserId: async (userId) => {
    try {
      const data = await authFetch(`/api/tutors/user/${userId}`, { method: 'GET' });
      return data.tutor;
    } catch (error) {
      console.error('Error fetching tutor by user ID:', error);
      throw error;
    }
  },

  // ==================== CREATE TUTOR PROFILE ====================
  createTutorProfile: async (formData) => {
    try {
      // DO NOT set Content-Type - browser sets it with boundary for FormData
      const data = await authFetch(`/api/tutors/profile`, {
        method: 'POST',
        body: formData,
      });
      return data.tutor;
    } catch (error) {
      console.error('Error creating tutor profile:', error);
      throw error;
    }
  },

  // ==================== UPDATE TUTOR PROFILE ====================
  updateTutorProfile: async (formData) => {
    try {
      const data = await authFetch(`/api/tutors/profile`, {
        method: 'PUT',
        body: formData,
      });
      return data.tutor;
    } catch (error) {
      console.error('Error updating tutor profile:', error);
      throw error;
    }
  },
};
