import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS as SEED_PRODUCTS, CATEGORIES as SEED_CATS } from "../data/products";

const Ctx = createContext(null);
const K = "aurex_catalog_v1"; // { updated:{sku:patch}, added:[product], deleted:[sku], cats:[...]|null }

const read = () => { try { const v = localStorage.getItem(K); return v ? JSON.parse(v) : null; } catch { return null; } };
const blank = () => ({ updated: {}, added: [], deleted: [], cats: null });

export function CatalogProvider({ children }) {
  const [ov, setOv] = useState(() => read() || blank());
  useEffect(() => { try { localStorage.setItem(K, JSON.stringify(ov)); } catch { /* private mode */ } }, [ov]);

  const products = useMemo(() => {
    const list = SEED_PRODUCTS.filter((p) => !ov.deleted.includes(p.sku))
      .map((p) => (ov.updated[p.sku] ? { ...p, ...ov.updated[p.sku] } : p));
    return [...list, ...ov.added];
  }, [ov]);

  const categories = useMemo(() => {
    const base = ov.cats || SEED_CATS;
    return base.map((c) => ({ ...c, count: products.filter((p) => p.category === c.slug).length }));
  }, [ov, products]);

  const addProduct = (p) => {
    if (!p.sku.trim() || !p.name.trim()) return { ok: false, msg: "SKU and name are required." };
    const sku = p.sku.trim().toUpperCase();
    if (products.some((x) => x.sku === sku)) return { ok: false, msg: "That SKU already exists." };
    setOv((o) => ({ ...o, added: [...o.added, { ...p, sku }] }));
    return { ok: true };
  };
  const updateProduct = (sku, patch) => {
    const seed = SEED_PRODUCTS.find((p) => p.sku === sku);
    setOv((o) => {
      if (seed) return { ...o, updated: { ...o.updated, [sku]: { ...(o.updated[sku] || {}), ...patch } } };
      return { ...o, added: o.added.map((p) => (p.sku === sku ? { ...p, ...patch } : p)) };
    });
  };
  const deleteProduct = (sku) => {
    const seed = SEED_PRODUCTS.some((p) => p.sku === sku);
    setOv((o) => ({
      ...o,
      added: o.added.filter((p) => p.sku !== sku),
      deleted: seed ? [...o.deleted, sku] : o.deleted,
      updated: Object.fromEntries(Object.entries(o.updated).filter(([k]) => k !== sku)),
    }));
  };
  const resetCatalog = () => setOv(blank());

  const updateCategory = (slug, patch) => setOv((o) => {
    const base = o.cats || SEED_CATS;
    return { ...o, cats: base.map((c) => (c.slug === slug ? { ...c, ...patch } : c)) };
  });
  const addCategory = (c) => {
    const slug = c.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!c.name.trim() || !slug) return { ok: false, msg: "Name required and must be unique." };
    const base = ov.cats || SEED_CATS;
    if (base.some((x) => x.slug === slug)) return { ok: false, msg: "That category already exists." };
    setOv((o) => ({ ...o, cats: [...(o.cats || SEED_CATS), { slug, name: c.name.trim(), tag: c.tag || "", blurb: c.blurb || "" }] }));
    return { ok: true };
  };
  const deleteCategory = (slug) => setOv((o) => ({ ...o, cats: (o.cats || SEED_CATS).filter((c) => c.slug !== slug) }));
  const resetCategories = () => setOv((o) => ({ ...o, cats: null }));

  const value = useMemo(() => ({
    products, categories, addProduct, updateProduct, deleteProduct, resetCatalog,
    updateCategory, addCategory, deleteCategory, resetCategories,
  }), [products, categories]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCatalog = () => useContext(Ctx);
