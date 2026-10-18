import { useQuery } from '@tanstack/react-query';
import { getCategoriesApi, getCategoryBySlugApi } from '../../api/endpoints/categories.api';
import { persisted, remember } from '../../lib/persisted';

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'],
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'],
  detail: (slug) => [...CATEGORY_QUERY_KEYS.all, 'detail', slug],
};

export const DEFAULT_CATEGORIES = [
  {
    id: 'tail-lifts',
    name: 'Tail Lifts',
    slug: 'tail-lifts',
    count: 6,
    productCount: 6,
    tag: 'Enquiry only',
    blurb: 'Sized for Aussie bodies. 1.5T to 3T aluminium and steel, 24V, full kit included. Custom quote on enquiry.',
    imageUrl: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476378/aurex_truck_parts/categories/TAIL-LIFTS-CAT.jpg',
    image: { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476378/aurex_truck_parts/categories/TAIL-LIFTS-CAT.jpg' }
  },
  {
    id: 'trailer-parts',
    name: 'Trailer Parts',
    slug: 'trailer-parts',
    count: 114,
    productCount: 114,
    tag: 'From $3.40',
    blurb: 'Door gear, hinges, tracks, seals, latches, safety signs and heavy hardware for Aussie trailers.',
    imageUrl: '/images/web/trailer-parts-category.webp',
    image: { url: '/images/web/trailer-parts-category.webp' }
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    count: 16,
    productCount: 16,
    tag: 'From $3.90',
    blurb: 'Rubber buffers, steel toolboxes, chrome wheel nut covers, composite body panels and commercial vehicle accessories.',
    imageUrl: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476759/aurex_truck_parts/categories/ACCESSORIES-CAT.jpg',
    image: { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476759/aurex_truck_parts/categories/ACCESSORIES-CAT.jpg' }
  }
];

/**
 * Custom TanStack Query Hook to fetch categories directly from the backend API
 */
export function useCategories(options = {}) {
  const persistedData = persisted('aurex_cache_categories');
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.lists(),
    queryFn: () => getCategoriesApi().then(remember('aurex_cache_categories')),
    placeholderData: persistedData.initialData || DEFAULT_CATEGORIES,
    staleTime: 1000 * 30, // 30s fresh window while ensuring fast synchronization
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
