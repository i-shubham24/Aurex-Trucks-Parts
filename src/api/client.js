import axios from 'axios';

export const BASE_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? '/api/v1'
    : 'http://localhost:5001/api/v1');

const TOKEN_KEY = 'aurex_access_token';
const REFRESH_KEY = 'aurex_refresh_token';

/* The one access-token store. Both HTTP clients (this axios instance and lib/api.js)
   read and write the token through these helpers, so they always send the same one. */
let activeToken = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
})();

export const setAuthToken = (token) => {
  activeToken = token || null;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch { }
};

export const getAuthToken = () => {
  if (activeToken) return activeToken;
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setRefreshToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(REFRESH_KEY, token);
    } else if (token === null) {
      localStorage.removeItem(REFRESH_KEY);
    }
  } catch { }
};

/* Fired when the refresh token is rejected; the auth store listens and signs the user out. */
export const SESSION_EXPIRED_EVENT = 'aurex:session-expired';

let refreshing = null;

/**
 * Swap the refresh token for a new access token. Concurrent callers share one request.
 * Resolves true on success. If the server rejects the refresh token the stored session
 * is cleared (so no stale bearer header keeps going out); a network failure keeps it.
 */
export function refreshSession() {
  if (!refreshing) {
    refreshing = (async () => {
      let res;
      try {
        const refreshToken = (() => {
          try {
            return localStorage.getItem(REFRESH_KEY) || '';
          } catch {
            return '';
          }
        })();
        res = await fetch(BASE_API_URL + '/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        });
      } catch {
        return false;
      }
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setAuthToken(null);
          setRefreshToken(null);
          try {
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
          } catch { }
        }
        return false;
      }
      const data = await res.json().catch(() => ({}));
      const newAccess = data.accessToken || data.data?.accessToken;
      const newRefresh = data.refreshToken || data.data?.refreshToken;
      if (!newAccess) return false;
      setAuthToken(newAccess);
      setRefreshToken(newRefresh);
      return true;
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/**
 * Axios instance configured with baseURL, credentials, and interceptors
 */
export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const CART_SESSION_KEY = 'aurex_cart_session_id';

export const getCartSessionId = () => {
  try {
    let id = localStorage.getItem(CART_SESSION_KEY);
    if (!id) {
      id = 'cs_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem(CART_SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

export const setCartSessionId = (id) => {
  try {
    if (id) localStorage.setItem(CART_SESSION_KEY, id);
  } catch { /* ignore */ }
};

// Request Interceptor: Attach bearer token and session id
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.url && (config.url.includes('/cart') || config.url.includes('/checkout'))) {
      const sessionId = getCartSessionId();
      if (sessionId) {
        config.headers['x-session-id'] = sessionId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const messageFrom = (errorData, fallback) => {
  if (errorData) {
    if (typeof errorData === 'string') return errorData;
    if (typeof errorData.message === 'string') return errorData.message;
    if (typeof errorData.error === 'string') return errorData.error;
    if (errorData.error && typeof errorData.error.message === 'string') return errorData.error.message;
  }
  return fallback;
};

// Login, signup and refresh answer 401 for bad credentials; that is not an expired session.
const NO_REFRESH_RX = /\/auth\/(login|register|refresh|logout)/;

// Response Interceptor: Format errors and handle global status codes
apiClient.interceptors.response.use(
  (response) => {
    // Return data payload directly
    return response.data;
  },
  async (error) => {
    // One silent refresh + retry on an expired access token (same rule as lib/api.js).
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH_RX.test(original.url || '') &&
      getAuthToken()
    ) {
      original._retry = true;
      if (await refreshSession()) return apiClient(original);
    }

    const errorData = error.response?.data;
    const message = errorData
      ? messageFrom(errorData, 'API Request failed')
      : typeof error.message === 'string' ? error.message : 'API Request failed';

    const formattedError = {
      message,
      status: error.response?.status || 0,
      data: error.response?.data || null,
      isAxiosError: true,
    };
    return Promise.reject(formattedError);
  }
);

/* Staff screens live under /admin. Their reads keep credentials so they never get a
   CDN-cached copy and can see drafts. */
const isStaffConsole = () => {
  try {
    return window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  } catch {
    return false;
  }
};

/**
 * GET for public catalogue data (products, categories, settings, carousel, blogs, promos).
 * Sent with no Authorization header and no cookies, so the CDN can cache the response for
 * signed-in shoppers too (the API only marks credential-free responses cacheable).
 * Resolves to the response body and rejects with the same error shape as apiClient.
 */
export async function publicGet(path, { params, withAuth = false } = {}) {
  if (withAuth || isStaffConsole()) return apiClient.get(path, { params });

  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((v) => qs.append(`${key}[]`, v));
    else qs.append(key, value);
  });
  const query = qs.toString();

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 15000) : null;
  let res;
  try {
    res = await fetch(`${BASE_API_URL}${path}${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      signal: controller?.signal,
    });
  } catch (err) {
    return Promise.reject({
      message: err?.name === 'AbortError' ? 'timeout of 15000ms exceeded' : (err?.message || 'API Request failed'),
      status: 0,
      data: null,
      isAxiosError: true,
    });
  } finally {
    if (timer) clearTimeout(timer);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return Promise.reject({
      message: messageFrom(data, `Request failed with status code ${res.status}`),
      status: res.status,
      data,
      isAxiosError: true,
    });
  }
  return data;
}

export default apiClient;
