import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Loader2,
  Package,
  RefreshCw,
  X,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Check,
  PlusCircle,
  Layers,
  Tag,
  DollarSign,
  Truck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { formatAUD } from "../../data/products";
import { imgFor } from "../../data/images";
import SafeImage from "../../components/SafeImage";
import { AdminTitle, Empty, Modal } from "./AdminLayout";
import {
  getAdminProductsApi,
  createAdminProductApi,
  updateAdminProductApi,
  deleteAdminProductApi,
  uploadAdminImageApi,
} from "../../api/endpoints/admin.api";
import { useCategories } from "../../hooks/api/useCategories";
import { useNotification } from "../../store/notification";

const STATUSES = ["In stock VIC", "Built to order", "Enquiry"];

const DEFAULT_SPECS_TEMPLATES = [
  { key: "Material", value: "Commercial Marine-Grade Aluminium" },
  { key: "Dimensions", value: "600 × 150 mm" },
  { key: "Finish", value: "High Visibility Reflective Class 1" },
  { key: "Standards", value: "ADR 84/00 & AS/NZS 1418.8 Fleet Check" },
  { key: "Warranty", value: "12-Month Aurex Commercial Warranty" },
];

const blankForm = {
  sku: "",
  name: "",
  price: "",
  tradePrice: "",
  mrp: "",
  isPOA: false,
  category: "trailer-parts",
  sub: "",
  brand: "Aurex",
  fit: "",
  oem: "",
  status: "In stock VIC",
  stock: "15",
  lead: "Ships in 24 hrs",
  badge: "",
  isFeatured: false,
  isBestSeller: false,
  isVisible: true,
  imageUrl: "",
  desc: "",
  specsList: [
    { key: "Material", value: "" },
    { key: "Dimensions", value: "" },
    { key: "Warranty", value: "12-Month Aurex Commercial Warranty" },
  ],
};

export default function Products() {
  const { notify } = useNotification();
  const { data: categories = [] } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // null | product to delete
  const [deleting, setDeleting] = useState(false);
  const [q, setQ] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [modal, setModal] = useState(null); // null | "add" | sku-being-edited
  const [activeTab, setActiveTab] = useState("general"); // "general" | "pricing" | "fitment" | "specs"
  const [form, setForm] = useState(blankForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

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

  const toggleProductVisibility = async (p) => {
    const isCurrentlyVisible = p.isVisible !== false && p.publicationStatus !== "DRAFT";
    const nextVisible = !isCurrentlyVisible;
    setTogglingId(p.sku);

    // Optimistically update local state so the switch reflects immediately
    setProducts((prev) =>
      prev.map((item) =>
        item.sku === p.sku
          ? {
            ...item,
            isVisible: nextVisible,
            isPublished: nextVisible,
            publicationStatus: nextVisible ? "PUBLISHED" : "DRAFT",
          }
          : item
      )
    );

    try {
      const updated = await updateAdminProductApi(p.sku, {
        isVisible: nextVisible,
        isPublished: nextVisible,
        status: nextVisible ? "PUBLISHED" : "DRAFT",
      });
      setProducts((prev) =>
        prev.map((item) => (item.sku === p.sku ? { ...item, ...updated } : item))
      );
      notify.success({
        title: nextVisible ? "Live on Storefront" : "Hidden from Storefront",
        message: `${p.name} (${p.sku}) is now ${nextVisible ? "visible and buyable on client side" : "hidden from client storefront"
          }.`,
      });
    } catch (err) {
      console.error("[admin-products] Visibility toggle error:", err);
      // Revert optimistic update on failure
      setProducts((prev) =>
        prev.map((item) =>
          item.sku === p.sku
            ? {
              ...item,
              isVisible: isCurrentlyVisible,
              isPublished: isCurrentlyVisible,
              publicationStatus: isCurrentlyVisible ? "PUBLISHED" : "DRAFT",
            }
            : item
        )
      );
      notify.error({
        title: "Could Not Update Visibility",
        message: err.message || "Failed to update storefront visibility.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return products.filter((p) => {
      if (selectedCat !== "All" && p.category !== selectedCat) return false;
      if (!needle) return true;
      const haystack = `${p.sku || ""} ${p.name || ""} ${p.brand || ""} ${p.oem || ""} ${p.sub || ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [products, q, selectedCat]);

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      const cat = p.category || "accessories";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const openAdd = () => {
    setForm({
      ...blankForm,
      isVisible: true,
      category: categories[0]?.slug || "trailer-parts",
      specsList: [
        { key: "Material", value: "" },
        { key: "Dimensions", value: "" },
        { key: "Warranty", value: "12-Month Aurex Commercial Warranty" },
      ],
    });
    setFormError("");
    setActiveTab("general");
    setModal("add");
  };

  const openEdit = (p) => {
    const specsEntries = Object.entries(p.specs || {}).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    const primaryImg =
      p.imageUrl ||
      (Array.isArray(p.images) && p.images[0]
        ? typeof p.images[0] === "string"
          ? p.images[0]
          : p.images[0]?.url
        : "");

    setForm({
      sku: p.sku || "",
      name: p.name || "",
      price: p.price == null ? "" : String(p.price),
      tradePrice: p.pricing?.tradePrice != null && p.pricing.tradePrice !== 0 ? String(p.pricing.tradePrice) : "",
      mrp: p.pricing?.mrp != null ? String(p.pricing.mrp) : "",
      isPOA: Boolean(p.pricing?.isPOA || p.price === null),
      category: p.category || categories[0]?.slug || "trailer-parts",
      sub: p.sub || "",
      brand: p.brand || "Aurex",
      fit: p.fit || "",
      oem: p.oem || "",
      status: p.status || "In stock VIC",
      stock: String(p.inventory?.stock ?? 15),
      lead: p.lead || "Ships in 24 hrs",
      badge: p.badge || "",
      isFeatured: Boolean(p.isFeatured),
      isBestSeller: Boolean(p.isBestSeller),
      isVisible: p.isVisible !== false && p.publicationStatus !== "DRAFT",
      imageUrl: primaryImg || "",
      desc: p.desc || p.description || "",
      specsList:
        specsEntries.length > 0
          ? specsEntries
          : [
            { key: "Material", value: "" },
            { key: "Dimensions", value: "" },
            { key: "Warranty", value: "12-Month Aurex Commercial Warranty" },
          ],
    });
    setFormError("");
    setActiveTab("general");
    setModal(p.sku);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadAdminImageApi(file);
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        notify.success({
          title: "Image Uploaded",
          message: "Product image uploaded successfully.",
        });
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (err) {
      console.error("[admin-products] Image upload error:", err);
      // Fallback: read as base64 data URL
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        setForm((prev) => ({ ...prev, imageUrl: readEvent.target.result }));
        notify.info({
          title: "Image Attached",
          message: "Image loaded as local preview.",
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addSpecRow = (key = "", value = "") => {
    setForm((prev) => ({
      ...prev,
      specsList: [...prev.specsList, { key, value }],
    }));
  };

  const updateSpecRow = (idx, field, val) => {
    setForm((prev) => {
      const next = [...prev.specsList];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, specsList: next };
    });
  };

  const removeSpecRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      specsList: prev.specsList.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.sku.trim()) {
      setFormError("Product SKU is required (e.g. ATP-TP-99).");
      setActiveTab("general");
      return;
    }
    if (!form.name.trim()) {
      setFormError("Product Name is required.");
      setActiveTab("general");
      return;
    }

    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setFormError("Selling Price (AUD) is required for customer purchases on the client side.");
      setActiveTab("pricing");
      return;
    }

    // Convert specsList array back into a key-value object
    const specsObj = {};
    (form.specsList || []).forEach((row) => {
      const k = row.key?.trim();
      if (k) {
        specsObj[k] = row.value?.trim() || "";
      }
    });

    const priceNum = Number(form.price);
    const tradePriceNum = form.tradePrice === "" ? 0 : Number(form.tradePrice);
    const mrpNum = form.mrp === "" ? (priceNum || 0) : Number(form.mrp);

    const payload = {
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      price: priceNum,
      tradePrice: tradePriceNum,
      mrp: mrpNum,
      isPOA: false,
      category: form.category,
      sub: form.sub.trim(),
      brand: form.brand.trim() || "Aurex",
      fit: form.fit.trim(),
      oem: form.oem.trim(),
      status: form.status,
      stock: Number(form.stock) || 0,
      lead: form.lead.trim(),
      badge: form.badge.trim(),
      isFeatured: Boolean(form.isFeatured),
      isBestSeller: Boolean(form.isBestSeller),
      isVisible: Boolean(form.isVisible),
      isPublished: Boolean(form.isVisible),
      imageUrl: form.imageUrl.trim(),
      images: form.imageUrl.trim() ? [{ url: form.imageUrl.trim(), isPrimary: true }] : [],
      desc: form.desc.trim(),
      specs: specsObj,
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { sku, name } = deleteTarget;
    setDeleting(true);
    try {
      await deleteAdminProductApi(sku);
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
      notify.success({
        title: "Product Deleted",
        message: `${sku} - "${name}" has been removed from catalogue.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error("[admin-products] Delete error:", err);
      notify.error({
        title: "Could Not Delete Product",
        message: err.message || "Failed to delete product.",
      });
    } finally {
      setDeleting(false);
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

      {/* Category Pills Filter & Search Toolbar */}
      <div className="mb-5 space-y-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCat("All")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCat === "All"
                ? "bg-navy text-white shadow-xs ring-1 ring-navy"
                : "border border-line-dark bg-white text-steel hover:border-navy hover:text-ink"
            }`}
          >
            <span>All Categories</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                selectedCat === "All" ? "bg-white/20 text-white" : "bg-mist text-steel"
              }`}
            >
              {products.length}
            </span>
          </button>

          {categories.map((c) => {
            const slug = c.slug || c.id;
            const count = categoryCounts[slug] || 0;
            const isSelected = selectedCat === slug;

            return (
              <button
                key={slug}
                type="button"
                onClick={() => setSelectedCat(slug)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-navy text-white shadow-xs ring-1 ring-navy"
                    : "border border-line-dark bg-white text-steel hover:border-navy hover:text-ink"
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-mist text-steel"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar + Parts Count */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-steel" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by SKU, Part Name, Brand or OEM…"
              className="h-10 w-full rounded-xl border border-line-dark bg-white pl-9 pr-9 text-xs outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-3 top-2.5 text-steel hover:text-ink"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className="font-mono text-xs text-faint">
            Showing <strong className="text-ink font-bold">{filtered.length}</strong> of {products.length} parts
          </span>
        </div>
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
                  <th className="px-5 py-3.5 min-w-[320px]">Product Part</th>
                  <th className="px-4 py-3.5 min-w-[140px] whitespace-nowrap">Category & Sub</th>
                  <th className="px-4 py-3.5 min-w-[120px] whitespace-nowrap">Selling Price</th>
                  <th className="px-4 py-3.5 min-w-[180px] whitespace-nowrap">Storefront Visibility</th>
                  <th className="px-5 py-3.5 min-w-[110px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[13px]">
                {filtered.map((p) => {
                  const displayImage =
                    p.imageUrl ||
                    (Array.isArray(p.images) && p.images[0]
                      ? typeof p.images[0] === "string"
                        ? p.images[0]
                        : p.images[0]?.url
                      : null) ||
                    imgFor(p.sku);

                  const isEnquiry = p.price == null || p.status === "Enquiry" || p.pricing?.isPOA;

                  return (
                    <tr key={p.sku || p.id} className="hover:bg-mist/40 transition-colors">
                      {/* Product Part: Image + Name + Tags */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-white shadow-2xs">
                            <SafeImage
                              src={displayImage}
                              alt={p.name}
                              className="h-full w-full object-contain p-1"
                              fallbackIconSize={20}
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-ink text-sm leading-snug line-clamp-1" title={p.name}>
                              {p.name}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                              <span className="font-mono text-[11px] font-bold text-navy bg-navy/10 px-2 py-0.5 rounded-md">
                                {p.sku}
                              </span>
                              {p.brand && (
                                <span className="text-[11px] font-semibold text-steel">
                                  {p.brand}
                                </span>
                              )}
                              {p.badge && (
                                <span className="rounded-md bg-mist px-2 py-0.5 text-[10px] font-bold text-steel border border-line">
                                  {p.badge}
                                </span>
                              )}
                              {p.isFeatured && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 ring-1 ring-amber-200">
                                  FEATURED
                                </span>
                              )}
                              {p.isBestSeller && (
                                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-800 ring-1 ring-blue-200">
                                  BEST SELLER
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Sub */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-block rounded-md bg-mist px-2.5 py-1 text-xs font-bold text-steel capitalize border border-line/60">
                          {p.category?.replace("-", " ") || "Accessories"}
                        </span>
                        <p className="text-[11px] text-faint mt-1 truncate max-w-[150px]">
                          {p.sub || "—"}
                        </p>
                      </td>

                      {/* Selling Price & Wholesale Trade */}
                      <td className="px-4 py-3.5 tabular whitespace-nowrap">
                        {isEnquiry ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-navy ring-1 ring-blue-200">
                            POA (Enquiry)
                          </span>
                        ) : (
                          <div>
                            <p className="font-extrabold text-[15px] text-ink">{formatAUD(p.price)}</p>
                            {p.pricing?.tradePrice ? (
                              <p className="text-[11px] font-medium text-steel mt-0.5">
                                <span className="text-faint">Trade:</span> {formatAUD(p.pricing.tradePrice)}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </td>

                      {/* Storefront Visibility Toggle */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={p.isVisible !== false && p.publicationStatus !== "DRAFT"}
                            disabled={togglingId === p.sku}
                            onClick={() => toggleProductVisibility(p)}
                            className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${p.isVisible !== false && p.publicationStatus !== "DRAFT"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-gray-300 hover:bg-gray-400"
                              }`}
                            title={
                              p.isVisible !== false && p.publicationStatus !== "DRAFT"
                                ? "Live on Client Store — Click to hide from client side"
                                : "Hidden from Store — Click to show on client side"
                            }
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${p.isVisible !== false && p.publicationStatus !== "DRAFT"
                                ? "translate-x-5"
                                : "translate-x-0"
                                }`}
                            />
                          </button>
                          <div className="flex items-center gap-1.5">
                            {togglingId === p.sku ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-steel">
                                <Loader2 size={12} className="animate-spin text-navy" />
                                <span>Updating…</span>
                              </span>
                            ) : p.isVisible !== false && p.publicationStatus !== "DRAFT" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                                <span>Live on Store</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500 ring-1 ring-gray-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                <EyeOff size={12} className="text-gray-400" />
                                <span>Hidden</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/product/${p.sku}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-dark bg-white text-steel hover:border-navy hover:text-navy transition shadow-2xs"
                            title="View product on live storefront"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            onClick={() => openEdit(p)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-dark bg-white text-steel hover:border-navy hover:text-navy transition shadow-2xs"
                            title="Edit Product Details & Image"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-dark bg-white text-steel hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition shadow-2xs"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
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

      {/* Add / Edit Comprehensive Product Modal */}
      {modal && (
        <Modal close={() => setModal(null)} wide>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
                {modal === "add" ? "Catalogue Management" : `SKU #${modal}`}
              </p>
              <h2 className="text-xl font-extrabold text-ink">
                {modal === "add" ? "Add New Truck Part" : `Edit Part Details — ${form.name || modal}`}
              </h2>
            </div>
            {modal !== "add" && (
              <Link
                to={`/product/${modal}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-line-dark bg-mist px-3 py-1.5 text-xs font-bold text-navy hover:bg-white transition"
              >
                <ExternalLink size={13} />
                <span>View on Storefront</span>
              </Link>
            )}
          </div>

          {/* Modal Tabs Bar */}
          <div className="mt-4 p-1.5 rounded-xl border border-line-dark/70 bg-mist grid grid-cols-2 sm:grid-cols-4 gap-1.5 shadow-2xs">
            {[
              { id: "general", label: "General & Image", icon: ImageIcon },
              { id: "pricing", label: "Pricing & Stock", icon: DollarSign },
              { id: "fitment", label: "Fitment & Overview", icon: Truck },
              { id: "specs", label: "Technical Specs", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-navy text-white shadow-sm ring-1 ring-navy font-extrabold"
                      : "bg-white text-steel border border-line-dark/50 hover:border-navy hover:text-ink hover:bg-white font-bold"
                  }`}
                >
                  <Icon size={14} className={isSelected ? "text-gold" : "text-steel"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            {/* TAB 1: GENERAL & IMAGE */}
            {activeTab === "general" && (
              <div className="space-y-4">
                {/* Product Image Management Card */}
                <div className="rounded-xl border border-line-dark/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 border-b border-line pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-navy">
                      <ImageIcon size={14} className="text-gold" />
                      <span>Product Image & Visuals</span>
                    </span>
                    <span className="text-[11px] font-mono text-faint">
                      {form.imageUrl ? "Custom Image Attached" : "Catalogue Default Visual"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {/* Image Preview Box */}
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-line-dark bg-mist/60 shadow-xs grid place-items-center">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-1.5 text-[11px] font-bold text-navy">
                          <Loader2 size={22} className="animate-spin text-navy" />
                          <span>Uploading…</span>
                        </div>
                      ) : form.imageUrl ? (
                        <SafeImage
                          src={form.imageUrl}
                          alt="Product preview"
                          className="h-full w-full object-contain p-1.5"
                          fallbackIconSize={24}
                        />
                      ) : form.sku ? (
                        <SafeImage
                          src={imgFor(form.sku)}
                          alt="Catalogue default"
                          className="h-full w-full object-contain p-1.5"
                          fallbackIconSize={24}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-faint">
                          <ImageIcon size={26} className="text-steel/50" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Image Controls */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white hover:bg-ink transition shadow-xs">
                          <Upload size={14} />
                          <span>{uploadingImage ? "Uploading…" : "Upload New Image"}</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                        {form.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                            className="rounded-xl border border-line-dark px-3.5 py-2.5 text-xs font-semibold text-steel hover:bg-mist hover:text-ink transition"
                          >
                            Reset to Default
                          </button>
                        )}
                        <span className="text-[11px] text-faint">
                          PNG, JPG, WebP (up to 5MB)
                        </span>
                      </div>

                      <div>
                        <span className="mb-1.5 block text-[11px] font-bold text-steel">
                          Or specify Image URL directly:
                        </span>
                        <input
                          type="url"
                          value={form.imageUrl}
                          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                          placeholder="https://example.com/images/part.jpg"
                          className="h-10 w-full rounded-xl border border-line-dark bg-mist/30 px-3 text-xs outline-none placeholder:text-faint focus:border-navy focus:bg-white focus:ring-1 focus:ring-navy"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Identification Fields */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-steel">SKU Part Number *</span>
                    <input
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                      disabled={modal !== "add"}
                      placeholder="ATP-TL-88"
                      className={`${inputClass} disabled:bg-mist font-mono font-bold`}
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
                    <span className="mb-1 block text-xs font-bold text-steel">Product Part Name *</span>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. 2T Aluminium Tail Lift Power Pack"
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-steel">Sub-Line / Component Category</span>
                    <input
                      value={form.sub}
                      onChange={(e) => setForm({ ...form, sub: e.target.value })}
                      placeholder="e.g. Tail Lifts, Door Gear, Safety Signs"
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-steel">Brand</span>
                    <input
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="e.g. Aurex, Vanguard"
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-steel">Promotional Badge Text</span>
                    <input
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      placeholder="e.g. Popular, ADR Checked, Heavy Duty"
                      className={inputClass}
                    />
                  </label>

                  <div className="flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-steel cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="h-4 w-4 rounded border-line-dark text-navy focus:ring-navy"
                      />
                      <span>Featured Product</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-steel cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isBestSeller}
                        onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                        className="h-4 w-4 rounded border-line-dark text-navy focus:ring-navy"
                      />
                      <span>Best Seller</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING & STOCK */}
            {activeTab === "pricing" && (
              <div className="space-y-4">
                {/* Commercial Pricing Card */}
                <div className="rounded-xl border border-line-dark/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 border-b border-line pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-navy">
                      <DollarSign size={14} className="text-gold" />
                      <span>Commercial Client Pricing</span>
                    </span>
                    <span className="text-[11px] font-mono text-faint">
                      Currency: AUD ($) · GST Included
                    </span>
                  </div>


                  {/* Pricing Inputs Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Primary Selling Price */}
                    <div className="space-y-1 sm:col-span-1">
                      <label className="block">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-steel">
                            Selling Price (AUD) <span className="text-red-500 font-extrabold">*</span>
                          </span>
                          {form.price && (
                            <span className="text-[11px] font-mono font-bold text-navy">
                              Client sees: {formatAUD(Number(form.price) || 0)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-steel">$</span>
                          <input
                            value={form.price}
                            onChange={(e) =>
                              setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })
                            }
                            placeholder="e.g. 350.00"
                            className={`${inputClass} pl-7 font-bold bg-white text-ink focus:border-navy`}
                          />
                        </div>
                      </label>
                      <p className="text-[11px] text-faint">
                        Primary client-facing retail price charged at checkout.
                      </p>
                    </div>

                    {/* Wholesale Trade Price */}
                    <div className="space-y-1 sm:col-span-1">
                      <label className="block">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-steel">
                            Wholesale Trade Price (AUD)
                          </span>
                          {form.tradePrice && (
                            <span className="text-[11px] font-mono font-bold text-steel">
                              Trade: {formatAUD(Number(form.tradePrice) || 0)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-steel">$</span>
                          <input
                            value={form.tradePrice}
                            onChange={(e) =>
                              setForm({ ...form, tradePrice: e.target.value.replace(/[^\d.]/g, "") })
                            }
                            placeholder="e.g. 290.00 (Optional)"
                            className={`${inputClass} pl-7`}
                          />
                        </div>
                      </label>
                      <p className="text-[11px] text-faint">
                        Optional special wholesale rate for approved fleet trade accounts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warehouse & Fulfilment Card */}
                <div className="rounded-xl border border-line-dark/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 border-b border-line pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-navy">
                      <Truck size={14} className="text-gold" />
                      <span>Stock & Fulfilment (Client Visibility)</span>
                    </span>
                    <span className="text-[11px] font-mono text-faint">
                      Shown on Product Page
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-steel">Stock Status Badge *</span>
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
                      <span className="text-[10px] text-faint mt-1 block">
                        Displays green "In Stock" or amber "Built to order" badge to clients.
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-steel">Warehouse Stock Qty</span>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="15"
                        className={inputClass}
                      />
                      <span className="text-[10px] text-faint mt-1 block">
                        Available warehouse inventory units.
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-steel">Dispatch Lead Time *</span>
                      <input
                        value={form.lead}
                        onChange={(e) => setForm({ ...form, lead: e.target.value })}
                        placeholder="e.g. Ships in 24 hrs"
                        className={inputClass}
                      />
                      <span className="text-[10px] text-faint mt-1 block">
                        Shows under price: "Order by 2pm for same day dispatch".
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FITMENT & DESCRIPTION */}
            {activeTab === "fitment" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-bold text-steel">OEM Part Cross-Reference</span>
                    <input
                      value={form.oem}
                      onChange={(e) => setForm({ ...form, oem: e.target.value })}
                      placeholder="e.g. VNRMP-81B, DH-LM.20, OEM-4095-A"
                      className={inputClass}
                    />
                    <span className="text-[11px] text-faint mt-1 block">
                      Cross-reference code used for workshop and trade searches.
                    </span>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-bold text-steel">Vehicle / Trailer Fitment</span>
                    <input
                      value={form.fit}
                      onChange={(e) => setForm({ ...form, fit: e.target.value })}
                      placeholder="Suits commercial refrigerated trailers, dry freight vans, heavy prime movers"
                      className={inputClass}
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-bold text-steel">Product Description</span>
                    <textarea
                      value={form.desc}
                      onChange={(e) => setForm({ ...form, desc: e.target.value })}
                      rows={4}
                      placeholder="Heavy-duty commercial grade part engineered for Australian road transport conditions..."
                      className="w-full rounded-lg border border-line-dark bg-white p-3 text-xs outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: TECHNICAL SPECIFICATIONS (SPECS) */}
            {activeTab === "specs" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-line bg-mist/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-navy block">
                        Technical Specifications
                      </span>
                      <p className="text-[11px] text-steel">
                        These key-value pairs are displayed directly under the "Technical Specs" tab on the client product page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addSpecRow("", "")}
                      className="flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-ink transition shadow-xs"
                    >
                      <Plus size={13} />
                      <span>Add Spec Row</span>
                    </button>
                  </div>

                  {/* Preset Spec Buttons if empty */}
                  {form.specsList.length === 0 && (
                    <div className="mb-3 rounded-lg border border-dashed border-line-dark p-3 bg-white text-center">
                      <p className="text-xs text-steel mb-2">No specifications added yet. Add common specs:</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {DEFAULT_SPECS_TEMPLATES.map((tmpl) => (
                          <button
                            key={tmpl.key}
                            type="button"
                            onClick={() => addSpecRow(tmpl.key, tmpl.value)}
                            className="rounded-md border border-line bg-mist px-2.5 py-1 text-xs font-semibold text-steel hover:border-navy hover:text-navy"
                          >
                            + {tmpl.key}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rows of specs */}
                  <div className="space-y-2">
                    {form.specsList.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          value={row.key}
                          onChange={(e) => updateSpecRow(idx, "key", e.target.value)}
                          placeholder="Property (e.g. Material)"
                          className="h-9 w-1/3 rounded-lg border border-line-dark bg-white px-3 text-xs outline-none focus:border-navy font-semibold"
                        />
                        <input
                          value={row.value}
                          onChange={(e) => updateSpecRow(idx, "value", e.target.value)}
                          placeholder="Value (e.g. 600 × 150 mm)"
                          className="h-9 flex-1 rounded-lg border border-line-dark bg-white px-3 text-xs outline-none focus:border-navy"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecRow(idx)}
                          className="rounded p-2 text-steel hover:bg-red-50 hover:text-red-600 transition"
                          title="Remove Row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-start">
                    <button
                      type="button"
                      onClick={() => addSpecRow("", "")}
                      className="text-xs font-bold text-navy hover:underline flex items-center gap-1"
                    >
                      <PlusCircle size={14} />
                      <span>Add another specification property</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <span className="text-[11px] font-mono text-faint">
                {modal === "add" ? "Creates new live product" : `Editing SKU: ${modal}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-lg border border-line-dark px-4 py-2.5 text-xs font-bold text-steel hover:bg-mist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-xs font-extrabold text-ink hover:bg-navy hover:text-white transition disabled:opacity-50 shadow-xs"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{modal === "add" ? "Create Product" : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Floating Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-4 animate-in fade-in duration-200"
        >
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          {/* Floating dialog card */}
          <div className="relative w-full max-w-md rounded-2xl border border-line-dark bg-white p-6 shadow-2xl transition-all">
            {/* Close button */}
            <button
              onClick={() => !deleting && setDeleteTarget(null)}
              disabled={deleting}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-steel hover:bg-mist hover:text-ink disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Warning Icon Badge */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-8 ring-red-50 mb-4">
              <AlertTriangle size={24} />
            </div>

            {/* Title & Warning message */}
            <h3 className="text-lg font-extrabold text-ink">
              Delete Product Part?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-steel">
              Are you sure you want to permanently delete this part? This action cannot be undone and will remove it from the warehouse inventory and client storefront.
            </p>

            {/* Product Snapshot Card */}
            <div className="my-4 flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
                <SafeImage
                  src={
                    deleteTarget.imageUrl ||
                    (Array.isArray(deleteTarget.images) && deleteTarget.images[0]
                      ? typeof deleteTarget.images[0] === "string"
                        ? deleteTarget.images[0]
                        : deleteTarget.images[0]?.url
                      : null) ||
                    imgFor(deleteTarget.sku)
                  }
                  alt={deleteTarget.name}
                  className="h-full w-full object-contain p-1"
                  fallbackIconSize={18}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-ink text-xs line-clamp-1" title={deleteTarget.name}>
                  {deleteTarget.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] font-bold text-navy bg-navy/10 px-1.5 py-0.5 rounded">
                    {deleteTarget.sku}
                  </span>
                  <span className="text-[11px] font-extrabold text-ink">
                    {deleteTarget.price != null ? formatAUD(deleteTarget.price) : "POA"}
                  </span>
                  {deleteTarget.brand && (
                    <span className="text-[10px] text-faint">
                      · {deleteTarget.brand}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-line-dark bg-white py-2.5 text-xs font-bold text-steel hover:bg-mist hover:text-ink disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-60 transition"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete Part</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
