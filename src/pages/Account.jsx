import { useState } from "react";
import { Link } from "react-router-dom";
import { PackageSearch, User } from "lucide-react";
import { listOrders, findOrder, orderStatus } from "../utils/orders";
import { formatAUD } from "../data/products";
import { OrderCard } from "./Track";

function TrackMini() {
  const [id, setId] = useState("");
  const [order, setOrder] = useState(null);
  const [miss, setMiss] = useState(false);
  const lookup = (e) => {
    e.preventDefault();
    const found = findOrder(id);
    setOrder(found);
    setMiss(!found);
  };
  return (
    <div className="mt-3">
      <form onSubmit={lookup} className="flex items-stretch">
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Order ID, e.g. AX-483920" className="h-11 min-w-0 flex-1 rounded-l-md border border-line-dark px-3 font-mono text-sm uppercase outline-none placeholder:normal-case placeholder:text-faint" />
        <button className="shrink-0 rounded-r-md bg-ink px-5 text-sm font-bold text-white transition-colors hover:bg-navy">Track</button>
      </form>
      {miss && <p className="mt-2 text-[13px] text-steel">No order found for that ID on this device.</p>}
      {order && (
        <div className="mt-3 rounded-md border border-line bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-sm font-extrabold">{order.id}</p>
            <p className="tabular text-sm font-extrabold text-primary">{formatAUD(order.total)}</p>
          </div>
          <ol className="mt-3 space-y-0">
            {orderStatus(order).steps.map((s, k) => (
              <li key={s} className="flex gap-2.5">
                <span className="flex flex-col items-center">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-extrabold ${k <= orderStatus(order).idx ? "bg-gold text-ink" : "bg-mist text-faint"}`}>{k < orderStatus(order).idx ? "✓" : k + 1}</span>
                  {k < 3 && <span className={`w-0.5 flex-1 ${k < orderStatus(order).idx ? "bg-gold" : "bg-line"}`} />}
                </span>
                <span className={`pb-3 text-[13px] font-bold ${k <= orderStatus(order).idx ? "" : "text-faint"}`}>{s}</span>
              </li>
            ))}
          </ol>
          <Link to="/track" className="text-[13px] font-bold text-navy underline">Full tracking page →</Link>
        </div>
      )}
    </div>
  );
}

function currentUser() {
  try { return JSON.parse(localStorage.getItem("aurex-user")); } catch { return null; }
}

export default function Orders() {
  const orders = listOrders();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">My Orders</span></p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">My orders</h1>
      <p className="mt-1 text-sm text-steel">Orders placed on this device. Keep your order ID for tracking anywhere.</p>
      {orders.length === 0 ? (
        <div className="mt-5 rounded-md border border-line bg-mist p-8 text-center">
          <p className="text-[15px] font-bold">No orders yet</p>
          <p className="mt-1 text-sm text-steel">Your placed orders will appear here with live status.</p>
          <Link to="/shop" className="mt-4 inline-block rounded bg-gold px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Shop All Products</Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">{orders.map((o) => <OrderCard key={o.id} order={o} />)}</div>
      )}
      <Link to="/track" className="mt-5 flex items-center justify-center gap-2 rounded-md border border-ink py-3 text-sm font-bold transition-colors hover:bg-ink hover:text-white"><PackageSearch size={16} /> Track an order by ID</Link>
    </main>
  );
}

export function ProfileBody() {
  const user = currentUser();
  const orders = listOrders();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Profile</span></p>
      <div className="mt-3 flex items-center gap-4 rounded-md bg-ink p-5 text-white">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold text-xl font-extrabold text-ink">{(user?.name || "G")[0].toUpperCase()}</span>
        <div>
          <h1 className="text-2xl font-extrabold">{user ? user.name : "Guest Trader"}</h1>
          <p className="text-sm text-gray-300">{user?.email || "Login to attach trade pricing and terms."}</p>
        </div>
        <span className="ml-auto hidden rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold sm:block">{orders.length} ORDERS</span>
      </div>
      <h2 className="mb-3 mt-6 flex items-center gap-2 text-xl font-extrabold"><User size={19} className="text-gold" /> All orders</h2>
      {orders.length === 0
        ? <p className="rounded-md border border-line bg-mist p-5 text-sm text-steel">No orders on this device yet. <Link to="/shop" className="font-bold text-navy underline">Shop now</Link>.</p>
        : <div className="grid gap-3 md:grid-cols-2">{orders.map((o) => <OrderCard key={o.id} order={o} />)}</div>}
      <div className="mt-6 rounded-md border border-line bg-mist p-5">
        <h2 className="flex items-center gap-2 text-xl font-extrabold"><PackageSearch size={19} className="text-gold" /> Track an order</h2>
        <TrackMini />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Link to="/orders" className="rounded border border-ink py-2.5 text-center text-sm font-bold transition-colors hover:bg-ink hover:text-white">All Orders</Link>
        <Link to="/track" className="rounded border border-ink py-2.5 text-center text-sm font-bold transition-colors hover:bg-ink hover:text-white">Track Order</Link>
        <Link to="/policies" className="rounded border border-ink py-2.5 text-center text-sm font-bold transition-colors hover:bg-ink hover:text-white">Returns Policy</Link>
      </div>
    </main>
  );
}
