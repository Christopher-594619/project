const API_URL = import.meta.env.VITE_ENDPOINT_URL;
import { getUserLocation } from "../utils/location";

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper for handling fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const tutorService = {
  // ==================== GET ALL TUTORS ====================
  // src/services/tutorService.js
  getTutors: async () => {
    try {
      const coords = await getUserLocation();
      const queryParams = new URLSearchParams();
      if (coords) {
        queryParams.append('lat', coords.lat);
        queryParams.append('lng', coords.lng);
      }

      const response = await fetch(
        `${API_URL}/api/tutors?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await handleResponse(response);
      return data.tutors || [];
    } catch (error) {
      console.error('Error fetching tutors:', error);
      throw error;
    }
  },

  // ==================== GET TUTOR BY ID ====================
  getTutorById: async (id) => {
    const coords = await getUserLocation();
    const queryParams = new URLSearchParams();
    if (coords) {
      queryParams.append('lat', coords.lat);
      queryParams.append('lng', coords.lng);
    }

    const response = await fetch(
      `${API_URL}/api/tutors/${id}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      }
    );

    const data = await handleResponse(response);
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

      const response = await fetch(
        `${API_URL}/api/tutors/search?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      const data = await handleResponse(response);
      return data.tutors || [];
    } catch (error) {
      console.error('Error searching tutors:', error);
      throw error;
    }
  },

  // ==================== GET FEATURED TUTORS ====================
  getFeaturedTutors: async () => {
    try {
      const response = await fetch(`${API_URL}/api/tutors/featured`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await handleResponse(response);
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
      const response = await fetch(`${API_URL}/api/tutors/popular-subjects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await handleResponse(response);
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
      const response = await fetch(`${API_URL}/api/reviews/testimonials`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await handleResponse(response);
      return data.testimonials || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback: get top reviews
      try {
        const response = await fetch(`${API_URL}/api/reviews/top?limit=3`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        });
        const data = await handleResponse(response);
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
      const response = await fetch(`${API_URL}/api/tutors/${tutorId}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await handleResponse(response);
      return data.reviews || [];
    } catch (error) {
      console.error('Error fetching tutor reviews:', error);
      return [];
    }
  },

  // ==================== GET TUTOR BY USER ID ====================
  getTutorByUserId: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/tutors/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await handleResponse(response);
      return data.tutor;
    } catch (error) {
      console.error('Error fetching tutor by user ID:', error);
      throw error;
    }
  },

  // ==================== CREATE TUTOR PROFILE ====================
  createTutorProfile: async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/tutors/profile`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          // DO NOT set Content-Type - browser sets it with boundary for FormData
        },
        body: formData,
      });

      const data = await handleResponse(response);
      return data.tutor;
    } catch (error) {
      console.error('Error creating tutor profile:', error);
      throw error;
    }
  },

  // ==================== UPDATE TUTOR PROFILE ====================
  updateTutorProfile: async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/tutors/profile`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      const data = await handleResponse(response);
      return data.tutor;
    } catch (error) {
      console.error('Error updating tutor profile:', error);
      throw error;
    }
  },
};