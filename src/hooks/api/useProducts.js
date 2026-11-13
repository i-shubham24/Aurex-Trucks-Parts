import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProductsApi, getProductBySkuApi } from '../../api/endpoints/products.api';
import { persisted, remember } from '../../lib/persisted';

export const PRODUCT_QUERY_KEYS = {
  all: ['products'],
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'],
  list: (params) => [...PRODUCT_QUERY_KEYS.lists(), params],
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'],
  detail: (identifier) => [...PRODUCT_QUERY_KEYS.details(), (identifier || '').toLowerCase()],
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

/* The full shop catalogue (Shop with no category, compare tray). */
export const SHOP_CATALOGUE_PARAMS = { limit: 500 };

const productsListQuery = (params) => {
  const isSearch = Boolean(params.search && params.search.length > 0);
  const cacheKey = !isSearch ? getCacheKey(params) : null;
  return {
    cacheKey,
    queryKey: PRODUCT_QUERY_KEYS.list(params),
    queryFn: () => {
      const promise = getProductsApi(params);
      return cacheKey ? promise.then(remember(cacheKey)) : promise;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh in memory; back navigation is 0ms instant
    gcTime: 1000 * 60 * 30, // Keep in memory for 30 minutes
  };
};

/**
 * Start loading the shop catalogue at app boot, in parallel with the route chunks,
 * so /shop has its products by the time the page mounts. Same key and fetcher as
 * useProducts(SHOP_CATALOGUE_PARAMS), so the page just picks the result up.
 */
export function prefetchShopCatalogue(queryClient) {
  const { queryKey, queryFn, staleTime, gcTime } = productsListQuery(SHOP_CATALOGUE_PARAMS);
  return queryClient.prefetchQuery({ queryKey, queryFn, staleTime, gcTime });
}

/**
 * Custom TanStack Query hook to fetch products list with filters and caching
 */
export function useProducts(params = {}, options = {}) {
  const { cacheKey, ...query } = productsListQuery(params);
  // Parse the stored copy once per key, not on every render (the catalogue is ~500 rows).
  const persistedData = useMemo(() => (cacheKey ? persisted(cacheKey) : {}), [cacheKey]);

  return useQuery({
    ...query,
    placeholderData: (prev) => prev || persistedData.initialData,
    ...options,
  });
}

/**
 * Custom TanStack Query hook to fetch a single product by SKU or slug with instant client-cache fallback
 */
export function useProduct(identifier, options = {}) {
  const queryClient = useQueryClient();
  const rawId = String(identifier || '').trim();
  const normalizedKey = rawId.toLowerCase();
  const cacheKey = normalizedKey ? `aurex_cache_prod_${normalizedKey}` : null;
  const persistedData = useMemo(() => (cacheKey ? persisted(cacheKey) : {}), [cacheKey]);

  const getCachedProduct = () => {
    if (!rawId) return undefined;
    const existing = queryClient.getQueryData(PRODUCT_QUERY_KEYS.detail(normalizedKey));
    if (existing?.product) return existing;
    if (existing && !existing.product) return { product: existing, relatedProducts: [] };

    // Search across list queries (shop, category, home)
    const queries = queryClient.getQueriesData({ queryKey: PRODUCT_QUERY_KEYS.lists() });
    for (const [, queryData] of queries) {
      const list = queryData?.products || (Array.isArray(queryData) ? queryData : []);
      const found = list.find(
        (p) => (p.sku || '').toUpperCase() === rawId.toUpperCase() ||
               (p.slug || '').toLowerCase() === normalizedKey
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
    queryKey: PRODUCT_QUERY_KEYS.detail(normalizedKey),
    queryFn: () => {
      const promise = getProductBySkuApi(rawId);
      return cacheKey ? promise.then(remember(cacheKey)) : promise;
    },
    enabled: Boolean(rawId),
    placeholderData: () => getCachedProduct(),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30,
    retry: (failures, err) => err?.status !== 404 && failures < 2,
    retryDelay: (attempt) => 600 * (attempt + 1),
    ...options,
  });
}

export default useProducts;
