import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Flame, ShieldCheck, Sparkles, Tag, Truck, X } from "lucide-react";
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

    // Trigger randomly between 4 and 7 seconds after page loads
    const randomDelay = Math.floor(Math.random() * 3000) + 4000;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={close}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Industrial Hazard / Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={close}
          aria-label="Close promotion dialog"
          className="absolute right-3.5 top-5 z-20 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-900 border border-amber-500/30">
              <Sparkles size={13} className="text-amber-600" /> Limited Time Fleet Offer
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
              <Flame size={13} /> Active Now
            </span>
          </div>

          {/* Main Headline */}
          <div className="mt-3.5">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight">
              Take <span className="text-amber-600">10% Off</span> Storewide
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
              Claim an instant discount on commercial trailer parts, door cam gear, container locks, tailgate hinges, and EPDM body rubber.
            </p>
          </div>

          {/* Premium Ticket Voucher Box */}
          <div className="relative mt-5 overflow-hidden rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-amber-950">
              <span className="flex items-center gap-1.5">
                <Tag size={13} className="text-amber-600" /> Promo Coupon Code
              </span>
              <span className="text-emerald-700 font-bold">10% Instant Saving</span>
            </div>

            <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-slate-900 select-all">
                {COUPON_CODE}
              </div>

              <button
                type="button"
                onClick={handleCopyAndApply}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={15} /> Applied!
                  </>
                ) : (
                  <>
                    <Copy size={15} /> Copy & Apply
                  </>
                )}
              </button>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              * Automatically applies to your cart and checkout total.
            </p>
          </div>

          {/* Trust Highlights Grid */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
            <div className="rounded-lg bg-slate-50 p-2">
              <Truck size={16} className="mx-auto text-amber-600" />
              <div className="mt-1 text-[11px] font-extrabold text-slate-800">$18 Flat Freight</div>
              <div className="text-[10px] text-slate-500">Australia-wide</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <Sparkles size={16} className="mx-auto text-amber-600" />
              <div className="mt-1 text-[11px] font-extrabold text-slate-800">Same-Day Dispatch</div>
              <div className="text-[10px] text-slate-500">Order by 2pm AEST</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <ShieldCheck size={16} className="mx-auto text-emerald-600" />
              <div className="mt-1 text-[11px] font-extrabold text-slate-800">Commercial Grade</div>
              <div className="text-[10px] text-slate-500">Heavy transport parts</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 space-y-2.5">
            <Link
              to="/shop"
              onClick={() => {
                handleCopyAndApply();
                close();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400 shadow-md text-center cursor-pointer"
            >
              Shop All Products with 10% Off →
            </Link>

            <button
              type="button"
              onClick={close}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-700 py-1 transition cursor-pointer"
            >
              No thanks, continue browsing at standard price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
