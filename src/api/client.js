import axios from 'axios';

export const BASE_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? '/api/v1'
    : 'http://localhost:5001/api/v1');

let activeToken = null;

export const setAuthToken = (token) => {
  activeToken = token || null;
};

export const getAuthToken = () => activeToken;

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
    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
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

// Response Interceptor: Format errors and handle global status codes
apiClient.interceptors.response.use(
  (response) => {
    // Return data payload directly
    return response.data;
  },
  (error) => {
    const errorData = error.response?.data;
    let message = 'API Request failed';

    if (errorData) {
      if (typeof errorData === 'string') {
        message = errorData;
      } else if (typeof errorData.message === 'string') {
        message = errorData.message;
      } else if (typeof errorData.error === 'string') {
        message = errorData.error;
      } else if (errorData.error && typeof errorData.error.message === 'string') {
        message = errorData.error.message;
      }
    } else if (typeof error.message === 'string') {
      message = error.message;
    }

    const formattedError = {
      message,
      status: error.response?.status || 0,
      data: error.response?.data || null,
      isAxiosError: true,
    };
    return Promise.reject(formattedError);
  }
);

export default apiClient;
