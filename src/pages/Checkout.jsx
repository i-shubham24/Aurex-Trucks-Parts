import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Landmark, ShoppingCart, Truck, Wallet } from "lucide-react";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import { useCart } from "../store/cart";
import { makeId, saveOrder } from "../utils/orders";

const SHIP = [
  { id: "standard", name: "Standard Road", desc: "Free over $500, else $24. 1 to 5 days.", fee: (t) => (t >= 500 ? 0 : 24) },
  { id: "express", name: "Express", desc: "$39 flat. VIC metro next day.", fee: () => 39 },
  { id: "pickup", name: "Click and Collect", desc: "Free. Ready in 4 hours, Campbellfield.", fee: () => 0 },
];
const PAY = [
  { id: "pickup", name: "Pay on Pickup", desc: "Card or EFT at the counter.", icon: ShoppingCart },
  { id: "transfer", name: "Bank Transfer", desc: "EFT details emailed with invoice.", icon: Landmark },
  { id: "card", name: "Card Now", desc: "Visa and Mastercard.", icon: CreditCard },
  { id: "afterpay", name: "Afterpay", desc: "Pay in 4, online only.", icon: Wallet },
  { id: "paypal", name: "PayPal", desc: "Pay with your PayPal account.", icon: Wallet },
];

export default function Checkout() {
  const { lines, total, clear } = useCart();
  const go = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", suburb: "", state: "VIC", postcode: "", notes: "" });
  const [ship, setShip] = useState("standard");
  const [pay, setPay] = useState("pickup");
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (lines.length === 0) return (
    <main className="mx-auto max-w-xl px-4 py-14 text-center">
      <Truck size={36} className="mx-auto text-faint" />
      <h1 className="mt-3 text-2xl font-extrabold">Your cart is empty</h1>
      <p className="mt-1 text-sm text-steel">Add some lines first, then come back to check out.</p>
      <Link to="/shop" className="mt-5 inline-block rounded bg-gold px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Shop All Products</Link>
    </main>
  );

  const shipFee = SHIP.find((s) => s.id === ship).fee(total);
  const grand = total + shipFee;
  const input = (bad) => `w-full rounded-md border bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-faint transition ${bad ? "border-red-500" : "border-line-dark focus:border-gold"}`;

  const place = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 1;
    if (!/^[\d\s+()]{8,}$/.test(form.phone)) errs.phone = 1;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 1;
    if (ship !== "pickup") {
      if (!form.address.trim()) errs.address = 1;
      if (!form.suburb.trim()) errs.suburb = 1;
      if (!/^\d{4}$/.test(form.postcode) && ship !== "pickup") errs.postcode = 1;
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const order = { id: makeId(), placedAt: new Date().toISOString(), customer: { ...form }, ship, pay, lines: lines.map((l) => ({ ...l })), subtotal: total, freight: shipFee, total: grand };
    saveOrder(order);
    clear();
    go(`/track?id=${order.id}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Checkout</span></p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Checkout</h1>
      <form onSubmit={place} className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-5">
          <section className="rounded-md border border-line bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">01 . Contact + Delivery</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <input value={form.name} onChange={set("name")} placeholder="Full name *" className={input(errors.name)} />
              <input value={form.phone} onChange={set("phone")} placeholder="Phone *" className={input(errors.phone)} />
              <input value={form.email} onChange={set("email")} type="email" placeholder="Email for receipt + tracking *" className={`sm:col-span-2 ${input(errors.email)}`} />
              <input value={form.address} onChange={set("address")} placeholder="Street address" className={`sm:col-span-2 ${input(errors.address)}`} />
              <input value={form.suburb} onChange={set("suburb")} placeholder="Suburb" className={input(errors.suburb)} />
              <div className="grid grid-cols-2 gap-2.5">
                <select value={form.state} onChange={set("state")} className="rounded-md border border-line-dark bg-white px-3 py-2.5 text-sm outline-none">{["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"].map((s) => <option key={s}>{s}</option>)}</select>
                <input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="Postcode" inputMode="numeric" className={input(errors.postcode)} />
              </div>
              <input value={form.notes} onChange={set("notes")} placeholder="Delivery notes or VIN (optional)" className={`sm:col-span-2 ${input(false)}`} />
            </div>
          </section>
          <section className="rounded-md border border-line bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">02 . Freight</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {SHIP.map((s) => (
                <button key={s.id} type="button" onClick={() => setShip(s.id)} className={`rounded-md border p-3.5 text-left transition-colors ${ship === s.id ? "border-navy bg-gold/15" : "border-line hover:border-navy"}`}>
                  <span className="flex items-center gap-1.5 text-sm font-bold"><Truck size={15} className="text-primary" />{s.name}</span>
                  <span className="mt-1 block text-xs text-steel">{s.desc}</span>
                  <span className="tabular mt-1.5 block text-sm font-extrabold">{s.fee(total) === 0 ? "FREE" : formatAUD(s.fee(total))}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-line bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">03 . Payment</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PAY.map((m) => (
                <button key={m.id} type="button" onClick={() => setPay(m.id)} className={`rounded-md border p-3.5 text-left transition-colors ${pay === m.id ? "border-navy bg-gold/15" : "border-line hover:border-navy"}`}>
                  <span className="flex items-center gap-1.5 text-sm font-bold"><m.icon size={15} className="text-primary" />{m.name}</span>
                  <span className="mt-1 block text-xs text-steel">{m.desc}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
        <aside className="rounded-md border border-line bg-white p-5 lg:sticky lg:top-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">Order summary</p>
          <div className="mt-3 max-h-[280px] space-y-3 overflow-auto pr-1">
            {lines.map((l) => (
              <div key={l.sku} className="flex gap-2.5">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded border border-line bg-mist">{imgFor(l.sku) && <img src={imgFor(l.sku)} alt="" className="h-full w-full object-cover" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold">{l.name}</span><span className="font-mono text-[11px] text-faint">{l.sku} × {l.qty}</span></span>
                <span className="tabular shrink-0 text-[13px] font-extrabold">{formatAUD(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <p className="flex justify-between text-steel"><span>Subtotal</span><span className="tabular font-bold text-ink">{formatAUD(total)}</span></p>
            <p className="flex justify-between text-steel"><span>Freight</span><span className="tabular font-bold text-ink">{shipFee === 0 ? "FREE" : formatAUD(shipFee)}</span></p>
            <p className="tabular flex justify-between pt-1 text-lg font-extrabold"><span>Total</span><span>{formatAUD(grand)}</span></p>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gold py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white"><CheckCircle2 size={16} /> Place Order</button>
          <p className="mt-2 text-center text-[11px] text-faint">Fitment double-checked before dispatch.</p>
        </aside>
      </form>
    </main>
  );
}
