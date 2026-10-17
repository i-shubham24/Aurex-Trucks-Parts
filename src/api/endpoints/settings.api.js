import { apiClient } from '../client';

/**
 * Fetch live store settings from the backend
 */
export async function getSettingsApi() {
  const response = await apiClient.get('/settings');
  return response?.data?.settings || response?.settings || {};
}

/**
 * Update store settings (requires staff authentication)
 */
export async function updateSettingsApi(payload) {
  const response = await apiClient.put('/settings', payload);
  return response?.data?.settings || response?.settings || response;
}

/**
 * Reset store settings to factory defaults (requires staff authentication)
 */
export async function resetSettingsApi() {
  const response = await apiClient.post('/settings/reset');
  return response?.data?.settings || response?.settings || response;
}

export default {
  getSettingsApi,
  updateSettingsApi,
  resetSettingsApi,
};
