import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Trash2, Edit3, Loader2, Package, RefreshCw, X, AlertCircle } from "lucide-react";
import { formatAUD } from "../../data/products";
import { imgFor } from "../../data/images";
import SafeImage from "../../components/SafeImage";
import { AdminTitle, Empty, Modal } from "./AdminLayout";
import {
  getAdminProductsApi,
  createAdminProductApi,
  updateAdminProductApi,
  deleteAdminProductApi,
} from "../../api/endpoints/admin.api";
import { useCategories } from "../../hooks/api/useCategories";
import { useNotification } from "../../store/notification";

const STATUSES = ["In stock VIC", "Built to order", "Enquiry"];

const blankForm = {
  sku: "",
  name: "",
  price: "",
  category: "trailer-parts",
  sub: "",
  brand: "Aurex",
  fit: "",
  oem: "",
  status: "In stock VIC",
  stock: "15",
  lead: "Ships in 24 hrs",
  badge: "",
  desc: "",
};

export default function Products() {
  const { notify } = useNotification();
  const { data: categories = [] } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [modal, setModal] = useState(null); // null | "add" | sku-being-edited
  const [form, setForm] = useState(blankForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAdminProductsApi();
      setProducts(data.products || []);
    } catch (err) {
      console.error("[admin-products] Error loading products:", err);
      notify.error({
        title: "Could not load products",
        message: err.message || "Failed to fetch catalogue from backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return products.filter((p) => {
      if (selectedCat !== "All" && p.category !== selectedCat) return false;
      if (!needle) return true;
      const haystack = `${p.sku || ""} ${p.name || ""} ${p.brand || ""} ${p.oem || ""} ${p.sub || ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [products, q, selectedCat]);

  const openAdd = () => {
    setForm({
      ...blankForm,
      category: categories[0]?.slug || "trailer-parts",
    });
    setFormError("");
    setModal("add");
  };

  const openEdit = (p) => {
    setForm({
      sku: p.sku || "",
      name: p.name || "",
      price: p.price == null ? "" : String(p.price),
      category: p.category || (categories[0]?.slug || "trailer-parts"),
      sub: p.sub || "",
      brand: p.brand || "Aurex",
      fit: p.fit || "",
      oem: p.oem || "",
      status: p.status || "In stock VIC",
      stock: String(p.inventory?.stock ?? 15),
      lead: p.lead || "",
      badge: p.badge || "",
      desc: p.desc || "",
    });
    setFormError("");
    setModal(p.sku);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.sku.trim()) {
      setFormError("Product SKU is required (e.g. ATP-TP-99).");
      return;
    }
    if (!form.name.trim()) {
      setFormError("Product Name is required.");
      return;
    }

    const payload = {
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      price: form.price === "" ? null : Number(form.price),
      category: form.category,
      sub: form.sub.trim(),
      brand: form.brand.trim() || "Aurex",
      fit: form.fit.trim(),
      oem: form.oem.trim(),
      status: form.status,
      stock: Number(form.stock) || 0,
      lead: form.lead.trim(),
      badge: form.badge.trim(),
      desc: form.desc.trim(),
    };

    setSubmitting(true);
    try {
      if (modal === "add") {
        const created = await createAdminProductApi(payload);
        setProducts((prev) => [created, ...prev]);
        notify.success({
          title: "Product Added",
          message: `${created.name} (${created.sku}) added to live catalogue.`,
        });
      } else {
        const updated = await updateAdminProductApi(modal, payload);
        setProducts((prev) =>
          prev.map((p) => (p.sku === modal ? { ...p, ...updated } : p))
        );
        notify.success({
          title: "Product Updated",
          message: `Saved changes to ${payload.sku}.`,
        });
      }
      setModal(null);
    } catch (err) {
      console.error("[admin-products] Save error:", err);
      setFormError(err.message || "Failed to save product to database.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sku, name) => {
    if (!window.confirm(`Are you sure you want to delete ${sku} - "${name}"?`)) return;
    try {
      await deleteAdminProductApi(sku);
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
      notify.success({
        title: "Product Deleted",
        message: `${sku} has been removed from the database.`,
      });
    } catch (err) {
      notify.error({
        title: "Could Not Delete",
        message: err.message || "Failed to delete product.",
      });
    }
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-line-dark bg-white px-3 text-xs outline-none placeholder:text-faint focus:border-navy focus:ring-1 focus:ring-navy";

  return (
    <div>
      <AdminTitle
        kicker="Catalogue Management"
        title={`Products & Parts (${products.length})`}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={loadProducts}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-line-dark bg-white px-3.5 py-2 text-xs font-bold text-steel hover:border-navy hover:text-navy disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-navy" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-ink shadow-sm transition hover:bg-navy hover:text-white"
            >
              <Plus size={15} />
              <span>Add New Product</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-steel" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by SKU, Part Name, Brand or OEM…"
            className="h-10 w-full rounded-lg border border-line-dark bg-white pl-9 pr-3 text-xs outline-none focus:border-navy"
          />
        </div>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          aria-label="Filter Category"
          className="h-10 rounded-lg border border-line-dark bg-white px-3 text-xs font-semibold text-steel outline-none focus:border-navy"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug || c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-faint">
          Showing {filtered.length} of {products.length}
        </span>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 rounded-2xl border border-line bg-white p-12 text-sm font-semibold text-steel">
          <Loader2 className="animate-spin text-navy" size={20} />
          <span>Retrieving warehouse catalogue…</span>
        </div>
      ) : filtered.length === 0 ? (
        <Empty text="No products match your search or filter. Click '+ Add New Product' to add one." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-mist text-[11px] font-extrabold uppercase tracking-wider text-steel">
                  <th className="px-4 py-3">Product Part</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Stock / Status</th>
                  <th className="px-4 py-3">OEM Cross</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[13px]">
                {filtered.map((p) => {
                  return (
                    <tr key={p.sku || p.id} className="hover:bg-mist/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-line bg-mist">
                            <SafeImage
                              src={imgFor(p.sku)}
                              alt=""
                              className="h-full w-full object-cover"
                              fallbackIconSize={16}
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-ink truncate max-w-xs">{p.name}</p>
                            <p className="font-mono text-[11px] font-bold text-navy">
                              {p.sku} {p.brand ? `· ${p.brand}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-steel">
                          {p.category}
                        </span>
                        {p.sub && <p className="text-[11px] text-faint mt-0.5">{p.sub}</p>}
                      </td>
                      <td className="px-4 py-3 tabular font-bold text-ink">
                        {p.price == null ? (
                          <span className="text-navy">POA (Enquiry)</span>
                        ) : (
                          formatAUD(p.price)
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                            p.status === "In stock VIC"
                              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                              : p.status === "Built to order"
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                              : "bg-mist text-steel"
                          }`}
                        >
                          {p.status || "In stock VIC"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-steel">
                        {p.oem || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="rounded p-1.5 text-steel hover:bg-mist hover:text-navy"
                            title="Edit Product"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.sku, p.name)}
                            className="rounded p-1.5 text-steel hover:bg-red-50 hover:text-red-600"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modal && (
        <Modal close={() => setModal(null)} wide>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
                {modal === "add" ? "Inventory Management" : `SKU #${modal}`}
              </p>
              <h2 className="text-xl font-extrabold text-ink">
                {modal === "add" ? "Add New Truck Part" : "Edit Part Details"}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-steel">SKU Part Number *</span>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                disabled={modal !== "add"}
                placeholder="ATP-TL-88"
                className={`${inputClass} disabled:bg-mist`}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-steel">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.slug || c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold text-steel">Part Name *</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. 2T Aluminium Tail Lift Power Pack"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-steel">Price (AUD) — leave blank for POA</span>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="e.g. 350.00"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-steel">Stock Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-steel">Sub-Line</span>
              <input
                value={form.sub}
                onChange={(e) => setForm({ ...form, sub: e.target.value })}
                placeholder="e.g. Tail Lifts, Door Gear"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-steel">Brand</span>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Aurex"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-steel">OEM Part Cross-Reference</span>
              <input
                value={form.oem}
                onChange={(e) => setForm({ ...form, oem: e.target.value })}
                placeholder="e.g. OEM-4095-A"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-steel">Warehouse Stock Quantity</span>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="10"
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold text-steel">Vehicle / Trailer Fitment</span>
              <input
                value={form.fit}
                onChange={(e) => setForm({ ...form, fit: e.target.value })}
                placeholder="Suits commercial refrigerated trailers, dry freight vans"
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold text-steel">Description</span>
              <textarea
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                rows={3}
                placeholder="Heavy-duty commercial grade part..."
                className="w-full rounded-lg border border-line-dark bg-white p-3 text-xs outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </label>

            {formError && (
              <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-line-dark px-4 py-2.5 text-xs font-bold text-steel hover:bg-mist"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-xs font-extrabold text-ink hover:bg-navy hover:text-white transition disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>{modal === "add" ? "Create Product" : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
