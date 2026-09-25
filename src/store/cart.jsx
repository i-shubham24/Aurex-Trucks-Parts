import { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [open, setOpen] = useState(false);
  const [compare, setCompare] = useState([]);

  /* Silent add: updates lines + header badge only. Nothing opens;
     the shopper opens the cart when ready via the header button. */
  const add = (product, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.sku === product.sku);
      if (found) return prev.map((l) => (l.sku === product.sku ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
      return [...prev, { sku: product.sku, name: product.name, price: product.price, qty }];
    });
  };
  const setQty = (sku, qty) => setLines((prev) => qty <= 0 ? prev.filter((l) => l.sku !== sku) : prev.map((l) => (l.sku === sku ? { ...l, qty: Math.min(99, qty) } : l)));
  const remove = (sku) => setLines((prev) => prev.filter((l) => l.sku !== sku));
  const clear = () => setLines([]);
  const toggleCompare = (sku) => setCompare((c) => (c.includes(sku) ? c.filter((x) => x !== sku) : [...c, sku].slice(-3)));
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
