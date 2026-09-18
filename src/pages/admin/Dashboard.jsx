import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, Boxes, TrendingUp, AlertTriangle, Calendar, Download, RefreshCw, ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown } from "lucide-react";
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
    { title: "Total Revenue", value: `$${revenue.toFixed(2)}`, sub: `${orders.length} orders`, icon: DollarSign, trend: "+12.5%", positive: true },
    { title: "Total Orders", value: orders.length, sub: `${quotes.length} open quotes`, icon: ShoppingCart, trend: "+8.2%", positive: true },
    { title: "Active Customers", value: users.length, sub: "registered accounts", icon: Users, trend: "+4.1%", positive: true },
    { title: "Live SKUs", value: products.length, sub: `${promos.filter((p) => p.active).length} active promos`, icon: Boxes, trend: "-1.2%", positive: false },
  ];

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTick((t) => t + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const downloadCSV = () => {
    const headers = ["Order ID,Customer Email,Items,Total,Status"];
    const rows = orders.map(o => `${o.id},${o.email},${o.items.length},${o.total},${o.status}`);
    const csv = headers.concat(rows).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'aurex_orders_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">Dashboard Overview</h1>
          <p className="text-white/50 text-sm mt-1.5">Store pulse across sales, stock and enquiries.</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button onClick={() => setShowDatePicker(!showDatePicker)} className="hidden sm:flex items-center gap-2 bg-[#0C1622] border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 text-sm text-white/80 transition">
              <Calendar size={15} className="text-white/40" />
              <span>{dateRange}</span>
              <ChevronDown size={14} className="text-white/40 ml-1" />
            </button>
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#12202F] border border-white/10 rounded-xl shadow-2xl p-1 z-50">
                {["Today", "Last 7 Days", "Last 30 Days", "Year to Date"].map(range => (
                  <button key={range} onClick={() => { setDateRange(range); setShowDatePicker(false); }} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition">
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={downloadCSV} className="bg-[#0C1622] border border-white/10 rounded-xl p-2.5 text-white/70 hover:text-white hover:bg-white/10 transition" title="Export Orders CSV">
            <Download size={16} />
          </button>
          
          <button onClick={handleRefresh} className="bg-[#5B93D1] rounded-xl p-2.5 text-white hover:bg-[#9AC1EE] transition shadow-[0_0_15px_rgba(255,77,0,0.3)]" title="Refresh">
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-white/10 bg-[#0C1622] p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-5">
              <span className={`flex items-center gap-1 text-[12px] font-bold ${c.positive ? 'text-[#10B981]' : 'text-red-400'}`}>
                {c.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {c.trend}
              </span>
            </div>
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/5 text-white/60 group-hover:bg-[#5B93D1]/15 group-hover:text-[#5B93D1] transition">
              <c.icon size={20} />
            </span>
            <p className="text-[13px] font-bold text-white/50 mt-4">{c.title}</p>
            <p className="font-display font-bold text-3xl mt-1 text-white">{c.value}</p>
            <p className="text-[12px] text-white/40 mt-1">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0C1622] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-display font-bold text-lg flex items-center gap-2 text-white">
              <TrendingUp size={18} className="text-[#10B981]" /> Top Performing Products
            </p>
            <Link to="/admin/products" className="text-[12px] font-bold text-white/40 hover:text-white transition bg-white/5 px-3 py-1.5 rounded-lg">View all</Link>
          </div>
          <div className="space-y-1">
            {top.map((p) => (
              <div key={p.sku} className="flex items-center gap-4 text-sm p-2 hover:bg-white/5 rounded-xl transition group">
                <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden shrink-0">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{p.name}</p>
                  <p className="text-[12px] text-white/40 font-mono mt-0.5">{p.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-white">{p.price == null ? "POA" : `$${p.price.toFixed(2)}`}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{p.reviews} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-[#0C1622] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-display font-bold text-lg flex items-center gap-2 text-white">
              <AlertTriangle size={18} className="text-amber-400" /> Action Required
            </p>
          </div>
          <div className="space-y-1">
            {lowStock.map((p) => (
              <div key={p.sku} className="flex items-center gap-3 text-sm p-2 hover:bg-white/5 rounded-xl transition">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 rounded-md px-2 py-1 border border-amber-400/20 w-24 text-center shrink-0">{p.stock}</span>
                <span className="flex-1 truncate text-white/80">{p.name}</span>
                <Link to="/admin/products" className="text-[12px] font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition shrink-0">Restock</Link>
              </div>
            ))}
            {enquiries.filter((e) => e.status === "New").length > 0 && (
              <div className="flex items-center gap-3 text-sm p-2 hover:bg-white/5 rounded-xl transition mt-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-400/10 text-blue-400 rounded-md px-2 py-1 border border-blue-400/20 w-24 text-center shrink-0">Enquiries</span>
                <span className="flex-1 text-white/80">{enquiries.filter((e) => e.status === "New").length} new trade quote requests pending</span>
                <Link to="/admin/quotes" className="text-[12px] font-bold text-white bg-[#5B93D1] hover:bg-[#9AC1EE] px-3 py-1.5 rounded-lg transition shrink-0">Review</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0C1622] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <p className="font-display font-bold text-lg text-white">Latest Orders</p>
          <Link to="/admin/orders" className="text-[12px] font-bold text-white/40 hover:text-white transition">View all orders</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-[11px] text-white/40 uppercase tracking-widest bg-white/[0.02]">
                <th className="py-3 px-6 font-black">Order ID</th>
                <th className="py-3 px-6 font-black">Customer</th>
                <th className="py-3 px-6 font-black">Items</th>
                <th className="py-3 px-6 font-black">Total</th>
                <th className="py-3 px-6 font-black">Status</th>
                <th className="py-3 px-6 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition group">
                  <td className="py-3.5 px-6 font-mono font-bold text-white">{o.id}</td>
                  <td className="py-3.5 px-6 text-white/70">{o.email}</td>
                  <td className="py-3.5 px-6 text-white/70">{o.items.length} lines</td>
                  <td className="py-3.5 px-6 font-bold text-white">${o.total.toFixed(2)}</td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex text-[10px] font-black uppercase tracking-wider rounded-md px-2 py-1 border ${
                      o.status === 'Paid' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 
                      o.status === 'Pending' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 
                      'bg-white/10 text-white/60 border-white/10'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button className="text-white/30 hover:text-white transition p-1"><MoreHorizontal size={16} /></button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-white/40">No orders yet. Place a demo checkout to populate data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
