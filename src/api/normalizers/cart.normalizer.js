/**
 * Normalizes backend cart item payload into consistent storefront cart line
 */
export function normalizeCartLine(item) {
  if (!item) return null;
  const prod = typeof item.product === 'object' && item.product ? item.product : {};
  const sku = (prod.sku || item.sku || '').toUpperCase();
  const name = prod.name || item.name || sku;
  const price = typeof item.priceSnapshot === 'number'
    ? item.priceSnapshot
    : (prod.pricing?.sellingPrice ?? item.price ?? 0);
  const qty = item.quantity ?? item.qty ?? 1;

  let image = null;
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    const first = prod.images[0];
    image = typeof first === 'string' ? first : (first?.url || null);
  } else if (prod.imageUrl) {
    image = prod.imageUrl;
  } else if (item.image) {
    image = item.image;
  }

  return {
    id: item._id || sku,
    itemId: item._id || sku,
    productId: prod._id || item.product || sku,
    sku,
    name,
    price,
    qty,
    quantity: qty,
    image,
    coreDeposit: item.coreDepositSnapshot || 0,
    weightKg: item.weightKgSnapshot || 1,
    selectedFitment: item.selectedFitment || null,
    maxStock: prod.inventory?.stock,
    rawProduct: prod,
  };
}

/**
 * Normalizes full backend cart payload into storefront state
 */
export function normalizeCart(raw) {
  if (!raw) return { lines: [], subtotal: 0, total: 0, count: 0, totalCoreDeposit: 0, totalWeightKg: 0 };
  const cart = raw?.data?.cart || raw?.cart || raw;
  const rawItems = Array.isArray(cart?.items) ? cart.items : [];
  const lines = rawItems.map(normalizeCartLine).filter(Boolean);

  const subtotal = typeof cart?.subtotal === 'number'
    ? cart.subtotal
    : lines.reduce((acc, l) => acc + l.price * l.qty, 0);

  const totalCount = lines.reduce((acc, l) => acc + l.qty, 0);

  return {
    id: cart?._id,
    sessionId: raw?.data?.sessionId || raw?.sessionId || cart?.sessionId,
    lines,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
    count: totalCount,
    totalCoreDeposit: cart?.totalCoreDeposit || 0,
    totalWeightKg: cart?.totalWeightKg || 0,
    updatedAt: cart?.updatedAt,
  };
}

export default normalizeCart;
