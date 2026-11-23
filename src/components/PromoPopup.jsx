import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Sparkles, Tag, Truck, X } from "lucide-react";
import useLockBody from "../utils/useLockBody";

const SESSION_KEY = "aurex_promo_popup_session_seen";
const COUPON_CODE = "AUREX10";

export default function PromoPopup() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  useLockBody(show);

  useEffect(() => {
    // Only show if not dismissed in the current browser session
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      /* private mode */
    }

    // Trigger randomly between 3.5 and 7 seconds after page loads
    const randomDelay = Math.floor(Math.random() * 3500) + 3500;
    const timer = setTimeout(() => {
      setShow(true);
    }, randomDelay);

    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setShow(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode */
    }
  };

  const handleCopyAndApply = () => {
    try {
      navigator.clipboard.writeText(COUPON_CODE);
      localStorage.setItem("aurex_applied_coupon", COUPON_CODE);
    } catch {
      /* fallback */
    }
    setCopied(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode */
    }
    setTimeout(() => {
      setShow(false);
    }, 1800);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={close}
      />

      {/* Modal Dialog */}
      <div className="relative grid grid-cols-1 max-h-[92dvh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl sm:grid-cols-[280px_minmax(0,1fr)] animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        {/* Left Column Brand Panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#001738] p-7 text-white sm:flex">
          <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
          
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-400 border border-amber-500/30">
              <Sparkles size={12} /> Limited Period
            </span>
            <div className="mt-4 font-black tracking-tight text-3xl text-white">
              10% <span className="text-amber-400">OFF</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Storewide Promotion
            </p>
          </div>

          <div className="relative space-y-3 border-t border-slate-700/60 pt-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-amber-400 shrink-0" />
              <span>Heavy trailer hardware & locks</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-amber-400 shrink-0" />
              <span>Tailgate hinges & body seals</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>Applies automatically at checkout</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close promotion"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <X size={20} />
        </button>

        {/* Main Content */}
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <div className="sm:hidden mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
              <Sparkles size={11} /> Limited Period Offer
            </span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight sm:text-[26px]">
            10% Off All Products
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            For a limited period, claim an instant <strong className="text-slate-900">10% discount</strong> on all commercial truck and trailer parts across the entire store.
          </p>

          {/* Interactive Coupon Box */}
          <div className="mt-5 rounded-lg border-2 border-dashed border-amber-400/80 bg-amber-50/50 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Your Checkout Coupon Code
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="font-mono text-2xl font-black tracking-widest text-slate-900 select-all">
                {COUPON_CODE}
              </div>
              <button
                type="button"
                onClick={handleCopyAndApply}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-[#001738] text-white hover:bg-amber-500 hover:text-slate-900"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Applied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy & Apply
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 space-y-2">
            <Link
              to="/shop"
              onClick={() => {
                handleCopyAndApply();
                close();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 shadow-sm text-center"
            >
              Shop All Products with 10% Off →
            </Link>
            <button
              type="button"
              onClick={close}
              className="w-full text-center text-xs font-medium text-slate-400 hover:text-slate-700 pt-1"
            >
              No thanks, continue browsing full price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
