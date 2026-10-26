/**
 * Mirror of truck-parts-api/src/utils/pricing.js (calculateOrderTotals), so the totals
 * shown at checkout are the ones the server will charge. Keep the two in step.
 *
 * Differences from the server: no coupon (the storefront doesn't send one), and the
 * freight method is the storefront's label ("Standard road", "Express priority",
 * "Click and Collect VIC").
 */
const round2 = (n) => Math.round(n * 100) / 100;

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES_REP", "WAREHOUSE_MANAGER"];

/* The server only applies a trade discount to approved trade customers (never staff). */
export const tradeDiscountFor = (user) =>
  user && user.isTradeApproved && !STAFF_ROLES.includes(user.role)
    ? Number(user.tradeDiscountPercent) || 0
    : 0;

export function calculateOrderTotals({ lines = [], shippingMethod = "", tradeDiscountPercent = 0, settings = {} }) {
  let subtotal = 0;
  let totalCoreDeposit = 0;
  for (const l of lines) {
    const qty = Number(l.qty ?? l.quantity) || 1;
    subtotal += (Number(l.price) || 0) * qty;
    totalCoreDeposit += (Number(l.coreDeposit) || 0) * qty;
  }

  const tradeDiscountAmount = tradeDiscountPercent > 0 ? round2(subtotal * (tradeDiscountPercent / 100)) : 0;
  const totalDiscount = round2(tradeDiscountAmount);
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);

  // Free freight is tested on the discounted subtotal, as the server does.
  const freeFreightOver = Number(settings.freeFreightOver) || 200;
  const standardFee = Number(settings.standardFee) || 24;
  const expressFee = Number(settings.expressFee) || 39;
  const method = String(shippingMethod || "").toLowerCase();
  let shippingFee;
  if (method.includes("click") || method.includes("collect") || method.includes("pickup")) shippingFee = 0;
  else if (method.includes("express")) shippingFee = expressFee;
  else shippingFee = discountedSubtotal >= freeFreightOver ? 0 : standardFee;
  shippingFee = round2(shippingFee);

  return {
    subtotal: round2(subtotal),
    tradeDiscountAmount,
    totalDiscount,
    discountedSubtotal: round2(discountedSubtotal),
    totalCoreDeposit: round2(totalCoreDeposit),
    shippingFee,
    tax: round2((discountedSubtotal + shippingFee) / 11),
    grandTotal: round2(discountedSubtotal + shippingFee + totalCoreDeposit),
  };
}
