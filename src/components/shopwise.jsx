import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, GitCompareArrows, Star, ShoppingCart, Clock } from "lucide-react";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import { useSite } from "../store/site.jsx";

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
  const [f, setF] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const p = products.find((x) => x.sku === enquirySku);
  const close = () => { setEnquirySku(null); setSent(false); setF({ name: "", phone: "", message: "" }); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <AnimatePresence>
      {enquirySku && p && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={close} />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-1"><p className="text-[11px] font-bold text-[#E53E00]">PRODUCT ENQUIRY • {p.sku}</p><p className="font-bold text-[15px] text-[#1A1A2E] leading-snug mt-0.5">{p.name}</p></div>
              <button onClick={close} className="p-2 border border-[#E5E7EB] rounded-lg"><X size={15} /></button>
            </div>
            {sent
              ? <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3.5">Enquiry logged. Our VIC desk replies within 4 business hours.</p>
              : (
                <form onSubmit={(e) => { e.preventDefault(); addEnquiry({ name: f.name, phone: f.phone, email: "", truck: "SKU " + p.sku, message: `[${p.sku}] ${f.message}` }); setSent(true); }} className="mt-4 grid gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <input required value={f.name} onChange={set("name")} placeholder="Full name" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
                    <input required value={f.phone} onChange={set("phone")} placeholder="Phone" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
                  </div>
                  <textarea required value={f.message} onChange={set("message")} rows={3} placeholder="Question about fitment, stock or bulk price..." className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
                  <button className="bg-[#E53E00] text-white rounded-xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#C23400] transition"><Send size={14} /> Send enquiry</button>
                </form>
              )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function CompareTray() {
  const { compare, toggleCompare, add } = useShop();
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const items = useMemo(() => compare.map((s) => products.find((p) => p.sku === s)).filter(Boolean), [compare, products]);
  if (items.length === 0) return null;

  const rows = [
    ["Price", (p) => `$${p.price.toFixed(2)}`],
    ["Was", (p) => (p.oldPrice ? `$${p.oldPrice.toFixed(2)}` : "-")],
    ["Brand", (p) => p.brand || "-"],
    ["Rating", (p) => `${p.rating} (${p.reviews})`],
    ["Stock", (p) => p.stock],
    ["Fitment", (p) => p.fit],
  ];

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-[#1A1A2E] text-white rounded-full pl-2 pr-2 py-2 shadow-2xl border border-white/10">
        <span className="flex -space-x-2 pl-2">{items.map((p) => <span key={p.sku} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 grid place-items-center text-[10px] font-black">{p.sku.slice(0, 2)}</span>)}</span>
        <span className="text-[13px] font-bold px-1">Compare ({items.length}/3)</span>
        <button onClick={() => setOpen(true)} className="bg-[#E53E00] rounded-full px-5 py-2 text-[13px] font-bold">Compare</button>
        <button onClick={() => items.forEach((p) => toggleCompare(p.sku))} className="p-2 text-white/50 hover:text-white"><X size={15} /></button>
      </div>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-4xl rounded-2xl bg-white p-6 max-h-[86vh] overflow-auto">
              <div className="flex items-center"><p className="font-display font-bold text-2xl text-[#1A1A2E]">Side by side</p><button onClick={() => setOpen(false)} className="ml-auto p-2 border border-[#E5E7EB] rounded-lg"><X size={15} /></button></div>
              <div className="mt-4 overflow-x-auto"><table className="w-full text-sm min-w-[560px]">
                <thead><tr><th className="w-28" /><th>{items.map((p) => <span key={p.sku} className="block px-2"><img src={p.image} alt="" className="w-full h-28 object-cover rounded-xl" loading="lazy" /><Link to={`/product/${p.sku}`} onClick={() => setOpen(false)} className="block font-bold text-[13px] mt-2 text-[#1A1A2E] hover:text-[#E53E00] line-clamp-2">{p.name}</Link></span>)}</th></tr></thead>
                <tbody>
                  {rows.map(([l, fn]) => <tr key={l} className="border-t border-[#F3F4F6]"><td className="py-2.5 text-[12px] font-bold text-[#9CA3AF] uppercase">{l}</td>{items.map((p) => <td key={p.sku} className="px-2 py-2.5 font-semibold text-[#1A1A2E]">{fn(p)}</td>)}</tr>)}
                  <tr className="border-t border-[#F3F4F6]"><td /><td>{items.map((p) => <span key={p.sku} className="inline-block px-2"><button onClick={() => add(p.sku)} className="bg-[#E53E00] text-white rounded-lg px-4 py-2 text-[12px] font-bold">Add to cart</button> <button onClick={() => toggleCompare(p.sku)} className="text-[12px] underline text-[#9CA3AF]">Remove</button></span>)}</td></tr>
                </tbody>
              </table></div>
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
      <p className="font-display font-bold text-[22px] text-[#1A1A2E] flex items-center gap-2"><Clock size={19} className="text-[#E53E00]" /> Recently viewed</p>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <Link key={p.sku} to={`/product/${p.sku}`} className="bg-white border border-[#E5E7EB] rounded-2xl p-3 flex gap-3 hover:border-[#E53E00]/40 transition">
            <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />
            <span><b className="block text-[13px] leading-snug text-[#1A1A2E] line-clamp-2">{p.name}</b><span className="text-[13px] font-extrabold">${p.price.toFixed(2)}</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ShopWidgets() {
  return (<><EnquiryModal /><CompareTray /></>);
}
