import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Landmark, Truck, Wallet } from "lucide-react";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import { useCompany } from "../store/site";
import { useCart } from "../store/cart";
import { useAuth } from "../store/auth";
import { useSite } from "../store/site";
import ThemeSelect from "../components/ThemeSelect";

const STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRx = /^0[45]\d{8}$|^0[2378]\d{8}$/;
const pcRx = /^\d{4}$/;

const PAYMENTS = [
  { id: "Card", name: "Card", desc: "Visa and Mastercard. Demo only, never charged.", icon: CreditCard },
  { id: "Bank transfer", name: "Bank Transfer", desc: "EFT details emailed with invoice.", icon: Landmark },
  { id: "Afterpay", name: "Afterpay", desc: "Pay in 4, online only.", icon: Wallet },
  { id: "30 day fleet terms", name: "30 Day Fleet Terms", desc: "Approved trade accounts only.", icon: Truck },
];

const digits = (v) => v.replace(/\D/g, "");

export default function Checkout() {
  const { lines, total, clear } = useCart();
  const COMPANY = useCompany();
  const { user, placeOrder } = useAuth();
  const { settings, promos } = useSite();
  const go = useNavigate();

  const SHIP = [
    { id: "Standard road", name: "Standard Road", desc: `Free over ${formatAUD(settings.freeFreightOver)}, else ${formatAUD(settings.standardFee)}. 1 to 5 days.`, fee: (t) => (t >= settings.freeFreightOver ? 0 : settings.standardFee) },
    { id: "Express priority", name: "Express", desc: `${formatAUD(settings.expressFee)} flat. VIC metro next day.`, fee: () => settings.expressFee },
    { id: "Click and Collect VIC", name: "Click and Collect", desc: "Free. Ready in 4 hours, Campbellfield.", fee: () => 0 },
  ];

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", suburb: "", state: "VIC", postcode: "", notes: "" });
  const [ship, setShip] = useState(SHIP[0].id);
  const [pay, setPay] = useState("Card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [err, setErr] = useState("");
  const [fieldErrs, setFieldErrs] = useState({});
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState(null);
  const [promoErr, setPromoErr] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name || "", email: f.email || user.email || "", phone: f.phone || user.phone || "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (lines.length === 0) return (
    <main className="mx-auto max-w-xl px-4 py-14 text-center">
      <Truck size={36} className="mx-auto text-faint" />
      <h1 className="mt-3 text-2xl font-extrabold">Your cart is empty</h1>
      <p className="mt-1 text-sm text-steel">Add some lines first, then come back to check out.</p>
      <Link to="/shop" className="mt-5 inline-block rounded bg-gold px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Shop All Products</Link>
    </main>
  );

  const shipOpt = SHIP.find((s) => s.id === ship) || SHIP[0];
  const shipFee = shipOpt.fee(total);
  const discount = promo ? Math.round((total * promo.pct) / 100) : 0;
  const grand = total - discount + shipFee;
  const input = (bad) => `w-full rounded-md border bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-faint transition ${bad ? "border-red-500" : "border-line-dark focus:border-gold"}`;

  const setNum = (v) => setCard((c) => ({ ...c, number: digits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") }));
  const setExp = (v) => {
    const d = digits(v).slice(0, 4);
    setCard((c) => ({ ...c, expiry: d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d }));
  };

  const place = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 1;
    if (!emailRx.test(form.email.trim())) errs.email = 1;
    if (!phoneRx.test(form.phone.replace(/\s/g, ""))) errs.phone = 1;
    if (ship !== "Click and Collect VIC") {
      if (!form.address.trim()) errs.address = 1;
      if (!form.suburb.trim()) errs.suburb = 1;
      if (!pcRx.test(form.postcode)) errs.postcode = 1;
    }
    if (pay === "Card") {
      if (digits(card.number).length < 15) errs.card = "Enter the 16-digit demo card number.";
      else if (card.expiry.length !== 5) errs.card = "Enter expiry as MM/YY.";
      else if (Number(card.expiry.slice(0, 2)) < 1 || Number(card.expiry.slice(0, 2)) > 12) errs.card = "Expiry month must be 01 to 12.";
      else if (card.cvv.length < 3) errs.card = "Enter the 3-digit CVV.";
    }
    setFieldErrs(errs);
    const first = errs.card || (Object.keys(errs).length ? "Check the highlighted fields and try again." : "");
    setErr(first);
    if (Object.keys(errs).length) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const order = placeOrder({
      items: lines.map((l) => ({ sku: l.sku, name: l.name, price: l.price, qty: l.qty })),
      subtotal: total, discount, promoCode: promo ? promo.code : null,
      shipping: shipOpt.id, shippingFee: shipFee, payment: pay, total: grand, address: { ...form },
    });
    clear();
    go(`/order-success/${order.id}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Checkout</span></p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Checkout</h1>
      {!user && (
        <p className="mt-3 rounded-md border border-gold bg-gold/15 px-4 py-3 text-sm text-steel">
          Checking out as a guest. <Link to="/login" className="font-bold text-navy underline">Login</Link> or <Link to="/signup" className="font-bold text-navy underline">create an account</Link> to check out faster and keep order history.
        </p>
      )}
      {err && <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</p>}
      <form onSubmit={place} className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-5">
          <section className="rounded-md border border-line bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">01 . Contact + Delivery</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <input value={form.name} onChange={set("name")} maxLength={80} placeholder="Full name *" className={input(fieldErrs.name)} />
              <input value={form.phone} onChange={set("phone")} maxLength={20} placeholder="Phone (04XX XXX XXX) *" className={input(fieldErrs.phone)} />
              <input value={form.email} onChange={set("email")} type="email" maxLength={120} placeholder="Email for receipt + tracking *" className={`sm:col-span-2 ${input(fieldErrs.email)}`} />
              <input value={form.address} onChange={set("address")} maxLength={120} placeholder="Street address *" className={`sm:col-span-2 ${input(fieldErrs.address)}`} />
              <input value={form.suburb} onChange={set("suburb")} maxLength={60} placeholder="Suburb *" className={input(fieldErrs.suburb)} />
              <div className="grid grid-cols-2 gap-2.5">
                <ThemeSelect value={form.state} onChange={(v) => setForm({ ...form, state: v })} options={STATES} label="State" />
                <input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: digits(e.target.value).slice(0, 4) })} placeholder="Postcode *" inputMode="numeric" className={`h-11 ${input(fieldErrs.postcode)}`} />
              </div>
              <input value={form.notes} onChange={set("notes")} maxLength={300} placeholder="Delivery notes or VIN (optional)" className={`sm:col-span-2 ${input(false)}`} />
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
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PAYMENTS.map((m) => (
                <button key={m.id} type="button" onClick={() => setPay(m.id)} className={`rounded-md border p-3.5 text-left transition-colors ${pay === m.id ? "border-navy bg-gold/15" : "border-line hover:border-navy"}`}>
                  <span className="flex items-center gap-1.5 text-sm font-bold"><m.icon size={15} className="text-primary" />{m.name}</span>
                  <span className="mt-1 block text-xs text-steel">{m.desc}</span>
                </button>
              ))}
            </div>
            {pay === "Card" && (
              <div className="mt-3 grid gap-2.5 rounded-md bg-mist p-4">
                <p className="text-xs font-bold text-steel">Demo card form. Do not enter real card details. You will not be charged.</p>
                <input value={card.number} onChange={(e) => setNum(e.target.value)} onPaste={(e) => e.preventDefault()} inputMode="numeric" placeholder="Card number" className={input(fieldErrs.card)} />
                <div className="grid grid-cols-2 gap-2.5">
                  <input value={card.expiry} onChange={(e) => setExp(e.target.value)} onPaste={(e) => e.preventDefault()} inputMode="numeric" placeholder="MM/YY" className={input(fieldErrs.card)} />
                  <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: digits(e.target.value).slice(0, 4) })} onPaste={(e) => e.preventDefault()} type="password" inputMode="numeric" placeholder="CVV" className={input(fieldErrs.card)} />
                </div>
              </div>
            )}
          </section>
        </div>
        <aside className="rounded-md border border-line bg-white p-5 lg:sticky lg:top-44">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">Order summary</p>
          <div className="mt-3 max-h-[280px] space-y-3 overflow-auto pr-1">
            {lines.map((l) => (
              <div key={l.sku} className="flex gap-2.5">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded border border-line bg-mist">{imgFor(l.sku) && <img src={imgFor(l.sku)} alt={l.name} className="h-full w-full object-cover" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold">{l.name}</span><span className="font-mono text-[11px] text-faint">{l.sku} × {l.qty}</span></span>
                <span className="tabular shrink-0 text-[13px] font-extrabold">{formatAUD(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-line pt-3">
            {promo ? (
              <p className="flex items-center justify-between rounded-md bg-green-50 px-3 py-2 text-sm">
                <span className="font-mono font-extrabold text-green-800">{promo.code} · −{promo.pct}%</span>
                <button type="button" onClick={() => { setPromo(null); setPromoCode(""); }} className="text-[12px] font-bold text-faint underline hover:text-ink">Remove</button>
              </p>
            ) : (
              <>
                <div className="flex gap-2">
                  <input value={promoCode} onChange={(e) => { setPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16)); setPromoErr(""); }} placeholder="Promo code, e.g. WELCOME10" aria-label="Promo code" className="h-10 min-w-0 flex-1 rounded-md border border-line-dark bg-white px-3 font-mono text-[13px] uppercase outline-none placeholder:normal-case placeholder:text-faint focus:border-gold" />
                  <button type="button" onClick={() => {
                    const hit = promos.find((p) => p.active && p.code === promoCode.trim().toUpperCase());
                    if (!hit) { setPromoErr("That code is not active. Check the spelling or ask the counter."); return; }
                    setPromo(hit); setPromoErr("");
                  }} className="shrink-0 rounded-md border border-ink px-4 text-[13px] font-bold transition-colors hover:bg-ink hover:text-white">Apply</button>
                </div>
                {promoErr && <p className="mt-1.5 text-[12px] font-semibold text-red-600">{promoErr}</p>}
              </>
            )}
          </div>
          <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <p className="flex justify-between text-steel"><span>Subtotal</span><span className="tabular font-bold text-ink">{formatAUD(total)}</span></p>
            {promo && <p className="flex justify-between text-green-700"><span>Promo ({promo.code})</span><span className="tabular font-bold">−{formatAUD(discount)}</span></p>}
            <p className="flex justify-between text-steel"><span>Freight ({shipOpt.name})</span><span className="tabular font-bold text-ink">{shipFee === 0 ? "FREE" : formatAUD(shipFee)}</span></p>
            <p className="tabular flex justify-between pt-1 text-lg font-extrabold"><span>Total</span><span>{formatAUD(grand)}</span></p>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gold py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white"><CheckCircle2 size={16} /> Place Order</button>
          <p className="mt-2 text-center text-[11px] text-faint">Fitment double-checked before dispatch. {COMPANY.phone}.</p>
        </aside>
      </form>
    </main>
  );
}
