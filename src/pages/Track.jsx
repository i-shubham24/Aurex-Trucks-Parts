import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { PackageSearch } from "lucide-react";
import { formatAUD } from "../data/products";
import { findOrder, orderStatus } from "../utils/orders";

function Timeline({ order }) {
  const { steps, idx } = orderStatus(order);
  return (
    <ol className="mt-4 space-y-0">
      {steps.map((s, k) => (
        <li key={s} className="flex gap-3">
          <span className="flex flex-col items-center">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ${k <= idx ? "bg-gold text-ink" : "bg-mist text-faint"}`}>{k < idx ? "✓" : k + 1}</span>
            {k < steps.length - 1 && <span className={`w-0.5 flex-1 ${k < idx ? "bg-gold" : "bg-line"}`} />}
          </span>
          <span className="pb-5"><span className={`block text-sm font-bold ${k <= idx ? "" : "text-faint"}`}>{s}</span>
          {k === 0 && <span className="block text-xs text-faint">{new Date(order.placedAt).toLocaleString("en-AU")}</span>}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderCard({ order }) {
  const { idx } = orderStatus(order);
  const label = ["Order placed", "Confirmed", "Dispatched", "Delivered"][idx];
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-sm font-extrabold">{order.id}</p>
        <span className="rounded-full bg-gold/25 px-2.5 py-0.5 text-[11px] font-bold">{label}</span>
      </div>
      <p className="mt-1 text-xs text-faint">{new Date(order.placedAt).toLocaleString("en-AU")} . {order.lines.reduce((s, l) => s + l.qty, 0)} items</p>
      <div className="mt-2 space-y-1 border-t border-line pt-2">
        {order.lines.map((l) => (
          <p key={l.sku} className="flex justify-between gap-2 text-[13px]"><span className="truncate font-semibold">{l.name} <span className="font-mono font-normal text-faint">× {l.qty}</span></span><span className="tabular shrink-0 font-bold">{formatAUD(l.price * l.qty)}</span></p>
        ))}
      </div>
      <p className="tabular mt-2 flex justify-between border-t border-line pt-2 text-sm font-extrabold"><span>Total</span><span>{formatAUD(order.total)}</span></p>
    </div>
  );
}

export default function Track() {
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get("id") || "");
  const [order, setOrder] = useState(() => (params.get("id") ? findOrder(params.get("id")) : null));
  const [miss, setMiss] = useState(false);
  const lookup = (e) => {
    e.preventDefault();
    const found = findOrder(id);
    setOrder(found);
    setMiss(!found);
  };
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Track Order</span></p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Track your order</h1>
      <form onSubmit={lookup} className="mt-4 flex items-stretch">
        <span className="grid w-11 shrink-0 place-items-center rounded-l-md border border-r-0 border-line-dark bg-mist"><PackageSearch size={17} className="text-faint" /></span>
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Order ID, e.g. AX-483920" className="h-11 min-w-0 flex-1 border-y border-line-dark px-3 font-mono text-sm uppercase outline-none placeholder:normal-case placeholder:text-faint" />
        <button className="shrink-0 rounded-r-md bg-ink px-5 text-sm font-bold text-white transition-colors hover:bg-navy">Track</button>
      </form>
      {miss && <p className="mt-3 rounded-md border border-line bg-mist px-4 py-3 text-sm text-steel">No order found for that ID on this device. Orders live in the browser where they were placed.</p>}
      {order && (
        <div className="mt-4 rounded-md border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-lg font-extrabold">{order.id}</p>
            <p className="tabular text-lg font-extrabold text-primary">{formatAUD(order.total)}</p>
          </div>
          <Timeline order={order} />
          <Link to="/orders" className="mt-1 inline-block text-sm font-bold text-navy underline">View all my orders →</Link>
        </div>
      )}
    </main>
  );
}
