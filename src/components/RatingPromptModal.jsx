import { useState, useEffect, useMemo } from 'react';
import { Star, X, CheckCircle2, PackageCheck, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../store/auth';
import { usePendingReviews, useMyReviews, useSubmitReviewMutation } from '../hooks/api/useReviews';
import { useNotification } from '../store/notification';

export default function RatingPromptModal() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('aurex_access_token') || localStorage.getItem('aurex_user'));
  const { data: pendingReviews = [], isLoading } = usePendingReviews(Boolean(user || hasToken));
  const { data: myReviewsData } = useMyReviews(Boolean(user || hasToken));
  const myReviews = myReviewsData?.reviews || [];
  const submitMutation = useSubmitReviewMutation();

  const [queue, setQueue] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [initialTotal, setInitialTotal] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if current active item has an existing review
  const existingReviewForActive = useMemo(() => {
    if (!activeItem) return null;
    return myReviews.find((r) => {
      const rProdId = String(r.product?._id || r.product || '').toLowerCase();
      const rSku = String(r.product?.sku || r.sku || '').toLowerCase();
      const pProdId = String(activeItem.productId || '').toLowerCase();
      const pSku = String(activeItem.sku || '').toLowerCase();
      return (rProdId && pProdId && rProdId === pProdId) || (rSku && pSku && rSku === pSku);
    });
  }, [activeItem, myReviews]);

  // Sync existing review data if active item was already rated
  useEffect(() => {
    if (existingReviewForActive) {
      setRating(existingReviewForActive.rating || 0);
      setComment(existingReviewForActive.comment || '');
    }
  }, [existingReviewForActive]);

  // Sync pending reviews into our rating queue
  useEffect(() => {
    if (pendingReviews && pendingReviews.length > 0 && queue.length === 0 && !activeItem && !isDismissed) {
      setQueue(pendingReviews);
      setActiveItem(pendingReviews[0]);
      setInitialTotal(pendingReviews.length);
    }
  }, [pendingReviews, queue.length, activeItem, isDismissed]);

  // Listen for manual trigger (e.g. user clicked "Give Rating" on My Orders screen)
  useEffect(() => {
    const handleOpen = (e) => {
      const payload = e.detail;
      if (!payload) return;

      setIsDismissed(false);
      setIsSuccess(false);
      setRating(0);
      setHoverRating(0);
      setComment('');

      if (Array.isArray(payload.items) && payload.items.length > 0) {
        const formatted = payload.items.map((item) => ({
          orderId: payload.orderId || payload.id,
          orderNumber: payload.orderNumber || payload.id,
          productId: item.productId || item.product?._id || item.product || item._id,
          name: item.name,
          sku: item.sku,
          image: item.image,
          unitPrice: item.unitPrice || item.price,
        }));
        setQueue(formatted);
        setActiveItem(formatted[0]);
        setInitialTotal(formatted.length);
      } else {
        const single = {
          orderId: payload.orderId,
          orderNumber: payload.orderNumber,
          productId: payload.productId,
          name: payload.name,
          sku: payload.sku,
          image: payload.image,
          unitPrice: payload.unitPrice,
        };
        setQueue([single]);
        setActiveItem(single);
        setInitialTotal(1);
      }
    };

    window.addEventListener('aurex:open-rating-modal', handleOpen);
    return () => window.removeEventListener('aurex:open-rating-modal', handleOpen);
  }, []);

  // If no user, or modal is dismissed, or no active item to rate, hide modal
  if (!user || isDismissed || !activeItem) {
    return null;
  }

  const currentStepNumber = initialTotal - queue.length + 1;

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      notify?.({
        type: 'error',
        title: 'Rating Required',
        message: 'Please select a star rating (1 to 5 stars) for this delivered part.',
      });
      return;
    }

    try {
      await submitMutation.mutateAsync({
        productId: activeItem.productId,
        orderId: activeItem.orderId,
        rating,
        comment: comment.trim(),
        sku: activeItem.sku,
      });

      setIsSuccess(true);
      notify?.({
        type: 'success',
        title: 'Rating Submitted!',
        message: 'Thank you! Your genuine review helps workshops and fleet managers.',
      });

      // After brief celebration, advance to next item in queue or close if done
      setTimeout(() => {
        const remainingQueue = queue.slice(1);
        if (remainingQueue.length > 0) {
          setQueue(remainingQueue);
          setActiveItem(remainingQueue[0]);
          setRating(0);
          setHoverRating(0);
          setComment('');
          setIsSuccess(false);
        } else {
          setQueue([]);
          setActiveItem(null);
          setIsDismissed(true);
        }
      }, 1200);
    } catch (err) {
      notify?.({
        type: 'error',
        title: 'Submission Failed',
        message: err?.response?.data?.message || err?.message || 'Could not submit rating. Please try again.',
      });
    }
  };

  const ratingDescriptions = {
    1: '1 Star — Poor fit or quality',
    2: '2 Stars — Fair, had minor issues',
    3: '3 Stars — Average commercial grade',
    4: '4 Stars — Good quality & fitment',
    5: '5 Stars — Excellent commercial performance',
  };

  const activeStarCount = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-line-dark/40 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="bg-ink px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-gold/20 text-gold">
                <PackageCheck size={16} />
              </span>
              <div>
                <span className="inline-block rounded bg-gold/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-gold">
                  Delivered Order Verified
                </span>
                <h3 id="rating-modal-title" className="text-base font-bold text-white">
                  Rate Your Delivered Parts
                </h3>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Close modal and remind later"
              className="rounded p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {initialTotal > 1 && (
            <div className="mt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-2">
              <span>Item {currentStepNumber} of {initialTotal} delivered parts</span>
              <span className="text-gold font-semibold">{queue.length} remaining</span>
            </div>
          )}
        </div>

        {/* Success confirmation overlay state */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in zoom-in-95 duration-200">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-extrabold text-ink">Thank You for Your Rating!</h4>
            <p className="mt-1 text-sm text-steel max-w-sm">
              Your genuine rating for <span className="font-semibold text-ink">{activeItem.name}</span> has been posted and helps transport workshops across Australia.
            </p>
            {queue.length > 1 && (
              <p className="mt-3 text-xs font-bold text-navy flex items-center gap-1">
                Loading next delivered item ({currentStepNumber + 1} of {initialTotal}) <ChevronRight size={14} />
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Delivered Product Card */}
            <div className="flex items-center gap-4 rounded-lg border border-line bg-mist/50 p-3.5">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-white">
                <img
                  src={activeItem.image || '/placeholder-part.png'}
                  alt={activeItem.name}
                  className="h-full w-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476772/aurex_truck_parts/products/ATP-TP-62.jpg';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">
                    {activeItem.sku}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
                    <Truck size={10} /> Delivered
                  </span>
                </div>
                <h4 className="mt-0.5 truncate text-sm font-bold text-ink" title={activeItem.name}>
                  {activeItem.name}
                </h4>
                {activeItem.orderNumber && (
                  <p className="mt-0.5 text-xs text-steel">
                    Order <span className="font-mono font-medium text-ink">#{activeItem.orderNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Star Rating Section (Compulsory) */}
            <div className="mt-5 text-center">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-steel">
                Your Product Rating <span className="text-red-500">*</span>
              </label>

              <div className="mt-2.5 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-115 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={32}
                      className={`transition-colors duration-150 ${
                        star <= activeStarCount
                          ? 'fill-gold text-gold drop-shadow-xs'
                          : 'fill-transparent text-gray-300 hover:text-gold/60'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic Rating Feedback Text */}
              <div className="mt-1.5 min-h-[20px] text-xs font-semibold">
                {activeStarCount > 0 ? (
                  <span className="text-ink">{ratingDescriptions[activeStarCount]}</span>
                ) : (
                  <span className="text-faint">Click stars to rate (Required)</span>
                )}
              </div>
            </div>

            {/* Optional Written Review Section */}
            <div className="mt-4 border-t border-line pt-4">
              <div>
                <label
                  htmlFor="rating-comment"
                  className="flex items-center justify-between text-xs font-bold text-steel"
                >
                  <span>Share Your Experience</span>
                  <span className="text-[11px] font-normal text-faint">Optional</span>
                </label>
                <textarea
                  id="rating-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other workshops about fitment, finish, ease of installation, or fleet durability..."
                  className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-xs text-ink placeholder:text-gray-400 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  maxLength={1000}
                />
              </div>
            </div>

            {/* Genuine Review Notice */}
            <div className="mt-4 flex items-start gap-2 rounded bg-mist/80 p-2.5 text-[11px] text-steel">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>
                As a verified buyer, your rating updates this product's genuine score and helps linehaul fleets and local workshops choose reliable parts.
              </span>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-bold text-steel underline-offset-4 hover:text-ink hover:underline"
              >
                Remind Me Later
              </button>

              <button
                type="submit"
                disabled={!rating || submitMutation.isPending}
                className={`flex items-center justify-center gap-2 rounded px-5 py-2.5 text-xs font-extrabold transition-all shadow-xs ${
                  !rating || submitMutation.isPending
                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                    : 'bg-gold text-ink hover:bg-navy hover:text-white'
                }`}
              >
                {submitMutation.isPending ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>{existingReviewForActive ? 'Update Rating' : 'Submit Rating'} {comment ? '& Review' : ''} →</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
