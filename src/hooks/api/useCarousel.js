import { useQuery } from '@tanstack/react-query';
import { getCarouselSlidesApi } from '../../api/endpoints/carousel.api';
import { persisted, remember } from '../../lib/persisted';

export const CAROUSEL_QUERY_KEYS = {
  all: ['carousel'],
  slides: () => [...CAROUSEL_QUERY_KEYS.all, 'slides'],
};

export const DEFAULT_CAROUSEL_SLIDES = [
  {
    id: 'default-tail-lift',
    title: 'Tail Lifts & Components',
    subtitle: 'High capacity, reliable tail lifts built for demanding transport fleets.',
    sub: 'High capacity, reliable tail lifts built for demanding transport fleets.',
    buttonText: 'Explore Tail Lifts',
    buttonLink: '/shop/tail-lifts',
    href: '/shop/tail-lifts',
    enquiryHref: '/tail-lift-enquiry',
    image: { url: '/images/web/aurex-tail-lift.webp' },
    img: '/images/web/aurex-tail-lift.webp',
  },
  {
    id: 'default-trailer-parts',
    title: 'Trailer Parts & Hardware',
    subtitle: 'Heavy-duty commercial trailer door gear, cam locks, hinges and hardware.',
    sub: 'Heavy-duty commercial trailer door gear, cam locks, hinges and hardware.',
    buttonText: 'Explore Trailer Parts',
    buttonLink: '/shop/trailer-parts',
    href: '/shop/trailer-parts',
    enquiryHref: '/tail-lift-enquiry',
    image: { url: '/images/web/hero-trailer-parts-yellow.webp' },
    img: '/images/web/hero-trailer-parts-yellow.webp',
  },
  {
    id: 'default-accessories',
    title: 'Fleet Accessories',
    subtitle: 'Safety gear, load restraint systems and workshop consumables for transport.',
    sub: 'Safety gear, load restraint systems and workshop consumables for transport.',
    buttonText: 'Explore Accessories',
    buttonLink: '/shop/accessories',
    href: '/shop/accessories',
    enquiryHref: '/tail-lift-enquiry',
    image: { url: '/images/web/aurex-fleet-accessories.webp' },
    img: '/images/web/aurex-fleet-accessories.webp',
  },
];

/**
 * Custom TanStack Query Hook to fetch hero carousel slides with caching
 */
export function useCarousel(options = {}) {
  const persistedData = persisted('aurex_cache_carousel_v2');
  return useQuery({
    queryKey: CAROUSEL_QUERY_KEYS.slides(),
    queryFn: () => getCarouselSlidesApi().then(remember('aurex_cache_carousel_v2')),
    placeholderData: persistedData.initialData || DEFAULT_CAROUSEL_SLIDES,
    staleTime: 1000 * 60, // 1 min cache
    ...options,
  });
}

export default useCarousel;

