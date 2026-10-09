import { useQuery } from '@tanstack/react-query';
import { getProductsApi, getProductBySkuApi } from '../../api/endpoints/products.api';

export const PRODUCT_QUERY_KEYS = {
  all: ['products'],
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'],
  list: (params) => [...PRODUCT_QUERY_KEYS.lists(), params],
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'],
  detail: (sku) => [...PRODUCT_QUERY_KEYS.details(), sku],
};

/**
 * Custom TanStack Query hook to fetch products list with filters and caching
 */
export function useProducts(params = {}, options = {}) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(params),
    queryFn: () => getProductsApi(params),
    staleTime: 1000 * 60 * 5, // 5 mins cache
    ...options,
  });
}

/**
 * Custom TanStack Query hook to fetch a single product by SKU
 */
export function useProduct(sku, options = {}) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(sku),
    queryFn: () => getProductBySkuApi(sku),
    enabled: Boolean(sku),
    staleTime: 1000 * 60 * 5,
    retry: (failures, err) => err?.status !== 404 && failures < 2,
    retryDelay: (attempt) => 600 * (attempt + 1),
    ...options,
  });
}

export default useProducts;
