import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit3,
  Loader2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  X,
  AlertTriangle,
  ExternalLink,
  Layers,
  Tag,
} from "lucide-react";
import { useCatalog } from "../../store/catalog";
import { AdminTitle, Modal } from "./AdminLayout";
import { useNotification } from "../../store/notification";
import { uploadAdminImageApi } from "../../api/endpoints/admin.api";
import SafeImage from "../../components/SafeImage";

export default function Categories() {
  const { categories, updateCategory, addCategory, deleteCategory, resetCategories } = useCatalog();
  const { notify } = useNotification();

  const [modal, setModal] = useState(null); // null | "add" | category slug
  const [form, setForm] = useState({ name: "", tag: "", blurb: "", imageUrl: "", slug: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Floating Confirmation Modals
  const [deleteTarget, setDeleteTarget] = useState(null); // null | category object to delete
  const [deleting, setDeleting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fileInputRef = useRef(null);

  const openAdd = () => {
    setForm({ name: "", tag: "", blurb: "", imageUrl: "", slug: "" });
    setErr("");
    setModal("add");
  };

  const openEdit = (c) => {
    const imgUrl = c.imageUrl || (typeof c.image === "string" ? c.image : c.image?.url || "");
    setForm({
      name: c.name || "",
      tag: c.tag || "",
      blurb: c.blurb || c.description || "",
      imageUrl: imgUrl,
      slug: c.slug || "",
    });
    setErr("");
    setModal(c.slug);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedUrl = await uploadAdminImageApi(file);
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        notify.success({
          title: "Image Uploaded",
          message: "Category image uploaded successfully.",
        });
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (uploadErr) {
      console.error("[admin-categories] Image upload error:", uploadErr);
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
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErr("Category name is required.");
      return;
    }

    setSaving(true);
    setErr("");
    try {
      if (modal === "add") {
        const res = await addCategory({
          name: form.name.trim(),
          tag: form.tag.trim(),
          blurb: form.blurb.trim(),
          imageUrl: form.imageUrl.trim(),
        });
        if (!res.ok) {
          setErr(res.msg || "Failed to add category");
          return;
        }
        notify.success({
          title: "Category Created",
          message: `Category "${form.name.trim()}" added to live catalogue.`,
        });
      } else {
        const res = await updateCategory(modal, {
          name: form.name.trim(),
          tag: form.tag.trim(),
          blurb: form.blurb.trim(),
          imageUrl: form.imageUrl.trim(),
        });
        if (!res.ok) {
          setErr(res.msg || "Failed to update category");
          return;
        }
        notify.success({
          title: "Category Updated",
          message: `Saved changes to "${form.name.trim()}".`,
        });
      }
      setModal(null);
    } catch (saveErr) {
      setErr(saveErr.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteCategory(deleteTarget.slug);
      if (res && !res.ok) {
        notify.error({
          title: "Could Not Delete Category",
          message: res.msg || "Failed to delete category.",
        });
      } else {
        notify.success({
          title: "Category Deleted",
          message: `Category "${deleteTarget.name}" has been removed.`,
        });
        setDeleteTarget(null);
      }
    } catch (delErr) {
      notify.error({
        title: "Delete Error",
        message: delErr.message || "An unexpected error occurred.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const confirmReset = async () => {
    setResetting(true);
    try {
      await resetCategories();
      notify.success({
        title: "Categories Reset",
        message: "Categories refreshed to seed data.",
      });
      setShowResetModal(false);
    } catch (resetErr) {
      notify.error({
        title: "Reset Failed",
        message: resetErr.message || "Failed to reset categories.",
      });
    } finally {
      setResetting(false);
    }
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-line-dark bg-white px-3 text-xs outline-none placeholder:text-faint focus:border-navy focus:ring-1 focus:ring-navy";
  const labelClass = "mb-1.5 block text-xs font-bold text-ink";

  return (
    <div>
      <AdminTitle
        kicker="Catalogue Management"
        title={`Categories (${categories.length})`}
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-line-dark bg-white px-3.5 py-2 text-xs font-bold text-steel hover:border-navy hover:text-navy transition"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-ink shadow-sm transition hover:bg-navy hover:text-white"
            >
              <Plus size={15} />
              <span>Add Category</span>
            </button>
          </div>
        }
      />

      {/* Categories Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-mist text-[11px] font-extrabold uppercase tracking-wider text-steel">
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Storefront Slug</th>
                <th className="px-5 py-3 text-center">Products</th>
                <th className="px-5 py-3">Tag / Badge</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[13px]">
              {categories.map((c) => {
                const imgUrl = c.imageUrl || (typeof c.image === "string" ? c.image : c.image?.url || "");
                return (
                  <tr key={c.slug} className="hover:bg-mist/40 transition-colors">
                    {/* Category with Image thumbnail */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line-dark/30 bg-mist shadow-2xs">
                          <SafeImage
                            src={imgUrl}
                            alt={c.name}
                            className="h-full w-full object-cover"
                            fallbackIconSize={20}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="block font-bold text-ink text-sm">{c.name}</span>
                          <span className="block text-xs text-steel line-clamp-1 max-w-md">
                            {c.blurb || c.description || "Commercial heavy truck parts and assemblies"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-5 py-3.5 font-mono text-xs text-steel">
                      <Link
                        to={`/shop/${c.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-navy underline"
                      >
                        <span>/shop/{c.slug}</span>
                        <ExternalLink size={11} className="text-faint" />
                      </Link>
                    </td>

                    {/* Product count */}
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-ink">
                      <span className="inline-block rounded-md bg-mist px-2.5 py-1 text-xs">
                        {c.count ?? 0}
                      </span>
                    </td>

                    {/* Tag badge */}
                    <td className="px-5 py-3.5">
                      {c.tag ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-ink border border-gold/40">
                          <Tag size={11} className="text-gold-dark" />
                          <span>{c.tag}</span>
                        </span>
                      ) : (
                        <span className="text-faint text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-line-dark bg-white px-2.5 py-1.5 text-xs font-bold text-navy hover:bg-mist transition"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
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

      {/* Add / Edit Category Modal */}
      {modal && (
        <Modal close={() => !saving && setModal(null)} wide>
          <div className="border-b border-line pb-3">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
              {modal === "add" ? "Catalogue Management" : "Category Modification"}
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-navy">
              {modal === "add" ? "Add New Category" : `Edit Category: ${form.name}`}
            </h2>
            <p className="mt-0.5 text-xs text-steel">
              {modal === "add"
                ? "Configure shelf name, promotional tag, description blurb, and artwork."
                : `Update parameters and visual asset for /shop/${modal}`}
            </p>
          </div>

          <form onSubmit={save} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Tail Lifts, Lighting, Suspensions"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Tag / Promotional Callout</label>
                <input
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  placeholder="e.g. From $3.40, Enquiry only, Best Seller"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Blurb / Catalogue Description</label>
              <textarea
                value={form.blurb}
                onChange={(e) => setForm({ ...form, blurb: e.target.value })}
                rows={3}
                placeholder="Short summary displayed on category banners and search cards…"
                className="w-full rounded-lg border border-line-dark bg-white px-3 py-2 text-xs outline-none placeholder:text-faint focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Category Image Upload & Preview Card */}
            <div className="rounded-xl border border-line bg-mist/50 p-4">
              <label className="mb-2 block text-xs font-bold text-ink">
                Category Image & Hero Artwork
              </label>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Image Preview Box */}
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white shadow-2xs">
                  {form.imageUrl ? (
                    <>
                      <img
                        src={form.imageUrl}
                        alt="Category preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                        className="absolute right-1 top-1 rounded-full bg-ink/75 p-1 text-white hover:bg-red-600 transition"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-steel">
                      <ImageIcon size={24} className="text-faint mb-1" />
                      <span className="text-[10px] font-semibold text-faint">No Image</span>
                    </div>
                  )}
                </div>

                {/* File picker & URL input */}
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line-dark bg-white px-3 py-2 text-xs font-bold text-navy hover:bg-mist transition disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-navy" />
                          <span>Uploading…</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          <span>Upload Image File</span>
                        </>
                      )}
                    </button>
                    {form.imageUrl && (
                      <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                        ✓ Image attached
                      </span>
                    )}
                  </div>

                  <div>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="Or paste image URL (https://…)"
                      className="h-9 w-full rounded-lg border border-line-dark bg-white px-3 text-xs outline-none placeholder:text-faint focus:border-navy"
                    />
                  </div>
                  <p className="text-[11px] text-faint">
                    Recommended: 600×400px or 800×600px heavy vehicle or parts photo.
                  </p>
                </div>
              </div>
            </div>

            {err && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                {err}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={saving}
                className="rounded-lg border border-line-dark bg-white px-4 py-2.5 text-xs font-bold text-steel hover:bg-mist transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-xs font-bold text-ink shadow-sm hover:bg-navy hover:text-white transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{modal === "add" ? "Creating…" : "Saving…"}</span>
                  </>
                ) : (
                  <span>{modal === "add" ? "Add Category" : "Save Changes"}</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Floating Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4 backdrop-blur-xs">
          <div
            className="fixed inset-0 bg-navy/60 transition-opacity"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          <div className="popup-in relative my-8 w-full max-w-md rounded-2xl border border-line-dark bg-white p-6 shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="absolute right-4 top-4 rounded-lg p-1 text-steel hover:bg-mist hover:text-ink disabled:opacity-50 transition"
            >
              <X size={18} />
            </button>

            {/* Warning icon */}
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-8 ring-red-50">
              <AlertTriangle size={24} />
            </div>

            {/* Title & Warning message */}
            <h3 className="text-lg font-extrabold text-ink">
              Delete Category &quot;{deleteTarget.name}&quot;?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-steel">
              Are you sure you want to permanently delete this category? Its assigned products will remain in inventory, but will lose this catalogue shelf.
            </p>

            {/* Category Snapshot Card */}
            <div className="my-4 flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
                <SafeImage
                  src={
                    deleteTarget.imageUrl ||
                    (typeof deleteTarget.image === "string" ? deleteTarget.image : deleteTarget.image?.url)
                  }
                  alt={deleteTarget.name}
                  className="h-full w-full object-cover"
                  fallbackIconSize={18}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-ink text-xs line-clamp-1" title={deleteTarget.name}>
                  {deleteTarget.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] font-bold text-navy bg-navy/10 px-1.5 py-0.5 rounded">
                    /shop/{deleteTarget.slug}
                  </span>
                  <span className="text-[11px] font-extrabold text-ink">
                    {deleteTarget.count ?? 0} items
                  </span>
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
                    <span>Yes, Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4 backdrop-blur-xs">
          <div
            className="fixed inset-0 bg-navy/60 transition-opacity"
            onClick={() => !resetting && setShowResetModal(false)}
          />

          <div className="popup-in relative my-8 w-full max-w-md rounded-2xl border border-line-dark bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              disabled={resetting}
              className="absolute right-4 top-4 rounded-lg p-1 text-steel hover:bg-mist hover:text-ink disabled:opacity-50 transition"
            >
              <X size={18} />
            </button>

            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 ring-8 ring-amber-50">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-extrabold text-ink">Reset Categories?</h3>
            <p className="mt-1 text-xs leading-relaxed text-steel">
              This will reload the official seed categories from the backend database. Any custom categories created will be preserved or re-synced.
            </p>

            <div className="flex items-center gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="flex-1 rounded-xl border border-line-dark bg-white py-2.5 text-xs font-bold text-steel hover:bg-mist hover:text-ink disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                disabled={resetting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-navy py-2.5 text-xs font-bold text-white shadow-sm hover:bg-ink active:scale-95 disabled:opacity-60 transition"
              >
                {resetting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Resetting…</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Yes, Reset Categories</span>
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
