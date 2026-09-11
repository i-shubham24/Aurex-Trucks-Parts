import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

const KEY = "aurex_orders";
const STATUSES = ["Packed in Campbellfield VIC", "Courier booked", "In transit", "Delivered", "Cancelled"];
const load = () => { try { const v = localStorage.getItem(KEY); const a = v ? JSON.parse(v) : []; return Array.isArray(a) ? a : []; } catch { return []; } };
const seed = () => [
  { id: "AUX-4101", email: "mark@lavertonfleet.com.au", items: [{ sku: "EB10P-L", name: "10 inch Electric Backing Plate Left Hand Pre Studded", price: 71.5, qty: 4 }, { sku: "BSLM", name: "LM Holden Trailer Bearing Kit Cup and Cone", price: 12, qty: 8 }], subtotal: 382, shipping: "Standard road", shippingFee: 24, payment: "Card", total: 406, status: "In transit", placedAt: new Date(Date.now() - 86400000 * 2).toISOString(), address: { name: "Mark D.", suburb: "Laverton", state: "VIC", postcode: "3028" } },
  { id: "AUX-4102", email: "sarah@brisbanehaul.com.au", items: [{ sku: "EW3000R", name: "Electric Winch 3000lbs 12V Wireless Synthetic Rope", price: 179, qty: 1 }], subtotal: 179, shipping: "Express priority", shippingFee: 39, payment: "Afterpay", total: 218, status: "Courier booked", placedAt: new Date(Date.now() - 86400000 * 1).toISOString(), address: { name: "Sarah K.", suburb: "Brisbane", state: "QLD", postcode: "4000" } },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState(() => { const l = load(); return l.length ? l : seed(); });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [sel, setSel] = useState(null);
  const save = (list) => { setOrders(list); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} };

  const list = useMemo(() => orders.filter((o) => {
    const okS = status === "All" || o.status === status;
    const okQ = q.trim() === "" || (o.id + " " + o.email + " " + o.items.map((i) => i.sku + " " + i.name).join(" ")).toLowerCase().includes(q.toLowerCase());
    return okS && okQ;
  }), [orders, q, status]);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl">Orders</h1>
      <p className="text-white/50 text-sm mt-1">Checkout orders land here in real time. Status edits sync to customer history.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 flex-1 min-w-[220px]"><Search size={15} className="text-white/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search id, email, SKU..." className="flex-1 bg-transparent outline-none text-sm" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold outline-none">{["All", ...STATUSES].map((s) => <option key={s} className="text-black">{s}</option>)}</select>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0d1218] overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[760px]">
          <thead><tr className="text-left text-[11px] text-white/35">{["ORDER", "CUSTOMER", "ITEMS", "TOTAL", "PAYMENT", "STATUS"].map((h) => <th key={h} className="px-4 py-3 font-black tracking-widest">{h}</th>)}</tr></thead>
          <tbody>{list.map((o) => (
            <tr key={o.id} onClick={() => setSel(o)} className="border-t border-white/[0.07] hover:bg-white/[0.03] cursor-pointer">
              <td className="px-4 py-3 font-bold">{o.id}<span className="block text-[11px] text-white/35 font-medium">{new Date(o.placedAt).toLocaleDateString()}</span></td>
              <td className="px-4 py-3 text-white/60">{o.email}</td>
              <td className="px-4 py-3">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
              <td className="px-4 py-3 font-bold">${o.total.toFixed(2)}</td>
              <td className="px-4 py-3 text-white/55">{o.payment}</td>
              <td className="px-4 py-3"><span className="text-[11px] font-black bg-[#d9ff3d]/15 text-[#d9ff3d] rounded-full px-2.5 py-1">{o.status}</span></td>
            </tr>))}
          </tbody>
        </table></div>
        {list.length === 0 && <p className="p-6 text-white/40 text-sm">No orders match.</p>}
      </div>

      <AnimatePresence>
        {sel && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/75" onClick={() => setSel(null)} />
            <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-2xl rounded-[24px] border border-white/10 bg-[#0d1218] p-6 max-h-[85vh] overflow-auto">
              <div className="flex items-center"><p className="font-display font-bold text-2xl">{sel.id}</p><button onClick={() => setSel(null)} className="ml-auto p-2 border border-white/10 rounded-lg"><X size={16} /></button></div>
              <p className="text-[13px] text-white/45 mt-1">{sel.email} • {new Date(sel.placedAt).toLocaleString()} • {sel.shipping}</p>
              <div className="mt-4 space-y-2">{sel.items.map((i) => <div key={i.sku} className="flex gap-3 text-sm bg-white/[0.03] border border-white/[0.07] rounded-xl p-3"><span className="font-black">{i.qty}x</span><span className="flex-1">{i.name}<span className="block text-[11px] text-white/35">{i.sku}</span></span><b>${(i.price * i.qty).toFixed(2)}</b></div>)}</div>
              <p className="mt-3 text-[12px] font-black tracking-widest text-white/35">UPDATE STATUS</p>
              <div className="mt-2 flex flex-wrap gap-2">{STATUSES.map((s) => <button key={s} onClick={() => { const next = orders.map((o) => (o.id === sel.id ? { ...o, status: s } : o)); save(next); setSel({ ...sel, status: s }); }} className={`px-3.5 py-2 rounded-full text-[12px] font-bold border ${sel.status === s ? "bg-[#d9ff3d] text-black border-[#d9ff3d]" : "border-white/15 text-white/60"}`}>{s}</button>)}</div>
              <p className="mt-4 font-display font-bold text-xl">Total ${sel.total.toFixed(2)} <span className="text-sm text-white/40 font-body">via {sel.payment}</span></p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
