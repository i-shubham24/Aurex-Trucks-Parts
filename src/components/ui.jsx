import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, Check, TriangleAlert } from "lucide-react";
import { useShop } from "../store/shop.jsx";
import { useGarage } from "./garage/GarageContext.jsx";
import { fitLabel } from "../data/fitment.js";

// Styled dropdown that replaces raw select boxes. Angular house shape.
export function Dropdown({ value, options, onChange, align = "left", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="clip-cut w-full flex items-center justify-between gap-3 bg-white border-2 border-[#E5E7EB] px-4 py-3 text-sm font-bold text-[#1A1A2E] hover:border-[#E53E00] transition"
      >
        {value}
        <ChevronDown size={15} className={`text-[#9CA3AF] transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
            className={`absolute z-40 mt-1.5 min-w-full bg-white border-2 border-[#1A1A2E] shadow-elevated overflow-hidden ${align === "right" ? "right-0" : "left-0"}`}
          >
            {options.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => { onChange(o); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition ${o === value ? "bg-[#E53E00] text-white" : "text-[#1A1A2E] hover:bg-[#FFF0EB]"}`}
                >
                  {o}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// Angular fit chip. Hidden when there is no selected truck (status unknown).
export function FitChip({ status, vehicle, className = "" }) {
  if (!status || status === "unknown") return null;
  const cut = { clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))" };
  const styles = {
    fits: "bg-[#10B981] text-white",
    universal: "bg-[#1A1A2E]/85 text-white backdrop-blur",
    no: "bg-[#F59E0B] text-[#1A1A2E]",
  }[status];
  const Icon = status === "no" ? TriangleAlert : Check;
  return (
    <span style={cut} className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-wide ${styles} ${className}`}>
      <Icon size={11} /> {fitLabel(status, vehicle)}
    </span>
  );
}

export const EASE = [0.16, 1, 0.3, 1];

/* Legacy helper kept for existing call sites */
export const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
};

/* Directional scroll reveal */
export function Reveal({ children, dir = "up", delay = 0, className = "", amount = 0.2, y = 30 }) {
  const offset = {
    up: { y, x: 0 },
    down: { y: -y, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  }[dir];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* Stagger container + item */
export const staggerParent = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true, margin: "-60px" },
};
export const staggerChild = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/* Parallax hook driven by page scroll */
export function useParallax(distance = 60) {
  const { scrollY } = useScroll();
  return useTransform(scrollY, [0, 900], [0, distance]);
}

/* Thin scroll-progress bar for the top of the viewport */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[80] h-[3px] origin-left bg-gradient-to-r from-[#FF6B35] via-[#E53E00] to-[#C23400]"
    />
  );
}

/* Image that degrades to a branded tile instead of a broken icon */
export function SafeImg({ src, alt, className = "", label, wrapClass = "" }) {
  const [broken, setBroken] = useState(false);
  if (broken || !src) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-[#1A1A2E] via-[#241a2e] to-[#3a1c0c] ${className} ${wrapClass}`}>
        <span className="font-display font-black tracking-widest text-white/25 text-2xl px-4 text-center">
          {label || "AUREX"}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
      className={className}
    />
  );
}

export function SectionHead({ kicker, title, sub, link, linkLabel, center }) {
  return (
    <Reveal className={`flex flex-wrap items-end gap-5 mb-8 ${center ? "justify-center text-center" : ""}`}>
      <div className={`max-w-2xl ${center ? "mx-auto" : ""}`}>
        {kicker && (
          <p className={`text-[12px] font-black tracking-[0.22em] text-[#E53E00] uppercase mb-2 flex items-center gap-2 ${center ? "justify-center" : ""}`}>
{kicker}
          </p>
        )}
        <h2 className="font-display font-bold tracking-[-0.02em] text-[28px] sm:text-[38px] leading-[1.05] text-[#1A1A2E]">
          {title}
        </h2>
        {sub && <p className="text-[#6B7280] text-[15px] mt-2.5 leading-relaxed">{sub}</p>}
      </div>
      {link && (
        <Link
          to={link}
          className={`clip-cut ${center ? "mx-auto" : "ml-auto"} text-sm font-bold flex items-center gap-2 bg-[#F5F6F8] px-6 py-3 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white hover:gap-3 transition-all group`}
        >
          {linkLabel || "View all"}
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition" />
        </Link>
      )}
    </Reveal>
  );
}

export function Stars({ rating, reviews, size = 12 }) {
  return (
    <p className="flex items-center gap-1.5 text-[12px]">
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={size} className={s <= Math.round(rating) ? "fill-[#FFBB00] text-[#FFBB00]" : "fill-[#E5E7EB] text-[#E5E7EB]"} />
        ))}
      </span>
      <b className="text-[#1A1A2E]">{rating}</b>
      {reviews != null && <span className="text-[#9CA3AF]">({reviews})</span>}
    </p>
  );
}

/* Animated counter for statistics */
export function AnimatedCounter({ target, suffix = "", duration = 1900, className = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className={`font-display font-bold text-[34px] sm:text-[40px] text-[#1A1A2E] tabular-nums ${className}`}>
      {count}
      {suffix}
    </span>
  );
}

/* Horizontal scroll row for carousels */
export function ScrollRow({ children, className = "" }) {
  const ref = useRef(null);
  const by = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div
        ref={ref}
        className={`flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 mask-fade-x ${className}`}
      >
        {children}
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        <button onClick={() => by(-1)} aria-label="previous" className="w-11 h-11 grid place-items-center rounded-full border border-[#E5E7EB] text-[#1A1A2E] bg-white hover:bg-[#1A1A2E] hover:text-white hover:border-[#1A1A2E] transition">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => by(1)} aria-label="next" className="w-11 h-11 grid place-items-center rounded-full border border-[#E5E7EB] text-[#1A1A2E] bg-white hover:bg-[#E53E00] hover:text-white hover:border-[#E53E00] transition">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function ProductCard({ p, index = 0 }) {
  const { add, toggleCompare, compare, setEnquirySku } = useShop();
  const { fitStatus, selectedVehicle } = useGarage();
  const fit = fitStatus(p);
  const inCompare = compare.includes(p.sku);
  const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : null;
  const inStock = p.stock.includes("In stock");

  return (
    <motion.article
      variants={staggerChild}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: EASE, delay: (index % 4) * 0.06 }}
      className="group relative bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#E53E00]/30 hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F1F2F4] shine">
        <Link to={`/product/${p.sku}`} className="block w-full h-full">
          <SafeImg
            src={p.image}
            alt={p.name}
            label={p.sku}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            wrapClass="w-full h-full"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none" />

        {discount ? (
          <span className="clip-cut-sm absolute bottom-4 left-4 z-10 bg-[#E53E00] text-white text-[11px] font-black px-2.5 py-1 shadow-primary">
            -{discount}%
          </span>
        ) : p.badge ? (
          <span className="clip-cut-sm absolute bottom-4 left-4 z-10 bg-[#1A1A2E] text-white text-[11px] font-black px-2.5 py-1">
            {p.badge}
          </span>
        ) : null}

        {fit !== "unknown" && (
          <span className="absolute top-3 right-3 z-10">
            <FitChip status={fit} vehicle={selectedVehicle} />
          </span>
        )}

        <span
          className={`clip-cut-sm absolute top-3 left-3 z-10 text-[11px] font-bold px-2.5 py-1 backdrop-blur ${
            inStock ? "bg-[#1A1A2E]/90 text-white" : "bg-white/90 text-[#6B7280] border border-[#E5E7EB]"
          }`}
        >
          {p.stock}
        </span>

        <Link
          to={`/product/${p.sku}`}
          className="absolute bottom-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-white/95 border border-[#E5E7EB] text-[#1A1A2E] translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#1A1A2E] hover:text-white transition-all shadow-sm"
          aria-label="quick view"
        >
          <Eye size={15} />
        </Link>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[11px] font-semibold tracking-wide text-[#9CA3AF] uppercase">
          {p.brand ? p.brand + ", " : ""}
          {p.cat}
        </p>
        <Link
          to={`/product/${p.sku}`}
          className="font-display font-semibold text-[15px] leading-snug mt-1.5 text-[#1A1A2E] hover:text-[#E53E00] transition line-clamp-2 min-h-[42px]"
        >
          {p.name}
        </Link>
        <div className="mt-2">
          <Stars rating={p.rating} reviews={p.reviews} />
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-[#F3F4F6]">
          <p>
            <span className="font-display font-bold text-[20px] text-[#1A1A2E]">${p.price.toFixed(2)}</span>
            {p.oldPrice && (
              <span className="block text-[12px] line-through text-[#9CA3AF]">${p.oldPrice.toFixed(2)}</span>
            )}
          </p>
          <button
            onClick={() => add(p.sku)}
            className="clip-cut flex items-center gap-1.5 bg-[#E53E00] text-white px-4 py-2.5 text-[13px] font-bold hover:bg-[#1A1A2E] hover:gap-2.5 active:scale-95 transition-all"
          >
            <ShoppingCart size={14} />
            Add
          </button>
        </div>
        <div className="mt-2.5 flex gap-2">
          <button onClick={() => toggleCompare(p.sku)} className={`clip-cut-sm flex-1 py-2 text-[12px] font-bold border transition ${inCompare ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#1A1A2E] hover:text-[#1A1A2E]"}`}>{inCompare ? "Added to compare" : "Compare"}</button>
          <button onClick={() => setEnquirySku(p.sku)} className="clip-cut-sm flex-1 py-2 text-[12px] font-bold border border-[#E5E7EB] text-[#6B7280] hover:border-[#E53E00] hover:text-[#E53E00] transition">Enquire on SKU</button>
        </div>
      </div>
    </motion.article>
  );
}



/* Simple countdown for deal sections */
export function Countdown({ end }) {
  const [t, setT] = useState(() => Math.max(0, end - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setT(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(id);
  }, [end]);
  const d = Math.floor(t / 86400000);
  const h = Math.floor((t % 86400000) / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const cell = (v, l) => (
    <div className="text-center">
      <div className="w-14 h-14 rounded-xl bg-[#1A1A2E] text-white grid place-items-center font-display font-black text-xl tabular-nums">
        {String(v).padStart(2, "0")}
      </div>
      <p className="text-[10px] font-bold text-[#9CA3AF] mt-1.5 tracking-widest uppercase">{l}</p>
    </div>
  );
  return (
    <div className="flex gap-2.5">
      {cell(d, "Days")}
      {cell(h, "Hrs")}
      {cell(m, "Min")}
      {cell(s, "Sec")}
    </div>
  );
}
