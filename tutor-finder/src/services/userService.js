import { authFetch } from './apiClient';

export const userService = {
  // Editable personal details (names, phone, addresses, ...).
  getDetails: async () => {
    const data = await authFetch(`/api/users/details`, { method: 'GET' });
    return data.user;
  },

  // /api/users/update overwrites every field it knows about, so always send the
  // full details object (as loaded from getDetails) with your edits applied.
  updateDetails: async (details) => {
    const data = await authFetch(`/api/users/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    return data.user;
  },
};
