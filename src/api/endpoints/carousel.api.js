import { apiClient } from '../client';
import { normalizeCarouselSlides } from '../normalizers/carousel.normalizer';

/**
 * Fetch all active carousel slides from backend using Axios
 */
export async function getCarouselSlidesApi() {
  const response = await apiClient.get('/carousel');
  const rawList = response?.data?.slides || response?.slides || response?.items || [];
  return normalizeCarouselSlides(rawList);
}

export default {
  getCarouselSlidesApi,
};
