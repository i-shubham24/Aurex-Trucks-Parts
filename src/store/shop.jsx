import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "../data/catalog.js";

const lookup = (sku) => {
  try {
    const raw = localStorage.getItem("aurex_products_v4");
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
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [enquirySku, setEnquirySku] = useState(null);
  const [compare, setCompare] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const a = JSON.parse(localStorage.getItem("aurex_wishlist_v1") || "[]");
      return Array.isArray(a) ? a : [];
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("aurex_wishlist_v1", JSON.stringify(wishlist)); } catch { /* noop */ }
  }, [wishlist]);
  const toggleCompare = (sku) => setCompare((c) => (c.includes(sku) ? c.filter((x) => x !== sku) : [...c, sku].slice(-3)));
  const add = (sku, qty = 1) => {
    const p = lookup(sku);
    if (!p || p.price == null) { setEnquirySku(sku); return; } // Enquire-only lines never enter the cart
    setCart((c) => {
      const f = c.find((i) => i.sku === sku);
      if (f) return c.map((i) => (i.sku === sku ? { ...i, qty: i.qty + qty } : i));
      return [...c, { ...p, qty }];
    });
    setDrawer(true);
  };

  const updateQuantity = (sku, qty) => {
    setCart((c) => {
      if (qty <= 0) return c.filter((i) => i.sku !== sku);
      return c.map((i) => (i.sku === sku ? { ...i, qty } : i));
    });
  };

  const remove = (sku) => {
    setCart((c) => c.filter((i) => i.sku !== sku));
  };
  const value = useMemo(() => ({
    cart, setCart, wishlist, setWishlist, query, setQuery, drawer, setDrawer, add,
    enquirySku, setEnquirySku, compare, setCompare, toggleCompare, updateQuantity, remove,
    total: cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0),
    count: cart.reduce((s, i) => s + i.qty, 0),
  }), [cart, wishlist, query, drawer, enquirySku, compare]);
  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}
export const useShop = () => useContext(ShopCtx);
