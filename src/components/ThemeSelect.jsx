import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/* Site-theme dropdown: button + styled popup list (native <select>
   popups render in raw OS blue and can't be themed). */
export default function ThemeSelect({ value, onChange, options, label, align = "left", mega = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [open ]);

  const norm = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const cur = norm.find((o) => String(o.value) === String(value)) || norm[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button" onClick={() => setOpen(!open)}
        aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-left text-[13px] font-semibold outline-none transition ${
          open ? "border-navy ring-2 ring-gold/40" : "border-line-dark hover:border-navy"
        }`}
      >
        <span className="truncate">{cur?.label}</span>
        <ChevronDown size={15} className={`shrink-0 transition-all ${open ? "rotate-180 text-navy" : "text-faint"}`} />
      </button>
      {open && (
        mega ? (
          <div role="listbox" aria-label={label}
            className="absolute left-0 top-full z-40 mt-1.5 w-[520px] max-w-[86vw] rounded-md border border-line-dark bg-white p-2 shadow-[0_16px_40px_rgba(0,32,73,0.18)]">
            <p className="px-2 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">{label}</p>
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {norm.map((o) => {
                const sel = String(o.value) === String(value);
                return (
                  <li key={o.value}>
                    <button
                      type="button" role="option" aria-selected={sel}
                      onClick={() => { onChange(o.value); setOpen(false); }}
                      className={`flex w-full items-center justify-between gap-1.5 rounded px-2.5 py-2 text-left text-[13px] transition-colors ${
                        sel ? "bg-gold/20 font-extrabold text-ink" : "font-semibold text-steel hover:bg-mist hover:text-navy"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      {sel && <Check size={14} className="shrink-0 text-navy" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : <ul role="listbox" aria-label={label}
          className={`absolute top-full z-40 mt-1.5 w-max min-w-full max-w-[min(320px,85vw)] overflow-hidden rounded-md border border-line-dark bg-white py-1 shadow-[0_16px_40px_rgba(0,32,73,0.18)] ${align === "right" ? "right-0" : "left-0"}`}>
          {norm.map((o) => {
            const sel = String(o.value) === String(value);
            return (
              <li key={o.value}>
                <button
                  type="button" role="option" aria-selected={sel}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] transition-colors ${
                    sel ? "bg-gold/15 font-extrabold text-ink" : "font-semibold text-steel hover:bg-mist hover:text-navy"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {sel && <Check size={15} className="shrink-0 text-navy" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
