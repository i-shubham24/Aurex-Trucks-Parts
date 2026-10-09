import { useQuery } from '@tanstack/react-query';
import { getCategoriesApi, getCategoryBySlugApi } from '../../api/endpoints/categories.api';
import { persisted, remember } from '../../lib/persisted';

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'],
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'],
  detail: (slug) => [...CATEGORY_QUERY_KEYS.all, 'detail', slug],
};

/**
 * Custom TanStack Query Hook to fetch categories directly from the backend API
 */
export function useCategories(options = {}) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.lists(),
    queryFn: () => getCategoriesApi().then(remember('aurex_cache_categories')),
    ...persisted('aurex_cache_categories'),
    staleTime: 1000 * 60 * 5, // 5 mins fresh
    ...options,
  });
}

/**
 * Custom TanStack Query Hook to fetch a single category by slug directly from the backend API
 */
export function useCategory(slug, options = {}) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(slug),
    queryFn: () => getCategoryBySlugApi(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export default useCategories;
