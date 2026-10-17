import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProductsApi, getProductBySkuApi } from '../../api/endpoints/products.api';
import { persisted, remember } from '../../lib/persisted';

export const PRODUCT_QUERY_KEYS = {
  all: ['products'],
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'],
  list: (params) => [...PRODUCT_QUERY_KEYS.lists(), params],
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'],
  detail: (sku) => [...PRODUCT_QUERY_KEYS.details(), (sku || '').toUpperCase()],
};

function getCacheKey(params) {
  try {
    const sorted = Object.keys(params || {})
      .sort()
      .reduce((acc, k) => {
        if (params[k] !== undefined) acc[k] = params[k];
        return acc;
      }, {});
    return `aurex_cache_prods_${JSON.stringify(sorted)}`;
  } catch {
    return 'aurex_cache_prods_default';
  }
}

/**
 * Custom TanStack Query hook to fetch products list with filters and caching
 */
export function useProducts(params = {}, options = {}) {
  const isSearch = Boolean(params.search && params.search.length > 0);
  const cacheKey = !isSearch ? getCacheKey(params) : null;
  const persistedData = cacheKey ? persisted(cacheKey) : {};

  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(params),
    queryFn: () => {
      const promise = getProductsApi(params);
      return cacheKey ? promise.then(remember(cacheKey)) : promise;
    },
    initialData: persistedData.initialData,
    initialDataUpdatedAt: persistedData.initialDataUpdatedAt,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5, // 5 mins cache
    ...options,
  });
}

/**
 * Custom TanStack Query hook to fetch a single product by SKU with instant client-cache fallback
 */
export function useProduct(sku, options = {}) {
  const queryClient = useQueryClient();
  const normalizedSku = (sku || '').toUpperCase();
  const cacheKey = normalizedSku ? `aurex_cache_prod_${normalizedSku.toLowerCase()}` : null;
  const persistedData = cacheKey ? persisted(cacheKey) : {};

  const getCachedProduct = () => {
    if (!normalizedSku) return undefined;
    const existing = queryClient.getQueryData(PRODUCT_QUERY_KEYS.detail(normalizedSku));
    if (existing?.product) return existing;
    if (existing && !existing.product) return { product: existing, relatedProducts: [] };

    // Search across list queries (shop, category, home)
    const queries = queryClient.getQueriesData({ queryKey: PRODUCT_QUERY_KEYS.lists() });
    for (const [, queryData] of queries) {
      const list = queryData?.products || (Array.isArray(queryData) ? queryData : []);
      const found = list.find(
        (p) => (p.sku || '').toUpperCase() === normalizedSku || (p.slug || '').toLowerCase() === (sku || '').toLowerCase()
      );
      if (found) {
        return { product: found, relatedProducts: [] };
      }
    }

    if (persistedData.initialData) {
      const hit = persistedData.initialData;
      return hit.product ? hit : { product: hit, relatedProducts: [] };
    }
    return undefined;
  };

  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(normalizedSku),
    queryFn: () => {
      const promise = getProductBySkuApi(normalizedSku);
      return cacheKey ? promise.then(remember(cacheKey)) : promise;
    },
    enabled: Boolean(normalizedSku),
    placeholderData: () => getCachedProduct(),
    initialData: () => getCachedProduct(),
    initialDataUpdatedAt: persistedData.initialDataUpdatedAt,
    staleTime: 1000 * 60 * 5,
    retry: (failures, err) => err?.status !== 404 && failures < 2,
    retryDelay: (attempt) => 600 * (attempt + 1),
    ...options,
  });
}

export default useProducts;
