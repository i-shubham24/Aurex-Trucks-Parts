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

  const addCategory = async (c) => {
    const rawSlug = c.slug || c.name || "";
    const slug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!c.name?.trim() || !slug) return { ok: false, msg: "Category name is required." };
    if (catBase.some((x) => x.slug === slug)) return { ok: false, msg: "That category already exists." };
    const imgUrl = c.imageUrl || (typeof c.image === "string" ? c.image : c.image?.url || "");
    const next = {
      slug,
      name: c.name.trim(),
      tag: c.tag || "",
      blurb: c.blurb || "",
      imageUrl: imgUrl,
      image: imgUrl ? { url: imgUrl } : null,
    };
    setCatBase((l) => [...l, next]);
    try {
      await api.post("/categories", next);
      await refresh();
      return { ok: true, category: next };
    } catch (err) {
      refresh();
      return { ok: false, msg: err?.message || "Failed to add category." };
    }
  };

  const updateCategory = async (slug, patch) => {
    const imgUrl = patch.imageUrl !== undefined ? patch.imageUrl : (typeof patch.image === "string" ? patch.image : patch.image?.url || "");
    const nextPatch = {
      ...patch,
      imageUrl: imgUrl,
      image: imgUrl ? { url: imgUrl } : undefined,
    };
    setCatBase((l) => l.map((c) => (c.slug === slug ? { ...c, ...nextPatch } : c)));
    try {
      await api.put(`/categories/${slug}`, nextPatch);
      await refresh();
      return { ok: true };
    } catch (err) {
      refresh();
      return { ok: false, msg: err?.message || "Failed to update category." };
    }
  };

  const deleteCategory = async (slug) => {
    setCatBase((l) => l.filter((c) => c.slug !== slug));
    try {
      await api.del(`/categories/${slug}`);
      await refresh();
      return { ok: true };
    } catch (err) {
      refresh();
      return { ok: false, msg: err?.message || "Failed to delete category." };
    }
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
