import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, Boxes, TrendingUp, AlertTriangle } from "lucide-react";
import { useProducts } from "../../store/products.jsx";
import { useSite } from "../../store/site.jsx";

const readOrders = () => { try { const v = localStorage.getItem("aurex_orders"); return v ? JSON.parse(v) : []; } catch { return []; } };
const readUsers = () => { try { const v = localStorage.getItem("aurex_users"); return v ? JSON.parse(v) : []; } catch { return []; } };

export default function Dashboard() {
  const { products } = useProducts();
  const { enquiries, quotes, promos } = useSite();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);
  const orders = useMemo(readOrders, [tick]);
  const users = useMemo(readUsers, [tick]);
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const lowStock = products.filter((p) => (p.stock || "").toLowerCase().includes("low") || (p.stock || "").toLowerCase().includes("built")).slice(0, 5);
  const top = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 5);
  const cards = [
    ["Revenue (orders)", `$${revenue.toFixed(2)}`, orders.length + " orders", DollarSign],
    ["Orders", orders.length, quotes.length + " open quotes", ShoppingCart],
    ["Customers", users.length, "accounts", Users],
    ["Live lines", products.length, promos.filter((p) => p.active).length + " promos on", Boxes],
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl">Good day, Admin</h1>
      <p className="text-white/50 text-sm mt-1">Store pulse across sales, stock and enquiries. All data persists in this browser.</p>
      <button onClick={() => setTick((t) => t + 1)} className="mt-3 rounded-full border border-white/15 px-5 py-2 text-[13px] font-bold hover:border-[#d9ff3d] transition">Refresh figures</button>
      <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(([t, v, s, Icon], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-[22px] border border-white/10 bg-[#0d1218] p-5">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#ff4d00]/15 text-[#ff4d00]"><Icon size={18} /></span>
            <p className="text-[12px] font-bold text-white/40 mt-3">{t}</p>
            <p className="font-display font-bold text-[28px] mt-0.5">{v}</p>
            <p className="text-[12px] text-white/40">{s}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-4">
        <div className="rounded-[22px] border border-white/10 bg-[#0d1218] p-5">
          <div className="flex items-center"><p className="font-display font-bold text-xl flex items-center gap-2"><TrendingUp size={18} className="text-[#d9ff3d]" /> Top by reviews</p><Link to="/admin/products" className="ml-auto text-[13px] font-bold text-[#d9ff3d]">Manage</Link></div>
          <div className="mt-4 space-y-2.5">{top.map((p) => <div key={p.sku} className="flex items-center gap-3 text-sm"><span className="font-black text-white/30 w-8">{p.sku.slice(0, 4)}</span><span className="flex-1 font-semibold truncate">{p.name}</span><b>${p.price.toFixed(2)}</b><span className="text-[12px] text-white/40">{p.reviews} rev</span></div>)}</div>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-[#0d1218] p-5">
          <p className="font-display font-bold text-xl flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" /> Needs attention</p>
          <div className="mt-4 space-y-2.5">
            {lowStock.map((p) => <div key={p.sku} className="flex items-center gap-3 text-sm"><span className="text-[11px] font-black bg-amber-400/15 text-amber-300 rounded-full px-2.5 py-1">{p.stock}</span><span className="flex-1 truncate">{p.name}</span><Link to="/admin/products" className="text-[12px] font-bold underline">Restock</Link></div>)}
            <div className="flex items-center gap-3 text-sm"><span className="text-[11px] font-black bg-white/10 rounded-full px-2.5 py-1">{enquiries.filter((e) => e.status === "New").length} new enquiries</span><span className="flex-1">Contact inbox needs replies</span><Link to="/admin/quotes" className="text-[12px] font-bold underline">Open</Link></div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-white/10 bg-[#0d1218] p-5">
        <p className="font-display font-bold text-xl">Latest orders</p>
        <div className="mt-3 overflow-x-auto">
          <table className="sticky-col w-full text-sm min-w-[640px]">
            <thead><tr className="text-left text-[11px] text-white/35">{["ORDER", "EMAIL", "ITEMS", "TOTAL", "STATUS"].map((h) => <th key={h} className="py-2 pr-3 font-black tracking-widest">{h}</th>)}</tr></thead>
            <tbody>{orders.slice(0, 5).map((o) => <tr key={o.id} className="border-t border-white/[0.07]"><td className="py-2.5 pr-3 font-bold">{o.id}</td><td className="pr-3 text-white/55">{o.email}</td><td className="pr-3">{o.items.length}</td><td className="pr-3 font-bold">${o.total.toFixed(2)}</td><td><span className="text-[11px] font-black bg-white/10 rounded-full px-2.5 py-1">{o.status}</span></td></tr>)}{orders.length === 0 && <tr><td colSpan={5} className="py-4 text-white/40">No orders yet. Place a demo checkout to see rows here.</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
