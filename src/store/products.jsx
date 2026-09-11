import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS as SEED } from "../data/catalog.js";

const KEY = "aurex_products_v1";
const Ctx = createContext(null);

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return SEED;
    const seen = new Map(arr.map((p) => [p.sku, p]));
    const merged = [...arr];
    SEED.forEach((s) => { if (!seen.has(s.sku)) merged.push(s); });
    return merged;
  } catch { return SEED; }
};

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(products)); } catch { /* noop */ } }, [products]);

  const addProduct = (p) => {
    const sku = (p.sku || "").trim().toUpperCase();
    if (!sku) return { ok: false, msg: "SKU is required." };
    if (products.some((x) => x.sku === sku)) return { ok: false, msg: "SKU already exists." };
    setProducts((list) => [{ ...p, sku, rating: Number(p.rating) || 4.5, reviews: Number(p.reviews) || 0, price: Number(p.price) || 0, oldPrice: p.oldPrice ? Number(p.oldPrice) : null }, ...list]);
    return { ok: true };
  };
  const updateProduct = (sku, patch) => setProducts((list) => list.map((x) => (x.sku === sku ? { ...x, ...patch } : x)));
  const deleteProduct = (sku) => setProducts((list) => list.filter((x) => x.sku !== sku));
  const resetCatalog = () => setProducts(SEED);

  const value = useMemo(() => ({ products, setProducts, addProduct, updateProduct, deleteProduct, resetCatalog }), [products]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useProducts = () => useContext(Ctx);
