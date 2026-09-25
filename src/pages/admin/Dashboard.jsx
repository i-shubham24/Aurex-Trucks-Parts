import { Link } from "react-router-dom";
import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { formatAUD } from "../../data/products";
import { imgFor } from "../../data/images";
import { useAuth } from "../../store/auth";
import { useCatalog } from "../../store/catalog";
import { useSite } from "../../store/site";
import { AdminTitle, Stat, td, th } from "./AdminLayout";

export default function Dashboard() {
  const { users, orders } = useAuth();
  const { products } = useCatalog();
  const { enquiries, promos } = useSite();
  const [tick, setTick] = useState(0);

  const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const freshEnquiries = enquiries.filter((e) => e.status === "New");
  const attention = products.filter((p) => p.status === "Built to order").slice(0, 5);
  const top = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 5);
  const latest = orders.slice(0, 6);

  const csvCell = (v) => {
    const s = String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = () => {
    const rows = [["Order ID", "Customer Email", "Items", "Total", "Status"],
      ...orders.map((o) => [o.id, o.email || "guest", (o.items || o.lines || []).reduce((s, l) => s + (l.qty || 0), 0), o.total, o.status || ""])];
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aurex_orders_export.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div key={tick}>
      <AdminTitle kicker="Overview" title="Dashboard" right={
        <div className="flex gap-2">
          <button onClick={() => setTick((t) => t + 1)} className="flex items-center gap-1.5 rounded border border-line-dark px-4 py-2 text-[13px] font-bold transition-colors hover:border-navy hover:text-navy"><RefreshCw size={14} /> Refresh</button>
          <button onClick={csv} className="flex items-center gap-1.5 rounded bg-ink px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-navy"><Download size={14} /> Export CSV</button>
        </div>
      } />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Revenue" value={formatAUD(revenue)} sub={`${orders.length} orders`} />
        <Stat label="Total Orders" value={orders.length} sub={`${freshEnquiries.length} new enquiries`} />
        <Stat label="Customers" value={users.length} sub="Registered accounts" />
        <Stat label="Live SKUs" value={products.length} sub={`${promos.filter((p) => p.active).length} active promos`} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="border-2 border-ink bg-white">
          <p className="border-b-2 border-ink px-4 py-2.5 text-sm font-extrabold">Top products by reviews</p>
          {top.map((p) => (
            <div key={p.sku} className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-mist">{imgFor(p.sku) && <img src={imgFor(p.sku)} alt="" className="h-full w-full object-cover" />}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold">{p.name}</span><span className="font-mono text-[11px] text-faint">{p.sku} · {p.reviews || 0} reviews</span></span>
              <span className="tabular text-[13px] font-extrabold text-primary">{p.price == null ? "POA" : formatAUD(p.price)}</span>
            </div>
          ))}
        </div>
        <div className="border-2 border-ink bg-white">
          <p className="border-b-2 border-ink px-4 py-2.5 text-sm font-extrabold">Action required</p>
          {attention.length === 0 && freshEnquiries.length === 0 && <p className="p-4 text-sm text-steel">Nothing waiting. All lines live, no new enquiries.</p>}
          {attention.map((p) => (
            <div key={p.sku} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
              <span className="truncate text-[13px]"><span className="font-bold">{p.sku}</span> <span className="text-steel">built to order, check lead time</span></span>
              <Link to="/admin/products" className="shrink-0 text-[13px] font-bold text-navy underline">Restock →</Link>
            </div>
          ))}
          {freshEnquiries.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
              <span className="truncate text-[13px]"><span className="font-bold">{e.id}</span> <span className="text-steel">{e.name} · {e.topic}</span></span>
              <Link to="/admin/enquiries" className="shrink-0 text-[13px] font-bold text-navy underline">Review →</Link>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 border-2 border-ink bg-white">
        <div className="flex items-center justify-between border-b-2 border-ink px-4 py-2.5">
          <p className="text-sm font-extrabold">Latest orders</p>
          <Link to="/admin/orders" className="text-[13px] font-bold text-navy underline">All orders →</Link>
        </div>
        {latest.length === 0 ? <p className="p-4 text-sm text-steel">No orders yet. Checkout creates one you can track.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Lines</th><th className={th}>Total</th><th className={th}>Status</th></tr></thead>
              <tbody>
                {latest.map((o) => (
                  <tr key={o.id}>
                    <td className={td}><span className="font-mono font-bold">{o.id}</span><br /><span className="font-mono text-[11px] text-faint">{new Date(o.placedAt).toLocaleDateString("en-AU")}</span></td>
                    <td className={td}>{o.email || "guest"}</td>
                    <td className={td}>{(o.items || o.lines || []).reduce((s, l) => s + (l.qty || 0), 0)}</td>
                    <td className={td}><span className="tabular font-bold">{formatAUD(o.total)}</span></td>
                    <td className={td}>{o.status || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

