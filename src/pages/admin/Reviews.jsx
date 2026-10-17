import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Award,
  Package,
  MessageSquare,
  Truck,
} from "lucide-react";
import { AdminTitle, Modal, Stat, th, td } from "./AdminLayout";
import { useNotification } from "../../store/notification";
import {
  useAdminReviews,
  useToggleApprovalMutation,
  useToggleFeaturedMutation,
  useDeleteReviewMutation,
} from "../../hooks/api/useReviews";

export default function Reviews() {
  const { data, isLoading, isFetching, refetch } = useAdminReviews();
  const toggleApprovalMutation = useToggleApprovalMutation();
  const toggleFeaturedMutation = useToggleFeaturedMutation();
  const deleteReviewMutation = useDeleteReviewMutation();
  const { notify } = useNotification();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Reviews list from API
  const reviews = useMemo(() => data?.reviews || [], [data]);

  // Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { total: 0, avgRating: 0, verified: 0, featured: 0 };

    const sumRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = (sumRating / total).toFixed(1);
    const verified = reviews.filter((r) => r.isVerifiedPurchase).length;
    const featured = reviews.filter((r) => r.isFeaturedTestimonial).length;

    return { total, avgRating, verified, featured };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const nameMatch = (r.reviewerName || "").toLowerCase().includes(q);
        const commentMatch = (r.comment || "").toLowerCase().includes(q);
        const titleMatch = (r.title || "").toLowerCase().includes(q);
        const truckMatch = (r.truckModelReviewed || "").toLowerCase().includes(q);
        const orderMatch = (r.orderNumber || "").toLowerCase().includes(q);
        const prodNameMatch = (r.product?.name || "").toLowerCase().includes(q);
        const prodSkuMatch = (r.product?.sku || "").toLowerCase().includes(q);
        const userEmailMatch = (r.user?.email || "").toLowerCase().includes(q);

        if (
          !nameMatch &&
          !commentMatch &&
          !titleMatch &&
          !truckMatch &&
          !orderMatch &&
          !prodNameMatch &&
          !prodSkuMatch &&
          !userEmailMatch
        ) {
          return false;
        }
      }

      if (starFilter !== "all" && r.rating !== Number(starFilter)) {
        return false;
      }

      if (statusFilter === "approved" && !r.isApproved) return false;
      if (statusFilter === "hidden" && r.isApproved) return false;

      if (typeFilter === "verified" && !r.isVerifiedPurchase) return false;
      if (typeFilter === "featured" && !r.isFeaturedTestimonial) return false;

      return true;
    });
  }, [reviews, search, starFilter, statusFilter, typeFilter]);

  // Toggle approval / visibility
  const handleToggleApproval = async (review) => {
    try {
      await toggleApprovalMutation.mutateAsync(review._id);
      notify?.({
        type: "success",
        title: review.isApproved ? "Review Hidden" : "Review Approved",
        message: review.isApproved
          ? "This review is now hidden from storefront visitors."
          : "This review is now visible on the storefront.",
      });
    } catch (err) {
      notify?.({
        type: "error",
        title: "Action Failed",
        message: err?.message || "Failed to update review visibility.",
      });
    }
  };

  // Toggle featured testimonial on homepage
  const handleToggleFeatured = async (review) => {
    try {
      await toggleFeaturedMutation.mutateAsync(review._id);
      notify?.({
        type: "success",
        title: review.isFeaturedTestimonial ? "Removed from Home" : "Featured on Home",
        message: review.isFeaturedTestimonial
          ? "Review removed from the homepage testimonial carousel."
          : "Review will now display in the homepage testimonial carousel.",
      });
    } catch (err) {
      notify?.({
        type: "error",
        title: "Action Failed",
        message: err?.message || "Failed to toggle featured status.",
      });
    }
  };

  // Delete review
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReviewMutation.mutateAsync(deleteTarget._id);
      notify?.({
        type: "success",
        title: "Review Deleted",
        message: "The review was permanently deleted and ratings were recalculated.",
      });
      setDeleteTarget(null);
    } catch (err) {
      notify?.({
        type: "error",
        title: "Delete Failed",
        message: err?.message || "Failed to delete review.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <AdminTitle
        kicker="MANAGEMENT • CUSTOMER RATINGS"
        title="Product Reviews & Ratings"
        right={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded border border-line bg-white px-3 py-1.5 text-xs font-bold text-steel hover:border-navy hover:text-navy disabled:opacity-50"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Refresh"}</span>
          </button>
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total Reviews" value={stats.total} sub="Customer & fleet ratings" />
        <Stat
          label="Average Rating"
          value={stats.avgRating > 0 ? `${stats.avgRating} ★` : "—"}
          sub="Across catalogue"
        />
        <Stat label="Verified Orders" value={stats.verified} sub="Delivered purchase ratings" />
        <Stat label="Home Featured" value={stats.featured} sub="Homepage carousel" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-mist/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by customer, product, SKU, vehicle or comment..."
            className="w-full rounded border border-line bg-white py-1.5 pl-9 pr-3 text-xs placeholder:text-gray-400 focus:border-navy focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Star Filter */}
          <select
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value)}
            className="rounded border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-steel focus:border-navy focus:outline-none"
          >
            <option value="all">All Stars (1-5)</option>
            <option value="5">5 Stars ★★★★★</option>
            <option value="4">4 Stars ★★★★☆</option>
            <option value="3">3 Stars ★★★☆☆</option>
            <option value="2">2 Stars ★★☆☆☆</option>
            <option value="1">1 Star ★☆☆☆☆</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-steel focus:border-navy focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved (Visible)</option>
            <option value="hidden">Hidden</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-steel focus:border-navy focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="verified">Verified Purchases Only</option>
            <option value="featured">Home Featured Testimonials</option>
          </select>

          {(search || starFilter !== "all" || statusFilter !== "all" || typeFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStarFilter("all");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="text-xs font-bold text-navy hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-hidden rounded border border-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={th}>Reviewer / Customer</th>
                <th className={th}>Product / Part</th>
                <th className={th}>Rating & Feedback</th>
                <th className={th}>Badges</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-steel">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                    <span className="ml-2 font-medium">Loading customer reviews...</span>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-steel">
                    <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-bold text-ink">No reviews found</p>
                    <p className="mt-1 text-xs text-faint">
                      {search || starFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search filters above."
                        : "Verified customer reviews will appear here when submitted."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => {
                  const customerName =
                    rev.reviewerName ||
                    (rev.user?.firstName
                      ? `${rev.user.firstName} ${rev.user.lastName || ""}`.trim()
                      : "Verified Buyer");
                  const customerEmail = rev.user?.email || "";
                  const initials = customerName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr key={rev._id} className="transition-colors hover:bg-mist/30">
                      {/* Reviewer Column */}
                      <td className={td}>
                        <div className="flex items-start gap-2.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-gold/20 text-xs font-extrabold text-ink">
                            {initials || "AU"}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-ink text-xs">{customerName}</p>
                            {rev.reviewerRole && (
                              <p className="text-[11px] text-steel truncate">{rev.reviewerRole}</p>
                            )}
                            {customerEmail && (
                              <p className="font-mono text-[10px] text-faint truncate">{customerEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Product Column */}
                      <td className={td}>
                        {rev.product ? (
                          <div className="max-w-[200px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-navy">
                                {rev.product.sku}
                              </span>
                              <Link
                                to={`/product/${rev.product.sku}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-steel hover:text-navy"
                                title="View product page in new tab"
                              >
                                <ExternalLink size={11} />
                              </Link>
                            </div>
                            <p className="mt-0.5 truncate text-xs font-semibold text-ink" title={rev.product.name}>
                              {rev.product.name}
                            </p>
                            {rev.orderNumber && (
                              <p className="mt-0.5 text-[10px] text-faint">
                                Order #{rev.orderNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block rounded bg-mist px-2 py-0.5 text-[10px] font-bold text-steel">
                            Site Testimonial
                          </span>
                        )}
                      </td>

                      {/* Rating & Feedback */}
                      <td className={td}>
                        <div className="max-w-md">
                          <div className="flex items-center gap-1.5">
                            <span className="flex text-gold text-xs">
                              {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                                <span key={idx}>★</span>
                              ))}
                            </span>
                            <span className="font-bold text-xs text-ink">{rev.rating}.0</span>
                            <span className="text-[10px] text-faint">
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString("en-AU", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : ""}
                            </span>
                          </div>

                          {rev.title && (
                            <p className="mt-1 text-xs font-bold text-ink">{rev.title}</p>
                          )}

                          {rev.comment ? (
                            <p className="mt-0.5 text-xs leading-relaxed text-steel line-clamp-3">
                              "{rev.comment}"
                            </p>
                          ) : (
                            <p className="mt-0.5 text-[11px] italic text-faint">No written comment</p>
                          )}

                          {rev.truckModelReviewed && (
                            <p className="mt-1 inline-flex items-center gap-1 rounded bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-steel">
                              <Truck size={10} /> {rev.truckModelReviewed}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Badges Column */}
                      <td className={td}>
                        <div className="flex flex-col gap-1 items-start">
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <ShieldCheck size={11} className="text-emerald-600" /> Verified Order
                            </span>
                          )}
                          {rev.isFeaturedTestimonial && (
                            <span className="inline-flex items-center gap-1 rounded bg-gold/20 px-2 py-0.5 text-[10px] font-extrabold text-ink">
                              <Award size={11} className="text-gold" /> Home Carousel
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className={td}>
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold ${
                            rev.isApproved
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {rev.isApproved ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Approved
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                              Hidden
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Approval Button */}
                          <button
                            onClick={() => handleToggleApproval(rev)}
                            title={rev.isApproved ? "Hide this review" : "Approve and show review"}
                            className={`rounded p-1.5 transition-colors ${
                              rev.isApproved
                                ? "text-steel hover:bg-gray-100 hover:text-ink"
                                : "text-emerald-700 hover:bg-emerald-50 font-bold"
                            }`}
                          >
                            {rev.isApproved ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>

                          {/* Toggle Homepage Featured Testimonial */}
                          <button
                            onClick={() => handleToggleFeatured(rev)}
                            title={
                              rev.isFeaturedTestimonial
                                ? "Remove from homepage testimonial carousel"
                                : "Feature in homepage carousel"
                            }
                            className={`rounded p-1.5 transition-colors ${
                              rev.isFeaturedTestimonial
                                ? "text-gold bg-gold/15 hover:bg-gold/30"
                                : "text-steel hover:bg-gray-100 hover:text-gold"
                            }`}
                          >
                            <Star
                              size={15}
                              className={rev.isFeaturedTestimonial ? "fill-gold" : ""}
                            />
                          </button>

                          {/* Delete Review Button */}
                          <button
                            onClick={() => setDeleteTarget(rev)}
                            title="Delete review"
                            className="rounded p-1.5 text-steel transition-colors hover:bg-rose-50 hover:text-rose-600"
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal close={() => setDeleteTarget(null)}>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Delete Customer Review?</h3>
                <p className="mt-1 text-xs text-steel">
                  Are you sure you want to delete the review by{" "}
                  <strong className="text-ink">{deleteTarget.reviewerName || "this customer"}</strong>?
                </p>
                {deleteTarget.product && (
                  <p className="mt-1 text-xs text-faint">
                    Part: <span className="font-mono">{deleteTarget.product.sku}</span> — {deleteTarget.product.name}
                  </p>
                )}
                <p className="mt-2 rounded bg-rose-50 p-2.5 text-[11px] text-rose-800">
                  This action is permanent and will automatically recalculate the genuine product aggregate rating and review count.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded border border-line px-4 py-2 text-xs font-bold text-steel hover:bg-mist"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
