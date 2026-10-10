import { useEffect } from "react";
import { X } from "lucide-react";
import { BrandPanel, AuthCard } from "../pages/Auth";

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onComplete,
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Background overlay click to close */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Modal Card */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-line bg-white shadow-[0_25px_60px_rgba(0,32,73,0.28)] animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-30 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-steel shadow-xs transition hover:bg-mist hover:text-ink focus:outline-none"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
          <BrandPanel />
          <AuthCard
            key={initialMode}
            mode={initialMode}
            onComplete={() => {
              if (onComplete) onComplete();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
