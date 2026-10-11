import { jwtDecode } from 'jwt-decode';

const API_URL = (import.meta.env.VITE_ENDPOINT_URL ?? '').replace(/\/$/, '');

let cachedAccessToken = null;
let refreshPromise = null;

const isTokenExpired = (token) => {
  try {
    return jwtDecode(token).exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok || !data.accessToken) {
        throw new Error(data.message || 'Authentication required');
      }

      cachedAccessToken = data.accessToken;
      return cachedAccessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const readResponse = async (response) => {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const authFetch = async (path, options = {}) => {
  const token =
    cachedAccessToken && !isTokenExpired(cachedAccessToken)
      ? cachedAccessToken
      : await refreshAccessToken();

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const request = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

  let response = await request();
  if (response.status === 401) {
    cachedAccessToken = null;
    const refreshedToken = await refreshAccessToken();
    headers.set('Authorization', `Bearer ${refreshedToken}`);
    response = await request();
  }

  const data = await readResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
};

export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined && item !== '') {
          query.append(key, item);
        }
      });
    } else {
      query.set(key, value);
    }
  });

  const search = query.toString();
  return search ? `?${search}` : '';
};
