import { apiClient } from '../client';
import { normalizeProducts, normalizeProduct } from '../normalizers/product.normalizer';

/**
 * Fetch products list with optional filters (category, brand, search, sort, page, limit)
 */
export async function getProductsApi(params = {}) {
  const response = await apiClient.get('/products', { params });
  const rawProducts = response?.data?.products || response?.products || response?.items || [];
  const pagination = response?.data?.pagination || response?.pagination || {};

  return {
    products: normalizeProducts(rawProducts),
    pagination,
    total: pagination.total || rawProducts.length,
  };
}

/**
 * Fetch a single product by SKU or slug
 */
export async function getProductBySkuApi(identifier) {
  if (!identifier) throw new Error('Product SKU or slug is required');
  const response = await apiClient.get(`/products/${identifier}`);
  const rawProduct = response?.data?.product || response?.product || response?.item;
  const relatedProducts = response?.data?.relatedProducts || [];

  return {
    product: normalizeProduct(rawProduct),
    relatedProducts: normalizeProducts(relatedProducts),
  };
}

export default {
  getProductsApi,
  getProductBySkuApi,
};
