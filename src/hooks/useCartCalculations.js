import { useMemo } from "react";
import { useShop } from "../store/shop.jsx";
import { useAuth } from "../store/auth.jsx";
import { useSite } from "../store/site.jsx";

export function useCartCalculations() {
  const { cart } = useShop();
  const { user } = useAuth();
  const { settings } = useSite();

  const calculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0;
      return sum + (price * item.qty);
    }, 0);

    const discount = user?.isTradeAccount ? subtotal * 0.05 : 0; // 5% trade discount
    const discountedSubtotal = subtotal - discount;

    const shipping = subtotal >= (settings?.freeFreightOver || 500) ? 0 : (settings?.standardFee || 24);
    const tax = discountedSubtotal * 0.1; // 10% GST
    const total = discountedSubtotal + shipping + tax;

    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    return {
      subtotal,
      discount,
      discountedSubtotal,
      shipping,
      tax,
      total,
      itemCount,
      qualifiesForFreeShipping: subtotal >= (settings?.freeFreightOver || 500),
      tradeDiscountApplied: user?.isTradeAccount
    };
  }, [cart, user, settings]);

  const getShippingEstimate = (postcode) => {
    // In production, this would call a shipping API
    // For now, we'll return a simple estimate
    const regionalPostcodes = ["2", "3", "4", "5", "6", "7"];
    const isRegional = regionalPostcodes.some(code => postcode?.startsWith(code));
    
    if (calculations.qualifiesForFreeShipping) return 0;
    if (isRegional) return settings?.expressFee || 39;
    return settings?.standardFee || 24;
  };

  const applyPromoCode = (code) => {
    // In production, this would validate against a promo API
    const promoCodes = {
      "AUREX35": { discount: 0.35, type: "percentage" },
      "BRAKE10": { discount: 0.10, type: "percentage" },
      "FLEET5": { discount: 0.05, type: "percentage" },
    };

    const promo = promoCodes[code.toUpperCase()];
    if (!promo) return { valid: false, message: "Invalid promo code" };

    let discountAmount = 0;
    if (promo.type === "percentage") {
      discountAmount = calculations.subtotal * promo.discount;
    }

    return {
      valid: true,
      discountAmount,
      message: `Promo code applied: ${code.toUpperCase()}`
    };
  };

  return {
    ...calculations,
    getShippingEstimate,
    applyPromoCode
  };
}