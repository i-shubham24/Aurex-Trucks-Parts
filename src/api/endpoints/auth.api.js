import { apiClient, setAuthToken } from '../client';

/**
 * Log in with email and password
 */
export async function loginApi({ email, password }) {
  const response = await apiClient.post('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });

  const user = response?.data?.user || response?.user;
  const accessToken = response?.data?.accessToken || response?.accessToken;

  if (accessToken) {
    setAuthToken(accessToken);
    // Security: tokens kept in-memory only, not written to localStorage
    try { localStorage.removeItem('aurex_access_token'); } catch (e) {}
  }

  return {
    user,
    accessToken,
  };
}

/**
 * Register a new trade customer account
 */
export async function registerApi({ name, email, password, phone, company }) {
  const response = await apiClient.post('/auth/register', {
    name: name?.trim(),
    email: email?.trim().toLowerCase(),
    password,
    phone: phone?.trim(),
    company: company?.trim(),
    companyName: company?.trim(),
  });

  const user = response?.data?.user || response?.user;
  const accessToken = response?.data?.accessToken || response?.accessToken;

  if (accessToken) {
    setAuthToken(accessToken);
    // Security: tokens kept in-memory only, not written to localStorage
    try { localStorage.removeItem('aurex_access_token'); } catch (e) {}
  }

  return {
    user,
    accessToken,
  };
}

/**
 * Get current authenticated user session
 */
export async function getMeApi() {
  const response = await apiClient.get('/auth/me');
  return response?.data?.user || response?.user || null;
}

/**
 * Log out current session
 */
export async function logoutApi() {
  try {
    await apiClient.post('/auth/logout');
  } catch (e) {}
  setAuthToken(null);
  try {
    localStorage.removeItem('aurex_access_token');
  } catch (e) {}
  return true;
}

/**
 * Update user profile
 */
export async function updateProfileApi(data) {
  const response = await apiClient.put('/auth/profile', data);
  return response?.data?.user || response?.user || null;
}

export default {
  loginApi,
  registerApi,
  getMeApi,
  logoutApi,
  updateProfileApi,
};
