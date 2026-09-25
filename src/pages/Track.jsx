import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Check, MapPin, PackageSearch, Truck } from "lucide-react";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import { findOrder, orderStatus } from "../utils/orders";

function Timeline({ order }) {
  const { steps, idx, cancelled } = orderStatus(order);
  return (
    <ol className="mt-5">
      {steps.map((s, k) => (
        <li key={s} className="flex gap-3">
          <span className="flex flex-col items-center">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-[13px] font-extrabold ring-2 ${
              cancelled ? "bg-mist text-faint ring-line" :
              k < idx ? "bg-navy text-white ring-navy" :
              k === idx ? "bg-gold text-ink ring-gold" : "bg-mist text-faint ring-line"
            }`}>
              {k < idx && !cancelled ? <Check size={15} /> : k + 1}
            </span>
            {k < steps.length - 1 && <span className={`w-0.5 min-h-8 flex-1 ${k < idx && !cancelled ? "bg-navy" : "bg-line"}`} />}
          </span>
          <span className="pb-5">
            <span className={`block text-[15px] font-extrabold ${k <= idx && !cancelled ? "text-ink" : "text-faint"}`}>{s}</span>
            {k === 0 && <span className="block text-[13px] text-faint">{new Date(order.placedAt).toLocaleString("en-AU")}</span>}
            {k === idx && !cancelled && k > 0 && <span className="block text-[13px] font-semibold text-green-700">Latest update from the courier network.</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function Track() {
  const [params] = useSearchParams();
  const paramId = params.get("id") || "";
  const [id, setId] = useState(paramId);
  const [order, setOrder] = useState(() => (paramId ? findOrder(paramId) : null));
  const [miss, setMiss] = useState(false);
  /* Stay in sync when navigating between /track?id=A and /track?id=B without a remount. */
  useEffect(() => {
    if (paramId) { setId(paramId); const found = findOrder(paramId); setOrder(found); setMiss(!found); }
  }, [paramId]);
  const lookup = (e) => {
    e.preventDefault();
    const found = findOrder(id);
    setOrder(found);
    setMiss(!found);
  };
  const st = order ? orderStatus(order) : null;
  const lines = order ? order.items || order.lines || [] : [];

  return (
    <main className="bg-mist">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Track Order</span></p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-faint">Live courier status</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Track your order</h1>
        <p className="mt-1 text-sm text-steel">Enter the order ID from your receipt, e.g. AUX-4821 or AX-483920.</p>

        <form onSubmit={lookup} className="mt-4 flex items-stretch rounded-xl border border-line bg-white p-1.5 shadow-sm focus-within:border-gold">
          <span className="grid w-11 shrink-0 place-items-center"><PackageSearch size={18} className="text-faint" /></span>
          <input value={id} onChange={(e) => setId(e.target.value)} maxLength={16} placeholder="Order ID" className="h-11 min-w-0 flex-1 bg-transparent font-mono text-[15px] font-bold uppercase outline-none placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:text-faint" />
          <button className="flex shrink-0 items-center gap-1.5 rounded-lg bg-navy px-6 text-sm font-extrabold text-white transition hover:bg-ink"><Truck size={15} /> Track</button>
        </form>

        {miss && (
          <div className="mt-4 rounded-2xl border border-line bg-white p-5 text-center">
            <p className="text-[15px] font-extrabold">No order found for “{id.trim().toUpperCase()}”</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-steel">Orders live in the browser where they were placed. Check the ID on your tax invoice, or view everything in <Link to="/orders" className="font-bold text-navy underline">My Orders</Link>.</p>
          </div>
        )}

        {order && st && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_40px_rgba(0,32,73,0.10)]">
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-mist px-5 py-4">
              <p className="font-mono text-[17px] font-extrabold text-navy">{order.id}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${st.cancelled ? "bg-red-50 text-red-700 ring-1 ring-red-200" : st.idx >= 3 ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-gold/25 text-ink ring-1 ring-gold/60"}`}>
                {st.cancelled ? "Cancelled" : ["Order placed", "Confirmed", "Dispatched", "Delivered"][st.idx]}
              </span>
              <p className="tabular ml-auto text-[17px] font-extrabold text-ink">{formatAUD(order.total)}</p>
            </div>
            <div className="p-5">
              {order.status && (
                <p className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold ${st.cancelled ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>
                  <Truck size={15} /> Live status: {order.status}
                </p>
              )}
              <Timeline order={order} />
              {lines.length > 0 && (
                <div className="rounded-xl border border-line">
                  {lines.map((l) => (
                    <p key={l.sku} className="flex items-center gap-2.5 border-b border-line px-3 py-2 text-[13px] last:border-0">
                      <span className="h-9 w-9 shrink-0 overflow-hidden rounded bg-mist">{imgFor(l.sku) && <img src={imgFor(l.sku)} alt="" className="h-full w-full object-cover" />}</span>
                      <span className="min-w-0 flex-1 truncate"><span className="font-bold">{l.qty} × </span>{l.name}</span>
                      <span className="tabular shrink-0 font-bold">{formatAUD(l.price * l.qty)}</span>
                    </p>
                  ))}
                </div>
              )}
              {(order.address || order.shipping) && (
                <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-steel">
                  <MapPin size={14} className="text-navy" />
                  {order.address ? `${order.address.address || ""}, ${order.address.suburb || ""} ${order.address.state || ""} ${order.address.postcode || ""}` : ""}
                  {order.shipping ? ` · ${order.shipping}` : ""}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/orders" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gold py-2.5 text-sm font-extrabold text-ink transition hover:bg-ink hover:text-white">View all my orders <ArrowRight size={15} /></Link>
                <Link to="/shop" className="flex-1 rounded-lg border border-ink py-2.5 text-center text-sm font-extrabold transition hover:bg-ink hover:text-white">Keep shopping</Link>
              </div>
            </div>
          </div>
        )}

        {!order && !miss && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link to="/orders" className="rounded-xl border border-line bg-white p-4 text-sm font-extrabold transition hover:border-navy hover:text-navy">My Orders: inline tracking per order →</Link>
            <Link to="/contact" className="rounded-xl border border-line bg-white p-4 text-sm font-extrabold transition hover:border-navy hover:text-navy">Missing a parcel? Contact counter →</Link>
          </div>
        )}
      </div>
    </main>
  );
}
