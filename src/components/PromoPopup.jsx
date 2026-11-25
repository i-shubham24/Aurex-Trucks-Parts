import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy, ShieldCheck, Sparkles, Truck, X, Zap } from "lucide-react";
import useLockBody from "../utils/useLockBody";

const SESSION_KEY = "aurex_promo_popup_session_seen";
const COUPON_CODE = "AUREX10";

export default function PromoPopup() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  useLockBody(show);

  const close = useCallback(() => {
    setShow(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    // Only show if not dismissed in the current browser session
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      /* private mode */
    }

    // Trigger between 4 and 7 seconds after page loads
    const randomDelay = Math.floor(Math.random() * 3000) + 4000;
    const timer = setTimeout(() => {
      setShow(true);
    }, randomDelay);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show, close]);

  const applyCoupon = () => {
    try {
      navigator.clipboard?.writeText(COUPON_CODE);
      localStorage.setItem("aurex_applied_coupon", COUPON_CODE);
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* fallback */
    }
  };

  const handleCopyAndApply = () => {
    applyCoupon();
    setCopied(true);
    setTimeout(() => {
      setShow(false);
    }, 1500);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-dark/70 backdrop-blur-[3px] transition-opacity"
        onClick={close}
      />

      {/* Modal Card */}
      <div className="popup-in relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,22,51,0.35)] ring-1 ring-black/5">
        {/* Deep Navy Header */}
        <div className="relative overflow-hidden bg-navy px-6 pt-7 pb-6 text-white sm:px-7">
          {/* Subtle decorative radial highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/15 blur-2xl"
          />

          <button
            type="button"
            onClick={close}
            aria-label="Close promotion dialog"
            className="absolute right-3.5 top-3.5 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold ring-1 ring-gold/30">
            Limited Fleet Offer
          </span>

          <h3
            id="promo-popup-title"
            className="mt-3.5 text-2xl font-extrabold tracking-tight text-white sm:text-[28px] sm:leading-tight"
          >
            Take <span className="text-gold">10% Off</span> Storewide
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-[13px]">
            Save instantly on commercial trailer parts, cam locks, tailgate hinges, and fleet hardware.
          </p>
        </div>

        {/* Gold Accent Divider */}
        <div className="h-1 w-full bg-gradient-to-r from-gold via-amber-300 to-gold-dark" />

        {/* Body */}
        <div className="p-6 sm:p-7">
          {/* Clean Coupon Strip */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-mist p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
                  Promo Code
                </p>
                <p className="mt-0.5 font-mono text-2xl font-black tracking-[0.14em] text-navy select-all">
                  {COUPON_CODE}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAndApply}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-extrabold tracking-wide transition shadow-sm cursor-pointer ${copied
                  ? "bg-emerald-600 text-white"
                  : "bg-navy text-white hover:bg-navy-dark"
                  }`}
              >
                {copied ? (
                  <>
                    <Check size={14} strokeWidth={2.5} /> Applied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy &amp; Apply
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-faint">
              Automatically applies 10% off at checkout.
            </p>
          </div>

          {/* Minimal Trust Strip */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-line py-2.5 text-[11px] font-semibold text-steel">
            <span className="inline-flex items-center gap-1.5">
              <Truck size={13} className="text-navy" /> $18 Flat Freight
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap size={13} className="text-gold-dark" /> Same-Day Dispatch
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-600" /> Commercial Grade
            </span>
          </div>

          {/* Actions */}
          <div className="mt-5 space-y-2">
            <Link
              to="/shop"
              onClick={() => {
                applyCoupon();
                close();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-extrabold text-ink shadow-sm transition hover:bg-gold-dark cursor-pointer"
            >
              <span>Shop Now with 10% Off</span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={close}
              className="w-full py-1.5 text-center text-xs font-medium text-faint transition hover:text-ink cursor-pointer"
            >
              No thanks, maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
