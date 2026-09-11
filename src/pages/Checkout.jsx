import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Truck, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { useShop } from "../store/shop.jsx";
import { useAuth } from "../store/auth.jsx";

const SHIPPING = [
  { id: "Standard", label: "Standard road", eta: "1 to 5 days by zone", fee: (t) => (t >= 500 ? 0 : 24) },
  { id: "Express", label: "Express priority", eta: "1 to 2 days metro", fee: () => 39 },
  { id: "Pickup", label: "Click and Collect VIC", eta: "Ready in 4 hours", fee: () => 0 },
];
const PAYMENTS = ["Card", "Bank transfer", "Afterpay", "30 day fleet terms"];

export function CheckoutPage() {
  const { cart, total, count, setCart } = useShop();
  const { user, placeOrder } = useAuth();
  const nav = useNavigate();
  const [ship, setShip] = useState(SHIPPING[0].id);
  const [pay, setPay] = useState(PAYMENTS[0]);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", address: "", suburb: "", state: "VIC", postcode: "", notes: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const shipOpt = SHIPPING.find((s) => s.id === ship);
  const fee = useMemo(() => shipOpt.fee(total), [shipOpt, total]);
  const grand = total + fee;

  if (cart.length === 0) return (
    <div className="mx-auto max-w-xl px-4 py-14 text-center">
      <h1 className="font-display font-bold text-3xl text-[#1A1A2E]">Cart is empty</h1>
      <p className="text-[#6B7280] text-sm mt-2">Add parts before checkout.</p>
      <Link to="/shop" className="mt-5 inline-block bg-[#E53E00] text-white rounded-lg px-7 py-3.5 text-sm font-bold hover:bg-[#C23400] transition">Back to shop</Link>
    </div>
  );

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-[12px] font-semibold text-[#9CA3AF]">
          Cart <span className="mx-1.5">/</span> <span className="text-[#1A1A2E]">Checkout</span> <span className="mx-1.5">/</span> Done
        </p>
        <h1 className="font-display font-bold tracking-[-0.02em] text-[32px] sm:text-[44px] mt-2 text-[#1A1A2E]">Checkout ({count})</h1>

        <div className="mt-7 grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-5">
            {/* Contact + Delivery */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <p className="font-display font-bold text-lg flex items-center gap-2 text-[#1A1A2E]">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-[#E53E00] text-white text-[13px] font-black">1</span>
                Contact plus delivery
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <input value={form.name} onChange={set("name")} required placeholder="Full name" className="rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition" />
                <input value={form.phone} onChange={set("phone")} required placeholder="Phone" className="rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition" />
                <input value={form.email} onChange={set("email")} required type="email" placeholder="Email for receipt plus tracking" className="sm:col-span-2 rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition" />
                <input value={form.address} onChange={set("address")} required placeholder="Street address" className="sm:col-span-2 rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition" />
                <input value={form.suburb} onChange={set("suburb")} required placeholder="Suburb" className="rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.state} onChange={set("state")} className="rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E]">
                    {["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <input value={form.postcode} onChange={set("postcode")} required placeholder="Postcode" className="rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition" />
                </div>
                <input value={form.notes} onChange={set("notes")} placeholder="Delivery notes or VIN, optional" className="sm:col-span-2 rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition" />
              </div>
              {!user && <p className="mt-3 text-[13px] text-[#6B7280]">Checking out as guest. <Link to="/login" className="text-[#E53E00] font-bold">Log in</Link> or <Link to="/signup" className="text-[#E53E00] font-bold">create an account</Link> to save history.</p>}
            </section>

            {/* Shipping */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <p className="font-display font-bold text-lg flex items-center gap-2 text-[#1A1A2E]">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-[#E53E00] text-white text-[13px] font-black">2</span>
                Shipping
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-2.5">
                {SHIPPING.map((s) => (
                  <button key={s.id} type="button" onClick={() => setShip(s.id)} className={`text-left rounded-xl border p-4 transition ${ship === s.id ? "border-[#E53E00] bg-[#FFF0EB]" : "border-[#E5E7EB] hover:border-[#E53E00]/50"}`}>
                    <p className="font-semibold text-sm flex items-center gap-1.5 text-[#1A1A2E]"><Truck size={15} className="text-[#E53E00]" />{s.label}</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-1">{s.eta}</p>
                    <p className="text-[13px] font-bold mt-1.5 text-[#1A1A2E]">{s.fee(total) === 0 ? "Free" : `$${s.fee(total).toFixed(2)}`}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <p className="font-display font-bold text-lg flex items-center gap-2 text-[#1A1A2E]">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-[#E53E00] text-white text-[13px] font-black">3</span>
                Payment
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
                {PAYMENTS.map((m) => (
                  <button key={m} type="button" onClick={() => setPay(m)} className={`rounded-xl border p-4 text-left text-sm font-semibold transition flex items-center gap-2 ${pay === m ? "border-[#E53E00] bg-[#FFF0EB] text-[#1A1A2E]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#E53E00]/50"}`}>
                    <CreditCard size={15} className="text-[#9CA3AF]" />{m}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-[#9CA3AF] flex items-center gap-1.5"><Lock size={13} /> Demo checkout. No real charge is made.</p>
            </section>
          </div>

          {/* Order Summary */}
          <aside className="rounded-2xl bg-white border border-[#E5E7EB] p-7 lg:sticky lg:top-28 shadow-sm">
            <p className="font-display font-bold text-xl text-[#1A1A2E]">Order summary</p>
            <div className="mt-4 space-y-3 max-h-[280px] overflow-auto pr-1">
              {cart.map((i) => (
                <div key={i.sku} className="flex gap-3 text-[13px]">
                  <span className="font-bold bg-[#1A1A2E] text-white rounded-lg w-8 h-8 grid place-items-center shrink-0">{i.qty}</span>
                  <span className="flex-1">
                    <b className="block leading-snug text-[#1A1A2E]">{i.name}</b>
                    <span className="text-[#9CA3AF]">{i.sku}</span>
                  </span>
                  <b className="text-[#1A1A2E]">${(i.price * i.qty).toFixed(2)}</b>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-1.5 text-sm font-semibold">
              <p className="flex justify-between"><span className="text-[#6B7280]">Subtotal</span><span className="text-[#1A1A2E]">${total.toFixed(2)}</span></p>
              <p className="flex justify-between"><span className="text-[#6B7280]">Shipping ({shipOpt.label})</span><span className="text-[#1A1A2E]">{fee === 0 ? "Free" : `$${fee.toFixed(2)}`}</span></p>
              <p className="flex justify-between font-display font-bold text-xl pt-2 text-[#1A1A2E]"><span>Total</span><span>${grand.toFixed(2)}</span></p>
            </div>
            <button onClick={() => {
              if (!form.name || !form.email || !form.address || !form.suburb || !form.postcode) { alert("Please complete name, email, address, suburb and postcode."); return; }
              const order = placeOrder({ items: cart, subtotal: total, shipping: shipOpt.label, shippingFee: fee, payment: pay, total: grand, address: form });
              setCart([]);
              nav(`/order-success/${order.id}`);
            }} className="mt-5 w-full bg-[#E53E00] text-white rounded-xl py-4 text-sm font-bold hover:bg-[#C23400] transition flex items-center justify-center gap-2">
              <Lock size={15} /> Pay ${grand.toFixed(2)}, Place order
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function OrderSuccessPage() {
  const { id } = useParams();
  const { orders } = useAuth();
  const order = orders.find((o) => o.id === id);
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center">
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto w-20 h-20 rounded-full bg-[#10B981] grid place-items-center">
        <CheckCircle2 size={40} className="text-white" />
      </motion.div>
      <h1 className="font-display font-bold text-4xl mt-6 text-[#1A1A2E]">Order locked in</h1>
      <p className="text-[#6B7280] text-sm mt-2">Order <b className="text-[#1A1A2E]">{id}</b> is packed in Campbellfield VIC.</p>
      {order && (
        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 text-left text-sm shadow-sm">
          <p className="flex justify-between"><span className="text-[#6B7280]">Items</span><b className="text-[#1A1A2E]">{order.items.length} lines</b></p>
          <p className="flex justify-between mt-1.5"><span className="text-[#6B7280]">Shipping</span><b className="text-[#1A1A2E]">{order.shipping}</b></p>
          <p className="flex justify-between mt-1.5"><span className="text-[#6B7280]">Payment</span><b className="text-[#1A1A2E]">{order.payment}</b></p>
          <p className="flex justify-between mt-1.5 font-display font-bold text-lg text-[#1A1A2E]"><span>Total</span><span>${order.total.toFixed(2)}</span></p>
        </div>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Link to={`/track?order=${id || ""}`} className="bg-[#E53E00] text-white rounded-lg px-7 py-3.5 text-sm font-bold hover:bg-[#C23400] transition">Track this order</Link>
        <Link to="/shop" className="rounded-lg px-7 py-3.5 text-sm font-bold border border-[#E5E7EB] text-[#1A1A2E] flex items-center gap-2 hover:border-[#E53E00] transition">Keep shopping <ArrowRight size={15} /></Link>
      </div>
    </div>
  );
}
