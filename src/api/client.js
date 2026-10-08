import axios from 'axios';

export const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

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

// Request Interceptor: Attach bearer token if active
apiClient.interceptors.request.use(
  (config) => {
    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
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
    const formattedError = {
      message: error.response?.data?.message || error.response?.data?.error || error.message || 'API Request failed',
      status: error.response?.status || 0,
      data: error.response?.data || null,
      isAxiosError: true,
    };
    return Promise.reject(formattedError);
  }
);

export default apiClient;
