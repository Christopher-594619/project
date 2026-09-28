const API_URL = import.meta.env.VITE_ENDPOINT_URL;
const ACCESS_TOKEN_KEY = "accessToken";

// Coalesce concurrent refresh attempts into a single request.
let refreshPromise = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.accessToken) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          return null;
        }
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const buildHeaders = (extra = {}) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

// Fetch with the current access token attached. On a 401 (expired token),
// refreshes it once via the httpOnly refresh cookie and retries the request
// before giving up, so a request made after the 15-minute access token
// expires doesn't surface as a stray 401.
export const authFetch = async (path, options = {}) => {
  const { headers = {}, ...rest } = options;

  let response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: buildHeaders(headers),
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: buildHeaders(headers),
      });
    }
  }

  return handleResponse(response);
};

export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
};
