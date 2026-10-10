import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, PackageCheck, ShoppingCart, Send, Volume2, VolumeX, X, ArrowRight, ShieldCheck, Mail, Tag, AlertCircle } from "lucide-react";
import { useNotification } from "../store/notification";
import { imgFor } from "../data/images";

function ToastIcon({ type, icon }) {
  if (type === "error" || icon === "error") return <AlertCircle size={18} className="text-rose-600" />;
  if (icon === "login") return <ShieldCheck size={18} className="text-emerald-600" />;
  if (icon === "mail") return <Mail size={18} className="text-emerald-600" />;
  if (icon === "tag") return <Tag size={18} className="text-emerald-600" />;
  if (icon === "order" || type === "order") return <PackageCheck size={18} className="text-emerald-600" />;
  if (icon === "cart" || type === "cart") return <ShoppingCart size={18} className="text-emerald-600" />;
  if (icon === "send") return <Send size={18} className="text-emerald-600" />;
  return <CheckCircle2 size={18} className="text-emerald-600" />;
}

function ToastItem({ toast, onDismiss, muted, onToggleMute }) {
  const [hovered, setHovered] = useState(false);
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();
  const imageSrc = toast.image || (toast.sku ? imgFor(toast.sku) : null);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const exitTimer = setTimeout(() => {
      setClosing(true);
    }, Math.max(100, toast.duration - 220));
    return () => clearTimeout(exitTimer);
  }, [toast.duration]);

  const triggerDismiss = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 180);
  };

  const handleAction = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    } else if (toast.action?.url) {
      navigate(toast.action.url);
    }
    triggerDismiss();
  };

  const isErr = toast.type === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border-2 ${
        isErr ? "border-rose-500 shadow-[0_16px_40px_rgba(0,0,0,0.08),0_4px_16px_rgba(244,63,94,0.22)] ring-1 ring-rose-500/20" : "border-emerald-500 shadow-[0_16px_40px_rgba(0,0,0,0.08),0_4px_16px_rgba(16,185,129,0.22)] ring-1 ring-emerald-500/20"
      } bg-white p-3.5 text-ink backdrop-blur-md transition-all duration-200 ${
        closing
          ? "animate-[toastSlideUp_0.18s_cubic-bezier(0.16,1,0.3,1)_forwards] pointer-events-none"
          : "animate-[toastSlideDown_0.28s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      }`}
    >
      {/* Header bar: Kicker, Mute toggle, Dismiss button */}
      <div className={`relative mb-2 flex items-center justify-between gap-2 border-b pb-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
        isErr ? "border-rose-500/20 text-rose-700" : "border-emerald-500/20 text-emerald-700"
      }`}>
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isErr ? "bg-rose-500" : "bg-emerald-500"}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${isErr ? "bg-rose-500" : "bg-emerald-500"}`} />
          </span>
          {toast.kicker || (isErr ? "ATTENTION REQUIRED" : "AUREX NOTIFICATION")}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleMute}
            title={muted ? "Unmute notification chime" : "Mute notification chime"}
            aria-label={muted ? "Unmute chime" : "Mute chime"}
            className="flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-mist hover:text-ink"
          >
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <button
            type="button"
            onClick={triggerDismiss}
            aria-label="Dismiss notification"
            className="flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-mist hover:text-ink"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Main content body */}
      <div className="relative flex items-start gap-3">
        {/* Icon or Product Thumbnail */}
        {imageSrc ? (
          <div className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 p-0.5 shadow-inner ${
            isErr ? "border-rose-500/50 bg-rose-50/50" : "border-emerald-500/50 bg-emerald-50/50"
          }`}>
            <img src={imageSrc} alt="" className="h-full w-full rounded-lg object-cover" />
            <span className={`absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full text-white shadow ${
              isErr ? "bg-rose-500" : "bg-emerald-500"
            }`}>
              <CheckCircle2 size={11} className="text-white" />
            </span>
          </div>
        ) : (
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-sm ${
            isErr ? "border-rose-500/35 bg-rose-50 text-rose-600" : "border-emerald-500/35 bg-emerald-50 text-emerald-600"
          }`}>
            <ToastIcon type={toast.type} icon={toast.icon} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold tracking-tight text-ink">
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-0.5 text-[12px] leading-snug text-steel font-medium">
              {toast.message}
            </p>
          )}

          {/* Quick Action Button */}
          {toast.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={handleAction}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-extrabold tracking-wide text-white transition-all hover:shadow-md active:scale-95 ${
                  isErr ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <span>{toast.action.label}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Animated countdown bar (shrinks over duration, pauses on hover) */}
      {toast.duration > 0 && (
        <div className={`absolute bottom-0 left-0 right-0 h-1 overflow-hidden ${isErr ? "bg-rose-100" : "bg-emerald-100"}`}>
          <div
            className={`h-full w-full origin-left animate-[toastCountdown_linear_forwards] ${isErr ? "bg-rose-500" : "bg-emerald-500"}`}
            style={{
              animationDuration: `${toast.duration}ms`,
              animationPlayState: hovered ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function NotificationCenter() {
  const { toasts, removeToast, muted, toggleMute } = useNotification();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex w-full max-w-md flex-col items-center gap-2.5 px-4"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={removeToast}
          muted={muted}
          onToggleMute={toggleMute}
        />
      ))}
    </div>
  );
}
