import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS as SEED } from "../data/catalog.js";
import { deriveFitment } from "../data/fitment.js";

const KEY = "aurex_products_v1";
const Ctx = createContext(null);

// Older saved catalogues predate the fitment field, so backfill it from the product text.
const withFitment = (p) => (p.fitment ? p : { ...p, fitment: deriveFitment(p) });

const DKEY = "aurex_products_deleted_v1";
const readDeleted = () => { try { const a = JSON.parse(localStorage.getItem(DKEY) || "[]"); return new Set(Array.isArray(a) ? a : []); } catch { return new Set(); } };

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return SEED;
    const gone = readDeleted();
    const kept = arr.filter((p) => !gone.has(p.sku));
    const seen = new Map(kept.map((p) => [p.sku, p]));
    const merged = [...kept];
    // New seed lines appear automatically. Deleted lines stay deleted because
    // their SKUs are recorded separately and skipped here.
    SEED.forEach((s) => { if (!seen.has(s.sku) && !gone.has(s.sku)) merged.push(s); });
    // Refreshed seed images (local white-background shots) flow through to any
    // product whose image was never hand picked in admin (no imgCustom flag).
    const seedBySku = new Map(SEED.map((s) => [s.sku, s]));
    const final = merged.map((p) => {
      const s = seedBySku.get(p.sku);
      const base = s && !p.imgCustom ? { ...p, image: s.image } : p;
      return withFitment(base);
    });
    try { localStorage.setItem(KEY, JSON.stringify(final)); } catch { /* noop */ }
    return final;
  } catch { return SEED; }
};

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(products)); } catch { /* noop */ } }, [products]);

  const addProduct = (p) => {
    const sku = (p.sku || "").trim().toUpperCase();
    if (!sku) return { ok: false, msg: "SKU is required." };
    if (products.some((x) => x.sku === sku)) return { ok: false, msg: "SKU already exists." };
    const built = { ...p, sku, rating: Number(p.rating) || 4.5, reviews: Number(p.reviews) || 0, price: Number(p.price) || 0, oldPrice: p.oldPrice ? Number(p.oldPrice) : null };
    setProducts((list) => [{ ...built, fitment: deriveFitment(built) }, ...list]);
    return { ok: true };
  };
  const updateProduct = (sku, patch) => setProducts((list) => list.map((x) => (x.sku === sku ? { ...x, ...patch } : x)));
  const deleteProduct = (sku) => {
    try {
      const gone = readDeleted();
      gone.add(sku);
      localStorage.setItem(DKEY, JSON.stringify([...gone]));
    } catch { /* noop */ }
    setProducts((list) => list.filter((x) => x.sku !== sku));
  };
  const resetCatalog = () => {
    try { localStorage.removeItem(DKEY); } catch { /* noop */ }
    setProducts(SEED);
  };

  const value = useMemo(() => ({ products, setProducts, addProduct, updateProduct, deleteProduct, resetCatalog }), [products]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useProducts = () => useContext(Ctx);
