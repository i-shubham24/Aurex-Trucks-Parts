import { useQuery } from '@tanstack/react-query';
import { getCarouselSlidesApi } from '../../api/endpoints/carousel.api';
import { persisted, remember } from '../../lib/persisted';

export const CAROUSEL_QUERY_KEYS = {
  all: ['carousel'],
  slides: () => [...CAROUSEL_QUERY_KEYS.all, 'slides'],
};

/**
 * Custom TanStack Query Hook to fetch hero carousel slides with caching
 */
export function useCarousel(options = {}) {
  return useQuery({
    queryKey: CAROUSEL_QUERY_KEYS.slides(),
    queryFn: () => getCarouselSlidesApi().then(remember('aurex_cache_carousel_v2')),
    ...persisted('aurex_cache_carousel_v2'),
    staleTime: 1000 * 60 * 5, // 5 mins cache
    ...options,
  });
}

export default useCarousel;
