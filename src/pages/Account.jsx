import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, MapPin, Package, PackageSearch, RotateCcw, Truck } from "lucide-react";
import { listOrders, orderStatus } from "../utils/orders";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import { useCart } from "../store/cart";
import { useAuth } from "../store/auth";

export function useReorder() {
  const { add, setOpen } = useCart();
  return (o) => {
    (o.items || o.lines || []).forEach((i) => add({ sku: i.sku, name: i.name, price: i.price }, i.qty || 1));
    setOpen(true);
  };
}

function StatusPill({ order }) {
  const { idx, live, cancelled } = orderStatus(order);
  const label = cancelled ? "Cancelled" : ["Order placed", "Confirmed", "Dispatched", "Delivered"][idx];
  const cls = cancelled
    ? "bg-red-50 text-red-700 ring-red-200"
    : idx >= 3
      ? "bg-green-50 text-green-800 ring-green-200"
      : "bg-gold/20 text-ink ring-gold/60";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cancelled ? "bg-red-500" : idx >= 3 ? "bg-green-600" : "bg-navy"}`} />
      {label}
      {live && !cancelled && order.status ? ` · ${order.status}` : ""}
    </span>
  );
}

function InlineTrack({ order }) {
  const { steps, idx, cancelled } = orderStatus(order);
  return (
    <div className="mt-3 rounded-xl bg-mist p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-steel">Live tracking</p>
        {order.status && <p className={`text-[12px] font-bold ${cancelled ? "text-red-600" : "text-green-700"}`}>{order.status}</p>}
      </div>
      <ol className="mt-3">
        {steps.map((s, k) => (
          <li key={s} className="flex gap-3">
            <span className="flex flex-col items-center">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[12px] font-extrabold ${k <= idx && !cancelled ? "bg-navy text-white" : "bg-white text-faint ring-1 ring-line"}`}>
                {k < idx && !cancelled ? <Check size={14} /> : k + 1}
              </span>
              {k < steps.length - 1 && <span className={`w-0.5 min-h-6 flex-1 ${k < idx && !cancelled ? "bg-navy" : "bg-line"}`} />}
            </span>
            <span className="pb-4">
              <span className={`block text-[13px] font-extrabold ${k <= idx && !cancelled ? "text-ink" : "text-faint"}`}>{s}</span>
              {k === 0 && <span className="block text-[12px] text-faint">{new Date(order.placedAt).toLocaleString("en-AU")}</span>}
              {k === idx && !cancelled && (
                <span className="mt-0.5 block text-[12px] font-semibold text-green-700">Packed in Campbellfield VIC. Courier updates appear here.</span>
              )}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[13px]">
        <MapPin size={14} className="text-navy" />
        <span className="font-semibold text-steel">
          {order.address ? `${order.address.suburb || ""} ${order.address.state || ""} ${order.address.postcode || ""}`.trim() || "Delivery address on invoice" : "Delivery address on invoice"}
          {order.shipping ? ` · ${order.shipping}` : ""}
        </span>
        <Link to={`/track?id=${order.id}`} className="ml-auto font-extrabold text-navy underline">Full tracking page →</Link>
      </div>
    </div>
  );
}

function OrderCard({ order, onReorder }) {
  const [open, setOpen] = useState(false);
  const lines = order.items || order.lines || [];
  const qty = lines.reduce((s, l) => s + (l.qty || 0), 0);
  const shown = open ? lines : lines.slice(0, 3);
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_rgba(0,32,73,0.07)] transition hover:shadow-[0_16px_40px_rgba(0,32,73,0.12)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-mist px-4 py-3 sm:px-5">
        <span className="font-mono text-[15px] font-extrabold tracking-wide text-navy">{order.id}</span>
        <span className="text-[12px] text-steel">{new Date(order.placedAt).toLocaleString("en-AU")}</span>
        <span className="tabular ml-auto text-[17px] font-extrabold text-ink">{formatAUD(order.total)}</span>
      </div>
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill order={order} />
          <span className="text-[12px] font-bold text-faint">{qty} items{order.payment ? ` · ${order.payment}` : ""}</span>
        </div>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
          {shown.map((l) => (
            <li key={l.sku} className="flex items-center gap-3 px-3 py-2.5">
              <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-mist ring-1 ring-line">
                {imgFor(l.sku) ? <img src={imgFor(l.sku)} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-faint"><Package size={16} /></span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold">{l.qty} × {l.name}</span>
                <span className="font-mono text-[11px] text-faint">{l.sku}</span>
              </span>
              <span className="tabular shrink-0 text-[13px] font-extrabold">{formatAUD(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        {lines.length > 3 && (
          <button onClick={() => setOpen(!open)} className="mt-2 flex items-center gap-1 text-[13px] font-extrabold text-navy">
            {open ? "Show fewer lines" : `+ ${lines.length - 3} more lines`} <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
        {open && <InlineTrack order={order} />}
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button onClick={() => setOpen(!open)} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-extrabold transition ${open ? "bg-navy text-white" : "bg-gold text-ink hover:bg-navy hover:text-white"}`}>
            <Truck size={16} /> {open ? "Hide tracking" : "Track"}
          </button>
          <Link to={`/track?id=${order.id}`} className="flex items-center justify-center gap-1 rounded-lg border border-ink py-2.5 text-sm font-extrabold transition hover:bg-ink hover:text-white">
            Details <ArrowRight size={15} />
          </Link>
          <button onClick={() => onReorder(order)} className="flex items-center justify-center gap-2 rounded-lg border border-line-dark bg-mist py-2.5 text-sm font-extrabold transition hover:border-navy hover:text-navy">
            <RotateCcw size={15} /> Reorder
          </button>
        </div>
      </div>
    </article>
  );
}

function OrdersToolbar({ q, setQ, status, setStatus, count }) {
  return (
    <div className="grid gap-2.5 rounded-2xl border border-line bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 rounded-lg bg-mist px-3">
        <span className="grid h-10 w-6 shrink-0 place-items-center"><PackageSearch size={16} className="text-faint" /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID or part name…" className="h-10 min-w-0 flex-1 bg-transparent font-mono text-[13px] uppercase outline-none placeholder:normal-case placeholder:text-faint" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["All", "Active", "Delivered", "Cancelled"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-[12px] font-extrabold transition ${status === s ? "bg-ink text-white" : "bg-mist text-steel hover:text-ink"}`}>{s}</button>
        ))}
        <span className="ml-auto self-center rounded-full bg-ink px-3 py-1 font-mono text-[11px] font-bold text-gold">{count} ORDERS</span>
      </div>
    </div>
  );
}

export default function Orders() {
  const all = listOrders();
  const reorder = useReorder();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const orders = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((o) => {
      const st = orderStatus(o);
      if (status === "Active" && (st.cancelled || st.idx >= 3)) return false;
      if (status === "Delivered" && (st.cancelled || st.idx < 3)) return false;
      if (status === "Cancelled" && !st.cancelled) return false;
      if (!needle) return true;
      const hay = `${o.id} ${(o.items || o.lines || []).map((l) => `${l.sku} ${l.name}`).join(" ")}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [all, q, status]);

  return (
    <main className="bg-mist">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">My Orders</span></p>
        <div className="mt-3 grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="grid content-start gap-3 lg:sticky lg:top-44">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-faint">Purchase history</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">My Orders</h1>
              <p className="mt-1 text-[13px] text-steel">Every order carries an inline <span className="font-bold text-ink">Track</span> button. No need to leave this list.</p>
            </div>
            <OrdersToolbar q={q} setQ={setQ} status={status} setStatus={setStatus} count={orders.length} />
            <div className="flex flex-wrap gap-2 text-[13px] font-bold">
              <Link to="/track" className="flex-1 whitespace-nowrap rounded-lg border border-ink bg-white px-4 py-2.5 text-center transition hover:bg-ink hover:text-white">Track by ID</Link>
              <Link to="/policies" className="flex-1 whitespace-nowrap rounded-lg border border-line-dark bg-white px-4 py-2.5 text-center transition hover:border-navy hover:text-navy">Returns</Link>
            </div>
          </aside>
          <div>
            {orders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-line-dark bg-white p-10 text-center">
                <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mist"><PackageSearch size={24} className="text-faint" /></p>
                <p className="mt-3 text-[16px] font-extrabold">{all.length === 0 ? "No orders yet" : "No orders match that filter"}</p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-steel">{all.length === 0 ? "Your placed orders will appear here with live status and one-tap tracking." : "Try a different order ID or status filter."}</p>
                <Link to="/shop" className="mt-5 inline-block rounded-lg bg-gold px-6 py-2.5 text-sm font-extrabold text-ink transition hover:bg-ink hover:text-white">Shop All Products</Link>
              </div>
            ) : (
              <div className="grid items-start gap-4 xl:grid-cols-2">{orders.map((o) => <OrderCard key={o.id} order={o} onReorder={reorder} />)}</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProfileBody() {
  const { user, logout } = useAuth();
  const all = listOrders();
  const reorder = useReorder();
  const [q, setQ] = useState("");
  const orders = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((o) => `${o.id} ${(o.items || o.lines || []).map((l) => `${l.sku} ${l.name}`).join(" ")}`.toLowerCase().includes(needle));
  }, [all, q]);

  return (
    <main className="bg-mist">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Profile</span></p>
        <div className="mt-3 grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="grid content-start gap-3 lg:sticky lg:top-44">
            <div className="rounded-2xl border border-line bg-white p-5 text-center shadow-[0_10px_30px_rgba(0,32,73,0.07)]">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-navy text-2xl font-extrabold text-white">{(user?.name || "G")[0].toUpperCase()}</span>
              <h1 className="mt-2 truncate text-xl font-extrabold tracking-tight text-ink">{user ? user.name : "Guest Trader"}</h1>
              <p className="truncate text-[13px] text-steel">{user?.email || "Log in for trade pricing and order history."}{user?.company ? ` · ${user.company}` : ""}</p>
              <span className="mt-2 inline-block rounded-full bg-gold/25 px-3 py-1 text-xs font-extrabold text-ink">{all.length} ORDERS</span>
              {user && <button onClick={logout} className="mt-3 w-full rounded-lg border border-line-dark py-2 text-sm font-bold text-steel transition hover:border-navy hover:text-navy">Logout</button>}
            </div>

            {!user && (
              <div className="rounded-2xl border border-gold bg-gold/15 p-4 text-center">
                <p className="text-[13px] text-steel"><span className="font-extrabold text-ink">Log in or create an account</span> to sync orders to your email across devices.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link to="/login" className="rounded-lg bg-ink py-2 text-sm font-bold text-white hover:bg-navy">Login</Link>
                  <Link to="/signup" className="rounded-lg bg-gold py-2 text-sm font-bold text-ink hover:bg-ink hover:text-white">Sign up</Link>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Link to="/orders" className="rounded-lg border border-ink bg-white py-2 text-center text-[13px] font-bold transition hover:bg-ink hover:text-white">All Orders</Link>
              <Link to="/track" className="rounded-lg border border-ink bg-white py-2 text-center text-[13px] font-bold transition hover:bg-ink hover:text-white">Track Order</Link>
              <Link to="/policies" className="rounded-lg border border-ink bg-white py-2 text-center text-[13px] font-bold transition hover:bg-ink hover:text-white">Returns Policy</Link>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="flex items-center gap-2 text-xl font-extrabold"><Package size={19} className="text-gold" /> All orders</h2>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter orders…" className="h-10 min-w-0 flex-1 rounded-lg border border-line-dark bg-white px-3 font-mono text-[13px] uppercase outline-none placeholder:normal-case placeholder:text-faint focus:border-gold sm:max-w-xs" />
            </div>
            <div className="mt-3">
              {orders.length === 0
                ? <p className="rounded-2xl border border-line bg-white p-6 text-sm text-steel">No orders on this device yet. <Link to="/shop" className="font-bold text-navy underline">Shop now</Link>.</p>
                : <div className="grid items-start gap-4 xl:grid-cols-2">{orders.map((o) => <OrderCard key={o.id} order={o} onReorder={reorder} />)}</div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
