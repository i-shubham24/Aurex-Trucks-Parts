import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNotification } from "./notification";

const CartCtx = createContext(null);
const CART_KEY = "aurex_cart_v1";

const readCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(saved) ? saved.filter((l) => l && l.sku && typeof l.price === "number" && l.qty > 0) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [lines, setLines] = useState(readCart);
  // A refresh, or coming back tomorrow, should not empty the cart.
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch { /* private mode */ }
  }, [lines]);
  const [open, setOpen] = useState(false);
  const [compare, setCompare] = useState([]);
  const { notify } = useNotification();

  const add = (product, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.sku === product.sku);
      if (found) return prev.map((l) => (l.sku === product.sku ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
      return [...prev, { sku: product.sku, name: product.name, price: product.price, qty }];
    });
    notify.cart(product, qty, () => setOpen(true));
  };
  const setQty = (sku, qty) => setLines((prev) => qty <= 0 ? prev.filter((l) => l.sku !== sku) : prev.map((l) => (l.sku === sku ? { ...l, qty: Math.min(99, qty) } : l)));
  const remove = (sku) => setLines((prev) => prev.filter((l) => l.sku !== sku));
  const clear = () => setLines([]);
  const toggleCompare = (sku) => {
    setCompare((c) => {
      const exists = c.includes(sku);
      if (exists) return c.filter((x) => x !== sku);
      return [...c, sku].slice(-3);
    });

    if (!compare.includes(sku)) {
      notify.success({
        kicker: "COMPARISON UPDATED",
        title: "Added to Compare",
        message: `Part ${sku} added to comparison list.`,
        icon: "tag",
        sound: true,
      });
    }
  };
  const clearCompare = () => setCompare([]);
  const total = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines]);
  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  return <CartCtx.Provider value={{ lines, add, setQty, remove, clear, total, count, open, setOpen, compare, toggleCompare, clearCompare }}>{children}</CartCtx.Provider>;
}

const cartFallback = {
  lines: [], total: 0, count: 0, open: false, compare: [],
  add: () => {}, setQty: () => {}, remove: () => {}, clear: () => {},
  setOpen: () => {}, toggleCompare: () => {}, clearCompare: () => {},
};

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx && import.meta.env?.DEV) console.error("[cart] useCart rendered without CartProvider.");
  return ctx ?? cartFallback;
};
