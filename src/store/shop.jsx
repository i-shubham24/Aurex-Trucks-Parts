import { createContext, useContext, useMemo, useState } from "react";
import { PRODUCTS } from "../data/catalog.js";

const lookup = (sku) => {
  try {
    const raw = localStorage.getItem("aurex_products_v1");
    if (raw) {
      const arr = JSON.parse(raw);
      const f = arr.find((x) => x.sku === sku);
      if (f) return f;
    }
  } catch { /* noop */ }
  return PRODUCTS.find((x) => x.sku === sku);
};

const ShopCtx = createContext(null);
export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [enquirySku, setEnquirySku] = useState(null);
  const [compare, setCompare] = useState([]);
  const toggleCompare = (sku) => setCompare((c) => (c.includes(sku) ? c.filter((x) => x !== sku) : [...c, sku].slice(-3)));
  const add = (sku, qty = 1) => {
    setCart((c) => {
      const f = c.find((i) => i.sku === sku);
      if (f) return c.map((i) => (i.sku === sku ? { ...i, qty: i.qty + qty } : i));
      const p = lookup(sku);
      if (!p) return c;
      return [...c, { ...p, qty }];
    });
    setDrawer(true);
  };
  const value = useMemo(() => ({
    cart, setCart, wishlist, setWishlist, query, setQuery, drawer, setDrawer, add,
    enquirySku, setEnquirySku, compare, setCompare, toggleCompare,
    total: cart.reduce((s, i) => s + i.price * i.qty, 0),
    count: cart.reduce((s, i) => s + i.qty, 0),
  }), [cart, wishlist, query, drawer, enquirySku, compare]);
  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}
export const useShop = () => useContext(ShopCtx);
