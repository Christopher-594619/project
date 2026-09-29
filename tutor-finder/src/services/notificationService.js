const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

export const notificationService = {
  getNotifications: async () => {
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load notifications');
    return data.notifications || [];
  },

  markAsRead: async (id) => {
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
  },
};