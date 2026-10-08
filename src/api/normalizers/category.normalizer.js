/**
 * Normalizes backend category payload into a consistent frontend entity
 */
export function normalizeCategory(cat) {
  if (!cat) return null;

  const slug = cat.slug || '';
  const imageUrl = cat.image?.url || '';

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
      publicId: cat.image?.publicId || '',
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
