import { apiClient, getAuthToken, publicGet } from '../client';
import { normalizeProducts, normalizeProduct } from '../normalizers/product.normalizer';

/**
 * Fetch products list with optional filters (category, brand, search, sort, page, limit)
 */
export async function getProductsApi(params = {}) {
  // Credential-free so the CDN can serve it to signed-in shoppers too.
  const response = await publicGet('/products', { params });
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
  const path = `/products/${identifier}`;
  let response;
  try {
    response = await publicGet(path);
  } catch (err) {
    // Unpublished parts are only visible to signed-in staff ("view on storefront" from the
    // admin console), so a 404 gets one retry with credentials when there is a session.
    if (err?.status !== 404 || !getAuthToken()) throw err;
    response = await apiClient.get(path);
  }
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
