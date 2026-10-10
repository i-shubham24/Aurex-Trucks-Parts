/**
 * Normalizes backend product payload into a consistent frontend entity
 */
export function normalizeProduct(p) {
  if (!p) return null;

  const sku = p.sku ? p.sku.toUpperCase() : '';
  const isEnquiry = p.pricing?.isPOA === true || p.price === null || p.pricing?.sellingPrice === 0;
  const sellingPrice = isEnquiry ? null : (p.pricing?.sellingPrice ?? p.price ?? 0);
  const categorySlug = p.categorySlug || (typeof p.category === 'object' ? p.category?.slug : p.category) || '';

  const firstImg = Array.isArray(p.images) && p.images[0]
    ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
    : null;
  const imageUrl = p.imageUrl || firstImg || p.image || '';

  return {
    id: p._id || p.id || sku,
    _id: p._id || p.id || sku,
    sku,
    name: p.name || '',
    category: categorySlug,
    categorySlug,
    categoryName: typeof p.category === 'object' ? p.category?.name : '',
    sub: p.sub || p.subCategory || '',
    price: sellingPrice,
    pricing: p.pricing || {
      mrp: sellingPrice || 0,
      sellingPrice: sellingPrice || 0,
      tradePrice: p.pricing?.tradePrice || 0,
      isPOA: isEnquiry,
    },
    brand: typeof p.brand === 'object' ? p.brand?.name : (p.brandName || p.brand || 'Aurex'),
    brandName: typeof p.brand === 'object' ? p.brand?.name : (p.brandName || p.brand || 'Aurex'),
    rating: p.rating || 4.8,
    reviews: p.reviewCount || p.reviews || 0,
    reviewCount: p.reviewCount || p.reviews || 0,
    badge: p.badge || (p.badges?.[0]?.label) || (p.isFeatured ? 'Popular' : ''),
    fit: p.fit || p.fitmentSummary || '',
    oem: p.oem || p.oemPartNumber || '',
    status: p.stockStatus || p.status || 'In stock VIC',
    stockStatus: p.stockStatus || p.status || 'In stock VIC',
    publicationStatus: p.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
    isVisible: p.isVisible !== undefined ? Boolean(p.isVisible) : (p.status !== 'DRAFT' && p.status !== 'ARCHIVED'),
    isPublished: p.isPublished !== undefined ? Boolean(p.isPublished) : (p.status !== 'DRAFT' && p.status !== 'ARCHIVED'),
    lead: p.lead || (p.leadTimeDays ? `${p.leadTimeDays} days` : 'Ships in 24 hrs'),
    desc: p.description || p.desc || p.name || '',
    description: p.description || p.desc || p.name || '',
    shortDescription: p.shortDescription || p.desc || '',
    specs: (p.specs && typeof p.specs === 'object') ? p.specs : (p.technicalSpecifications || {}),
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (imageUrl ? [{ url: imageUrl, publicId: sku }] : []),
    imageUrl,
    inventory: p.inventory || { stock: 15 },
    isFeatured: Boolean(p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller),
  };
}

export function normalizeProducts(products = []) {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeProduct).filter(Boolean);
}

export default normalizeProducts;
