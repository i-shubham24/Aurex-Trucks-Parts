import { useState } from "react";
import { formatAUD } from "../../data/products";
import { useAuth } from "../../store/auth";
import { ORDER_STATUSES } from "../../utils/orders";
import { AdminTitle, Empty, Modal, td, th } from "./AdminLayout";

export default function Orders() {
  const { orders, setOrders } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [sel, setSel] = useState(null);

  const query = q.toLowerCase().trim();
  const list = orders.filter((o) => {
    if (status !== "All" && o.status !== status) return false;
    if (!query) return true;
    const hay = `${o.id} ${o.email || ""} ${(o.items || o.lines || []).map((l) => `${l.sku} ${l.name}`).join(" ")}`.toLowerCase();
    return hay.includes(query);
  });

  const applyStatus = (id, s) => {
    setOrders((all) => all.map((o) => (o.id === id ? { ...o, status: s } : o)));
    setSel((cur) => (cur && cur.id === id ? { ...cur, status: s } : cur));
  };

  const input = "h-11 rounded-md border border-line-dark bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold";
  return (
    <div>
      <AdminTitle kicker="Sales" title={`Orders (${orders.length})`} />
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, email, SKU…" className={`${input} min-w-52 flex-1`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={input} aria-label="Status">
          <option>All</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {list.length === 0 ? <Empty text="No orders match. Checkout creates one you can track." /> : (
        <div className="overflow-x-auto border-2 border-ink bg-white">
          <table className="w-full min-w-[760px] border-collapse">
            <thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Items</th><th className={th}>Total</th><th className={th}>Payment</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} onClick={() => setSel(o)} className="cursor-pointer transition-colors hover:bg-mist">
                  <td className={td}><span className="font-mono font-bold text-navy underline">{o.id}</span><br /><span className="font-mono text-[11px] text-faint">{new Date(o.placedAt).toLocaleString("en-AU")}</span></td>
                  <td className={td}>{o.email || "guest"}</td>
                  <td className={td}>{(o.items || o.lines || []).reduce((s, l) => s + (l.qty || 0), 0)}</td>
                  <td className={td}><span className="tabular font-bold">{formatAUD(o.total)}</span></td>
                  <td className={td}>{o.payment || "—"}</td>
                  <td className={td}><span className={`px-2 py-0.5 text-[11px] font-bold ${o.status === "Cancelled" ? "bg-red-100 text-red-700" : o.status === "Delivered" ? "bg-green-100 text-green-800" : "bg-gold/25 text-ink"}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 font-mono text-[11px] text-faint">STATUS EDITS SYNC TO CUSTOMER TRACKING INSTANTLY.</p>
      {sel && (
        <Modal close={() => setSel(null)} wide>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">Order detail</p>
          <h2 className="mt-1 font-mono text-xl font-extrabold">{sel.id}</h2>
          <p className="mt-1 text-[13px] text-steel">{sel.email || "guest"} · {new Date(sel.placedAt).toLocaleString("en-AU")} · {sel.shipping} · {sel.payment}</p>
          {sel.address && <p className="mt-1 text-[13px] text-steel">{sel.address.name}, {sel.address.address}, {sel.address.suburb} {sel.address.state} {sel.address.postcode} · {sel.address.phone}</p>}
          <div className="mt-3 space-y-1.5 border-y border-line py-3 text-sm">
            {(sel.items || sel.lines || []).map((l) => (
              <p key={l.sku} className="flex justify-between gap-3"><span>{l.qty} × {l.name} <span className="font-mono text-[11px] text-faint">{l.sku}</span></span><span className="tabular shrink-0 font-bold">{formatAUD(l.price * l.qty)}</span></p>
            ))}
          </div>
          <p className="tabular mt-2 flex justify-between text-base font-extrabold"><span>Total</span><span>{formatAUD(sel.total)}</span></p>
          <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-faint">Update status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ORDER_STATUSES.map((s) => (
              <button key={s} onClick={() => applyStatus(sel.id, s)}
                className={`border px-3 py-1.5 text-[12px] font-bold transition-colors ${sel.status === s ? "border-navy bg-navy text-white" : "border-line-dark hover:border-navy hover:text-navy"}`}>{s}</button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
