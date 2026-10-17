const CANONICAL_CATEGORY_IMAGES = {
  'trailer-parts': '/images/web/trailer-parts-category.webp',
  'tail-lifts': '/images/web/aurex-tail-lift.webp',
  'accessories': '/images/web/aurex-fleet-accessories.webp',
};

/**
 * Normalizes backend category payload into a consistent frontend entity
 */
export function normalizeCategory(cat) {
  if (!cat) return null;

  const slug = cat.slug || '';
  const rawUrl = (typeof cat.image === 'string' ? cat.image : cat.image?.url) || cat.imageUrl || '';
  
  // Ensure trailer-parts always displays the new clean trailer rear door image
  let imageUrl = rawUrl;
  if (slug === 'trailer-parts' && (!rawUrl || rawUrl.includes('TRAILER-PARTS-CAT'))) {
    imageUrl = CANONICAL_CATEGORY_IMAGES['trailer-parts'];
  } else if (!imageUrl && CANONICAL_CATEGORY_IMAGES[slug]) {
    imageUrl = CANONICAL_CATEGORY_IMAGES[slug];
  }

  return {
    id: cat._id || cat.id || slug,
    name: cat.name || '',
    slug: slug,
    code: cat.code || '',
    tag: cat.tag || '',
    blurb: cat.blurb || cat.description || '',
    count: cat.productCount !== undefined ? cat.productCount : (cat.count || 0),
    productCount: cat.productCount !== undefined ? cat.productCount : (cat.count || 0),
    image: {
      url: imageUrl,
      publicId: cat.image?.publicId || slug,
    },
    imageUrl: imageUrl,
    sortOrder: cat.sortOrder || 0,
    isFeatured: Boolean(cat.isFeatured),
  };
}

export function normalizeCategories(categories = []) {
  if (!Array.isArray(categories)) return [];
  return categories.map(normalizeCategory).filter(Boolean);
}

export default normalizeCategories;
