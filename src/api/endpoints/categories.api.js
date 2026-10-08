import { apiClient } from '../client';
import { normalizeCategories, normalizeCategory } from '../normalizers/category.normalizer';

/**
 * Fetch all active categories from backend using Axios
 */
export async function getCategoriesApi() {
  const response = await apiClient.get('/categories');
  const rawList = response?.data?.categories || response?.categories || response?.items || [];
  return normalizeCategories(rawList);
}

/**
 * Fetch single category by slug using Axios
 */
export async function getCategoryBySlugApi(slug) {
  if (!slug) throw new Error('Category slug is required');
  const response = await apiClient.get(`/categories/${slug}`);
  const rawCategory = response?.data?.category || response?.category;
  return normalizeCategory(rawCategory);
}

export default {
  getCategoriesApi,
  getCategoryBySlugApi,
};
