import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";

const Ctx = createContext(null);

/* Catalogue store for the staff console (/admin).
   The storefront itself reads the catalogue through React Query (hooks/api),
   so nothing is fetched here until an admin screen asks for it: this used to
   pull the entire product list on every page view. Writes are optimistic
   (instant UI) with the API call in the background; on error we refetch. */
export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [catBase, setCatBase] = useState([]);
  const requested = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.get("/admin/products?limit=1000"), api.get("/categories")]);
      const items = p?.items || p?.data?.products;
      const cats = c?.items || c?.data?.categories;
      if (Array.isArray(items)) setProducts(items);
      if (Array.isArray(cats)) setCatBase(cats);
    } catch { /* keep what we have if the API is unreachable */ }
  }, []);

  const ensureLoaded = useCallback(() => {
    if (requested.current) return;
    requested.current = true;
    refresh();
  }, [refresh]);

  const categories = useMemo(
    () => catBase.map((c) => ({ ...c, count: products.filter((p) => p.category === c.slug).length })),
    [catBase, products]
  );

  const addProduct = (p) => {
    if (!p.sku.trim() || !p.name.trim()) return { ok: false, msg: "SKU and name are required." };
    const sku = p.sku.trim().toUpperCase();
    if (products.some((x) => x.sku === sku)) return { ok: false, msg: "That SKU already exists." };
    const next = { ...p, sku };
    setProducts((l) => [...l, next]);
    api.post("/products", next).catch(refresh);
    return { ok: true };
  };
  const updateProduct = (sku, patch) => {
    setProducts((l) => l.map((p) => (p.sku === sku ? { ...p, ...patch } : p)));
    api.put(`/products/${sku}`, patch).catch(refresh);
  };
  const deleteProduct = (sku) => {
    setProducts((l) => l.filter((p) => p.sku !== sku));
    api.del(`/products/${sku}`).catch(refresh);
  };

  const addCategory = (c) => {
    const slug = c.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!c.name.trim() || !slug) return { ok: false, msg: "Name required and must be unique." };
    if (catBase.some((x) => x.slug === slug)) return { ok: false, msg: "That category already exists." };
    const next = { slug, name: c.name.trim(), tag: c.tag || "", blurb: c.blurb || "" };
    setCatBase((l) => [...l, next]);
    api.post("/categories", next).catch(refresh);
    return { ok: true };
  };
  const updateCategory = (slug, patch) => {
    setCatBase((l) => l.map((c) => (c.slug === slug ? { ...c, ...patch } : c)));
    api.put(`/categories/${slug}`, patch).catch(refresh);
  };
  const deleteCategory = (slug) => {
    setCatBase((l) => l.filter((c) => c.slug !== slug));
    api.del(`/categories/${slug}`).catch(refresh);
  };

  const value = useMemo(() => ({
    products, categories, ensureLoaded,
    addProduct, updateProduct, deleteProduct, resetCatalog: refresh,
    updateCategory, addCategory, deleteCategory, resetCategories: refresh,
  }), [products, categories, ensureLoaded, refresh]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const fallback = {
  products: [], categories: [], ensureLoaded: () => {},
  addProduct: () => ({ ok: false, msg: "Catalogue unavailable. Reload and try again." }),
  updateProduct: () => {}, deleteProduct: () => {}, resetCatalog: () => {},
  updateCategory: () => {}, addCategory: () => ({ ok: false }), deleteCategory: () => {}, resetCategories: () => {},
};

export const useCatalog = () => {
  const ctx = useContext(Ctx);
  if (!ctx && import.meta.env?.DEV) console.error("[catalog] useCatalog rendered without CatalogProvider.");
  const store = ctx ?? fallback;
  useEffect(() => { store.ensureLoaded(); }, [store]);
  return store;
};
