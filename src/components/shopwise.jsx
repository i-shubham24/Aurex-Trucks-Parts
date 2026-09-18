import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Clock, Star, Check, ShoppingCart, GitCompareArrows, Trash2 } from "lucide-react";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import { useSite } from "../store/site.jsx";
import { useGarage } from "./garage/GarageContext.jsx";

const RKEY = "aurex_recent_v1";
export const pushRecent = (sku) => {
  try {
    const arr = JSON.parse(localStorage.getItem(RKEY) || "[]");
    const next = [sku, ...arr.filter((s) => s !== sku)].slice(0, 8);
    localStorage.setItem(RKEY, JSON.stringify(next));
  } catch { /* noop */ }
};
export const getRecent = () => {
  try { const a = JSON.parse(localStorage.getItem(RKEY) || "[]"); return Array.isArray(a) ? a : []; }
  catch { return []; }
};

export function EnquiryModal() {
  const { enquirySku, setEnquirySku } = useShop();
  const { products } = useProducts();
  const { addEnquiry } = useSite();
  const { selectedVehicle, hasValidVehicle } = useGarage();
  const [f, setF] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const p = products.find((x) => x.sku === enquirySku);
  const close = () => { setEnquirySku(null); setSent(false); setF({ name: "", phone: "", message: "" }); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const rigLabel = hasValidVehicle
    ? `${selectedVehicle.year ? selectedVehicle.year + " " : ""}${selectedVehicle.make} ${selectedVehicle.model}`.trim()
    : "";

  return (
    <AnimatePresence>
      {enquirySku && p && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={close} />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-1"><p className="text-[11px] font-bold text-[#0B2F5C]">PRODUCT ENQUIRY, {p.sku}</p><p className="font-bold text-[15px] text-[#1A1A2E] leading-snug mt-0.5">{p.name}</p>
              {rigLabel && <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1"><Check size={11} /> For your {rigLabel}</p>}</div>
              <button onClick={close} className="p-2 border border-[#E5E7EB] rounded-lg"><X size={15} /></button>
            </div>
            {sent
              ? <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3.5">Enquiry logged. Our VIC desk replies within 4 business hours.</p>
              : (
                <form onSubmit={(e) => { e.preventDefault(); addEnquiry({ name: f.name, phone: f.phone, email: "", truck: rigLabel ? `${rigLabel} · SKU ${p.sku}` : "SKU " + p.sku, message: `[${p.sku}]${rigLabel ? ` [Rig: ${rigLabel}]` : ""} ${f.message}` }); setSent(true); }} className="mt-4 grid gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <input required value={f.name} onChange={set("name")} placeholder="Full name" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
                    <input required value={f.phone} onChange={set("phone")} placeholder="Phone" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
                  </div>
                  <textarea required value={f.message} onChange={set("message")} rows={3} placeholder="Question about fitment, stock or bulk price..." className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
                  <button className="bg-[#0B2F5C] text-white rounded-xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1A1A2E] transition"><Send size={14} /> Send enquiry</button>
                </form>
              )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function CompareTray() {
  const { compare, toggleCompare, add, setEnquirySku } = useShop();
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const items = useMemo(() => compare.map((s) => products.find((p) => p.sku === s)).filter(Boolean), [compare, products]);
  if (items.length === 0) return null;

  const priced = items.filter((p) => p.price != null);
  const bestSku = priced.length ? priced.reduce((a, b) => (a.price <= b.price ? a : b)).sku : null;
  const topRated = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.sku;

  const rows = [
    { label: "Price", render: (p) => (
      <span className="inline-flex flex-wrap items-center gap-2">
        {p.price == null
          ? <span className="font-display font-bold text-[17px] text-[#0B2F5C]">Enquire</span>
          : <span className="font-display font-bold text-[19px] text-[#1A1A2E]">${p.price.toFixed(2)}</span>}
        {bestSku === p.sku && <span className="text-[10px] font-black uppercase tracking-wider bg-[#10B981] text-white px-2 py-0.5">Best price</span>}
      </span>
    ) },
    { label: "Was", render: (p) => (p.oldPrice ? <span className="line-through text-[#9CA3AF]">${p.oldPrice.toFixed(2)}</span> : <span className="text-[#C7CDD6]">—</span>) },
    { label: "Brand", render: (p) => <span className="font-bold text-[#1A1A2E]">{p.brand || "—"}</span> },
    { label: "Rating", render: (p) => (
      <span className="inline-flex items-center gap-1.5">
        <span className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={12} className={s <= Math.round(p.rating || 0) ? "fill-[#E8A90C] text-[#E8A90C]" : "fill-[#E5E7EB] text-[#E5E7EB]"} />
          ))}
        </span>
        <b className="text-[#1A1A2E] text-[13px]">{p.rating}</b>
        <span className="text-[#9CA3AF] text-[12px]">({p.reviews})</span>
        {topRated === p.sku && items.length > 1 && <span className="text-[10px] font-black uppercase tracking-wider bg-[#E8EEF5] text-[#0B2F5C] px-2 py-0.5">Top rated</span>}
      </span>
    ) },
    { label: "Stock", render: (p) => (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 ${String(p.stock).includes("In stock") ? "bg-[#1A1A2E] text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${String(p.stock).includes("In stock") ? "bg-[#10B981]" : "bg-[#9CA3AF]"}`} />
        {p.stock}
      </span>
    ) },
    { label: "System", render: (p) => <span className="text-[#4B5563]">{p.cat}</span> },
    { label: "Fitment", render: (p) => <span className="text-[#4B5563] leading-snug block max-w-[220px]">{p.fit}</span> },
    { label: "OEM", render: (p) => <span className="font-mono text-[12px] text-[#4B5563]">{p.oem || "—"}</span> },
  ];

  const cols = `140px repeat(${items.length}, minmax(180px, 1fr))`;

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 max-w-[calc(100vw-2rem)] bg-[#1A1A2E] text-white rounded-full pl-2 pr-2 py-2 shadow-2xl border border-white/10">
        <span className="flex -space-x-2 pl-2">{items.map((p) => <span key={p.sku} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 grid place-items-center text-[10px] font-black">{p.sku.slice(0, 2)}</span>)}</span>
        <span className="text-[13px] font-bold px-1">Compare ({items.length}/3)</span>
        <button onClick={() => setOpen(true)} className="bg-[#0B2F5C] rounded-full px-5 py-2 text-[13px] font-bold hover:bg-[#2F5E93] transition">Compare</button>
        <button onClick={() => items.forEach((p) => toggleCompare(p.sku))} className="p-2 text-white/50 hover:text-white" aria-label="Clear compare"><X size={15} /></button>
      </div>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-3 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#1A1A2E]/70 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl bg-white shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}
            >
              {/* Header */}
              <div className="bg-[#1A1A2E] text-white px-5 sm:px-7 py-5 flex items-start gap-4 shrink-0">
                <span className="grid place-items-center w-11 h-11 bg-[#0B2F5C] shrink-0" style={{ clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)" }}>
                  <GitCompareArrows size={19} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-black tracking-[0.22em] text-[#8FB4E0] uppercase">Side by side · {items.length} of 3</p>
                  <p className="font-display font-bold text-[22px] sm:text-[26px] leading-tight">Compare the difference</p>
                  <p className="text-white/60 text-[13px] mt-0.5">Price, rating, stock and fitment — pick the right line for your truck.</p>
                </div>
                <button onClick={() => setOpen(false)} className="ml-auto p-2 border border-white/20 hover:bg-white hover:text-[#1A1A2E] transition shrink-0" aria-label="Close compare"><X size={16} /></button>
              </div>

              {/* Body */}
              <div className="overflow-auto p-5 sm:p-7">
                {/* Product header cards */}
                <div className="grid gap-3" style={{ gridTemplateColumns: cols }}>
                  <div />
                  {items.map((p) => (
                    <div key={p.sku} className="relative bg-[#F7F8FA] border border-[#E5E7EB] overflow-hidden">
                      <Link to={`/product/${p.sku}`} onClick={() => setOpen(false)} className="block aspect-[16/9] overflow-hidden bg-white">
                        <img src={p.image} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </Link>
                      <button onClick={() => toggleCompare(p.sku)} className="absolute top-2 right-2 w-7 h-7 grid place-items-center bg-white/95 border border-[#E5E7EB] text-[#6B7280] hover:text-red-600 hover:border-red-300 transition" aria-label={`Remove ${p.sku}`}>
                        <Trash2 size={13} />
                      </button>
                      <div className="p-3">
                        <p className="text-[10px] font-black tracking-[0.16em] text-[#9CA3AF] uppercase">{p.brand} · {p.sku}</p>
                        <Link to={`/product/${p.sku}`} onClick={() => setOpen(false)} className="block font-display font-bold text-[13.5px] leading-snug mt-0.5 text-[#1A1A2E] hover:text-[#0B2F5C] line-clamp-2 min-h-[38px]">{p.name}</Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Spec rows */}
                <div className="mt-3 border border-[#E5E7EB]">
                  {rows.map((r, ri) => (
                    <div key={r.label} className={`grid gap-3 items-center px-3 sm:px-4 py-3 ${ri % 2 ? "bg-[#F7F8FA]" : "bg-white"}`} style={{ gridTemplateColumns: cols }}>
                      <p className="text-[11px] font-black tracking-[0.14em] text-[#9CA3AF] uppercase">{r.label}</p>
                      {items.map((p) => <div key={p.sku} className="text-[13.5px] font-medium text-[#1A1A2E] min-w-0">{r.render(p)}</div>)}
                    </div>
                  ))}
                  {/* CTA row */}
                  <div className="grid gap-3 items-center px-3 sm:px-4 py-4 bg-[#1A1A2E]" style={{ gridTemplateColumns: cols }}>
                    <p className="text-[11px] font-black tracking-[0.14em] text-white/50 uppercase">Next step</p>
                    {items.map((p) => (
                      <div key={p.sku} className="flex flex-wrap items-center gap-2">
                        {p.price == null ? (
                          <button onClick={() => { setOpen(false); setEnquirySku(p.sku); }} className="bg-white text-[#1A1A2E] px-4 py-2.5 text-[12px] font-black hover:bg-[#8FB4E0] transition">Enquire</button>
                        ) : (
                          <button onClick={() => add(p.sku)} className="inline-flex items-center gap-1.5 bg-[#0B2F5C] border border-white/20 text-white px-4 py-2.5 text-[12px] font-black hover:bg-white hover:text-[#1A1A2E] transition">
                            <ShoppingCart size={13} /> Add to cart
                          </button>
                        )}
                        <button onClick={() => toggleCompare(p.sku)} className="text-[12px] font-semibold text-white/50 hover:text-white underline underline-offset-2">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
                  <Check size={13} className="text-[#10B981]" />
                  Prices include GST where shown. Enquire lines are quoted from our VIC desk within 4 business hours.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function RecentlyViewed({ current }) {
  const { products } = useProducts();
  const [items] = useState(() => getRecent().filter((s) => s !== current).map((s) => products.find((p) => p.sku === s)).filter(Boolean).slice(0, 4));
  if (items.length === 0) return null;
  return (
    <div className="mt-10">
      <p className="font-display font-bold text-[22px] text-[#1A1A2E] flex items-center gap-2"><Clock size={19} className="text-[#0B2F5C]" /> Recently viewed</p>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <Link key={p.sku} to={`/product/${p.sku}`} className="bg-white border border-[#E5E7EB] rounded-2xl p-3 flex gap-3 hover:border-[#0B2F5C]/40 transition">
            <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />
            <span><b className="block text-[13px] leading-snug text-[#1A1A2E] line-clamp-2">{p.name}</b><span className="text-[13px] font-extrabold">{p.price == null ? "Enquire" : `$${p.price.toFixed(2)}`}</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ShopWidgets() {
  return (<><EnquiryModal /><CompareTray /></>);
}
