import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit3,
  Loader2,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
  X,
  FileText,
} from "lucide-react";
import { AdminTitle, Modal, Stat, th, td } from "./AdminLayout";
import { useNotification } from "../../store/notification";
import SafeImage from "../../components/SafeImage";
import {
  useAdminBlogs,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from "../../hooks/api/useBlogs";

const CATEGORIES = [
  "Tail Lifts",
  "Trailer Parts",
  "Accessories",
  "Tool Boxes",
  "Workshop News",
  "Guides & Advice",
  "Fleet Maintenance",
];

export default function Blogs() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } = useAdminBlogs();
  const updateBlogMutation = useUpdateBlogMutation();
  const deleteBlogMutation = useDeleteBlogMutation();
  const { notify } = useNotification();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // null | blog object
  const [deleting, setDeleting] = useState(false);

  // Blogs list from API
  const blogs = useMemo(() => data?.blogs || [], [data]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        b.summary?.toLowerCase().includes(q) ||
        (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesCat = filterCat === "all" || b.category === filterCat || b.tag === filterCat;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && b.isPublished) ||
        (filterStatus === "draft" && !b.isPublished);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [blogs, search, filterCat, filterStatus]);

  // Overall stats
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.isPublished).length;
    const drafts = total - published;
    const totalViews = blogs.reduce((sum, b) => sum + (b.viewsCount || 0), 0);
    return { total, published, drafts, totalViews };
  }, [blogs]);

  // Quick toggle publish status directly from table
  const handleTogglePublish = async (blog) => {
    try {
      const nextStatus = !blog.isPublished;
      await updateBlogMutation.mutateAsync({
        id: blog._id || blog.id || blog.slug,
        isPublished: nextStatus,
      });
      notify.success({
        title: nextStatus ? "Article Published" : "Article Moved to Draft",
        message: `"${blog.title}" is now ${nextStatus ? "visible on storefront" : "hidden as draft"}.`,
      });
    } catch (error) {
      notify.error({
        title: "Update Failed",
        message: error?.message || "Could not change publication status.",
      });
    }
  };

  // Submit Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const idToDelete = deleteTarget._id || deleteTarget.id || deleteTarget.slug;
      await deleteBlogMutation.mutateAsync(idToDelete);
      notify.success({
        title: "Article Deleted",
        message: `"${deleteTarget.title}" has been removed from database.`,
      });
      setDeleteTarget(null);
    } catch (deleteErr) {
      console.error("[Blogs] Delete error:", deleteErr);
      notify.error({
        title: "Delete Failed",
        message: deleteErr?.message || "Could not delete article.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Title & Actions */}
      <AdminTitle
        kicker="CONTENT MANAGEMENT"
        title={`Blogs & News (${blogs.length})`}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-steel shadow-sm hover:border-line-dark hover:text-ink disabled:opacity-50"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              to="/admin/blogs/new"
              className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-extrabold text-ink shadow-sm transition hover:bg-gold-light active:scale-95"
            >
              <Plus size={16} /> Add Article
            </Link>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Articles" value={stats.total} sub="In database" />
        <Stat label="Live / Published" value={stats.published} sub="Visible on storefront" />
        <Stat label="Drafts" value={stats.drafts} sub="Unpublished" />
        <Stat label="Total Article Views" value={stats.totalViews.toLocaleString()} sub="Counter reads" />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, tag, slug or excerpt..."
            className="h-9 w-full rounded-lg border border-line bg-mist/50 pl-9 pr-3 text-xs font-medium text-ink outline-none transition focus:border-gold focus:bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <div className="flex items-center gap-1.5 text-xs text-steel">
            <Filter size={13} />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="h-9 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink outline-none transition focus:border-gold"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink outline-none transition focus:border-gold"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={`${th} w-16`}>Cover</th>
                <th className={th}>Article & Slug</th>
                <th className={th}>Category / Tags</th>
                <th className={th}>Status</th>
                <th className={th}>Date & Reads</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-steel">
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin text-gold" />
                    Loading articles from database...
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-steel">
                    {search || filterCat !== "all" || filterStatus !== "all"
                      ? "No articles match the current filter criteria."
                      : "No articles found in the database. Click \"+ Add Article\" to create your first post."}
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((b) => {
                  const coverUrl =
                    b.coverImage ||
                    b.img ||
                    (typeof b.coverImageObj === "string" ? b.coverImageObj : b.coverImageObj?.url);

                  const blogId = b._id || b.id || b.slug;

                  return (
                    <tr key={blogId} className="transition-colors hover:bg-mist/40">
                      {/* Cover Image Thumbnail */}
                      <td className={td}>
                        <Link
                          to={`/admin/blogs/edit/${blogId}`}
                          className="group block relative aspect-[16/10] w-20 overflow-hidden rounded border border-line bg-mist"
                          title="Click to edit article"
                        >
                          <SafeImage
                            src={coverUrl}
                            alt={b.title}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            fallbackIconSize={16}
                          />
                        </Link>
                      </td>

                      {/* Title & Slug */}
                      <td className={`${td} max-w-xs md:max-w-md`}>
                        <Link
                          to={`/admin/blogs/edit/${blogId}`}
                          className="font-bold text-ink hover:text-navy hover:underline line-clamp-1"
                        >
                          {b.title}
                        </Link>
                        <div className="mt-0.5 line-clamp-1 text-xs text-steel">
                          {b.excerpt || b.summary || "No summary provided"}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-faint">
                          <span>/news/{b.slug}</span>
                          <Link
                            to={`/news/${b.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-gold hover:underline"
                            title="Preview on Storefront"
                          >
                            <ExternalLink size={11} className="ml-0.5" />
                          </Link>
                        </div>
                      </td>

                      {/* Category & Tags */}
                      <td className={td}>
                        <div className="inline-block rounded border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                          {b.tag || b.category}
                        </div>
                        {Array.isArray(b.tags) && b.tags.length > 1 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {b.tags.slice(1, 3).map((t, i) => (
                              <span key={i} className="rounded bg-mist px-1.5 py-0.2 text-[10px] text-steel">
                                #{t}
                              </span>
                            ))}
                            {b.tags.length > 3 && (
                              <span className="text-[10px] text-faint">+{b.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status (Clickable Toggle) */}
                      <td className={td}>
                        <button
                          onClick={() => handleTogglePublish(b)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                            b.isPublished
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          title="Click to toggle published / draft status"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              b.isPublished ? "bg-green-600" : "bg-gray-400"
                            }`}
                          />
                          {b.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Date & Views */}
                      <td className={td}>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-steel">
                          <Calendar size={12} className="text-faint" />
                          {b.date || "Recent"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-faint">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {b.readTimeMinutes || 4}m
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye size={11} /> {b.viewsCount || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/blogs/edit/${blogId}`}
                            className="rounded-lg border border-line bg-white p-1.5 text-steel transition hover:border-gold hover:text-ink active:scale-95"
                            title="Edit article on full page"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(b)}
                            className="rounded-lg border border-line bg-white p-1.5 text-red-500 transition hover:border-red-400 hover:bg-red-50 active:scale-95"
                            title="Delete article"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <Modal close={() => !deleting && setDeleteTarget(null)}>
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-black text-ink">Delete Article?</h3>
            <p className="mt-1.5 text-xs text-steel">
              Are you sure you want to permanently delete:
            </p>
            <p className="mt-1 font-bold text-ink">
              "{deleteTarget.title}"
            </p>
            <p className="mt-2 text-[11px] text-faint">
              This action cannot be undone and will remove the article from the storefront and database.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-steel hover:bg-mist disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-white" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} /> Delete Article
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
