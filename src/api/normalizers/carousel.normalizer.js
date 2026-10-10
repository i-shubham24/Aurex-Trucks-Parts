import { PHOTO } from '../../data/images';

/* Slides whose photo has been replaced by an Aurex-branded one shipped with the site.
   The catalogue still holds the earlier shots for these; once a slide's image is updated
   there, delete its line here and the catalogue image is used again. */
const SLIDE_PHOTO = {
  '/shop/tail-lifts': PHOTO.tailLift,
  '/shop/accessories': PHOTO.fleetAccessories,
};

/**
 * Normalizes backend carousel slide payload into a consistent frontend entity
 */
export function normalizeCarouselSlide(slide) {
  if (!slide) return null;

  const link = slide.buttonLink || slide.href || '/shop';
  const imageUrl = SLIDE_PHOTO[link] || slide.image?.url || slide.img || '';

  return {
    id: slide._id || slide.id || '',
    title: slide.title || '',
    subtitle: slide.subtitle || slide.sub || '',
    sub: slide.subtitle || slide.sub || '',
    eyebrow: slide.eyebrow || slide.badgeText || '',
    buttonText: slide.buttonText || slide.cta || 'Explore Products',
    buttonLink: slide.buttonLink || slide.href || '/shop',
    href: slide.buttonLink || slide.href || '/shop',
    enquiryHref: slide.enquiryHref || slide.enquiryLink || '/tail-lift-enquiry',
    image: {
      url: imageUrl,
      publicId: slide.image?.publicId || '',
    },
    img: imageUrl,
    sortOrder: slide.sortOrder || 0,
    isActive: slide.isActive !== false,
  };
}

export function normalizeCarouselSlides(slides = []) {
  if (!Array.isArray(slides)) return [];
  return slides.map(normalizeCarouselSlide).filter(Boolean);
}

export default normalizeCarouselSlides;
