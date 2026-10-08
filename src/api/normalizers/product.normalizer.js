/**
 * Normalizes backend product payload into a consistent frontend entity
 */
export function normalizeProduct(p) {
  if (!p) return null;

  const sku = p.sku ? p.sku.toUpperCase() : '';
  const isEnquiry = p.pricing?.isPOA === true || p.price === null || p.pricing?.sellingPrice === 0;
  const sellingPrice = isEnquiry ? null : (p.pricing?.sellingPrice ?? p.price ?? 0);
  const categorySlug = p.categorySlug || (typeof p.category === 'object' ? p.category?.slug : p.category) || '';

  const imageUrl = p.images?.[0]?.url || p.imageUrl || '';

  return {
    id: p._id || p.id || sku,
    _id: p._id || p.id || sku,
    sku,
    name: p.name || '',
    category: categorySlug,
    categorySlug,
    categoryName: typeof p.category === 'object' ? p.category?.name : '',
    sub: p.sub || '',
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
    badge: p.badge || (p.badges?.[0]?.label) || '',
    fit: p.fit || '',
    oem: p.oem || p.oemPartNumber || '',
    oemPartNumber: p.oemPartNumber || p.oem || '',
    status: p.stockStatus || 'In stock VIC',
    stockStatus: p.stockStatus || 'In stock VIC',
    lead: p.lead || 'Ships in 24 hrs',
    desc: p.description || p.desc || p.name || '',
    description: p.description || p.desc || p.name || '',
    shortDescription: p.shortDescription || p.desc || '',
    specs: p.specs || {},
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [{ url: imageUrl, publicId: sku }],
    imageUrl,
    inventory: p.inventory || { stock: 12 },
    isFeatured: Boolean(p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller),
  };
}

export function normalizeProducts(products = []) {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeProduct).filter(Boolean);
}

export default normalizeProducts;
