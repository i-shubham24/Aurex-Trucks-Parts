import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Truck, CreditCard, CheckCircle2, ArrowRight, AlertTriangle, Printer } from "lucide-react";
import { useShop } from "../store/shop.jsx";
import { useAuth } from "../store/auth.jsx";
import { useSite } from "../store/site.jsx";
import { useGarage } from "../components/garage/GarageContext.jsx";

export function CheckoutPage() {
  const { cart, total, count, setCart } = useShop();
  const { selectedVehicle, hasValidVehicle } = useGarage();
  const rigLabel = hasValidVehicle
    ? `${selectedVehicle.year ? selectedVehicle.year + " " : ""}${selectedVehicle.make} ${selectedVehicle.model}`.trim()
    : "";
  const { user, placeOrder } = useAuth();
  const { settings } = useSite();
  
  const SHIPPING = [
    { id: "Standard", label: "Standard road", eta: "1 to 5 days by zone", fee: (t) => (t >= settings.freeFreightOver ? 0 : settings.standardFee) },
    { id: "Express", label: "Express priority", eta: "1 to 2 days metro", fee: () => settings.expressFee },
    { id: "Pickup", label: "Click and Collect VIC", eta: "Ready in 4 hours", fee: () => 0 },
  ];
  const PAYMENTS = ["Card", "Bank transfer", "Afterpay", "30 day fleet terms"];
  const nav = useNavigate();
  
  const [ship, setShip] = useState(SHIPPING[0].id);
  const [pay, setPay] = useState(PAYMENTS[0]);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", address: "", suburb: "", state: "VIC", postcode: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  
  const setF = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: "" });
  };
  
  const handleCardNumber = (e) => {
    // Only allow numbers and format with spaces
    let val = e.target.value.replace(/\D/g, "").substring(0, 16);
    val = val.replace(/(\d{4})/g, "$1 ").trim();
    setCard({ ...card, number: val });
  };

  const handleCardExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (val.length >= 2) val = val.substring(0, 2) + "/" + val.substring(2, 4);
    setCard({ ...card, expiry: val });
  };

  const handleCardCvv = (e) => {
    setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").substring(0, 4) });
  };

  const shipOpt = SHIPPING.find((s) => s.id === ship);
  const fee = useMemo(() => shipOpt.fee(total), [shipOpt, total]);
  const grand = total + fee;

  const validate = () => {
    let newErrs = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRx = /^0[45]\d{8}$|^0[2378]\d{8}$/; // Basic Aus phone validation
    const pcRx = /^\d{4}$/; // Aus postcode

    if (!form.name.trim()) newErrs.name = "Name is required";
    if (!emailRx.test(form.email)) newErrs.email = "Valid email is required";
    if (!phoneRx.test(form.phone.replace(/\s/g, ''))) newErrs.phone = "Valid 10-digit Australian phone required";
    if (!form.address.trim()) newErrs.address = "Address is required";
    if (!form.suburb.trim()) newErrs.suburb = "Suburb is required";
    if (!pcRx.test(form.postcode)) newErrs.postcode = "Valid 4-digit postcode required";

    if (pay === "Card") {
      if (card.number.replace(/\s/g, '').length < 15) newErrs.card = "Valid card number required";
      if (card.expiry.length !== 5) newErrs.expiry = "Valid MM/YY required";
      if (card.cvv.length < 3) newErrs.cvv = "Valid CVV required";
    }

    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  if (cart.length === 0) return (
    <div className="mx-auto max-w-xl px-4 py-14 text-center">
      <h1 className="font-display font-bold text-3xl text-[#222538]">Cart is empty</h1>
      <p className="text-[#6B7280] text-sm mt-2">Add parts before checkout.</p>
      <Link to="/shop" className="mt-5 inline-block bg-[#134E8D] text-white rounded-lg px-7 py-3.5 text-sm font-bold hover:bg-[#222538] transition">Back to shop</Link>
    </div>
  );

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-[12px] font-semibold text-[#9CA3AF]">
          Cart <span className="mx-1.5">/</span> <span className="text-[#222538]">Checkout</span> <span className="mx-1.5">/</span> Done
        </p>
        <h1 className="font-display font-bold tracking-[-0.02em] text-[32px] sm:text-[44px] mt-2 text-[#222538]">Checkout ({count})</h1>
        {hasValidVehicle && (
          <div className="mt-4 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-4 py-3 max-w-2xl">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
            <p className="text-[13.5px] font-semibold text-emerald-800">
              Quoted for your <b>{rigLabel}</b> — our desk double-checks fitment before dispatch.
            </p>
          </div>
        )}

        <div className="mt-7 grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-5">
            {/* Contact + Delivery */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <p className="font-display font-bold text-lg flex items-center gap-2 text-[#222538]">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-[#134E8D] text-white text-[13px] font-black">1</span>
                Contact plus delivery
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div>
                  <input value={form.name} onChange={setF("name")} placeholder="Full name" className={`w-full rounded-xl px-4 py-3.5 bg-[#F7F8FA] border outline-none text-sm text-[#222538] transition ${errors.name ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                  {errors.name && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.name}</p>}
                </div>
                <div>
                  <input value={form.phone} onChange={setF("phone")} placeholder="Phone (e.g. 0412345678)" className={`w-full rounded-xl px-4 py-3.5 bg-[#F7F8FA] border outline-none text-sm text-[#222538] transition ${errors.phone ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input value={form.email} onChange={setF("email")} type="email" placeholder="Email for receipt plus tracking" className={`w-full rounded-xl px-4 py-3.5 bg-[#F7F8FA] border outline-none text-sm text-[#222538] transition ${errors.email ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input value={form.address} onChange={setF("address")} placeholder="Street address" className={`w-full rounded-xl px-4 py-3.5 bg-[#F7F8FA] border outline-none text-sm text-[#222538] transition ${errors.address ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                  {errors.address && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.address}</p>}
                </div>
                <div>
                  <input value={form.suburb} onChange={setF("suburb")} placeholder="Suburb" className={`w-full rounded-xl px-4 py-3.5 bg-[#F7F8FA] border outline-none text-sm text-[#222538] transition ${errors.suburb ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                  {errors.suburb && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.suburb}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.state} onChange={setF("state")} className="rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#222538]">
                    {["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <div>
                    <input value={form.postcode} onChange={setF("postcode")} placeholder="Postcode" maxLength={4} className={`w-full rounded-xl px-4 py-3.5 bg-[#F7F8FA] border outline-none text-sm text-[#222538] transition ${errors.postcode ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                  </div>
                </div>
                <input value={form.notes} onChange={setF("notes")} placeholder="Delivery notes or VIN, optional" className="sm:col-span-2 rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#222538] focus:border-[#134E8D] transition" />
              </div>
              {!user && <p className="mt-3 text-[13px] text-[#6B7280]">Checking out as guest. <Link to="/login" className="text-[#134E8D] font-bold">Log in</Link> or <Link to="/signup" className="text-[#134E8D] font-bold">create an account</Link> to save history.</p>}
            </section>

            {/* Shipping */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <p className="font-display font-bold text-lg flex items-center gap-2 text-[#222538]">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-[#134E8D] text-white text-[13px] font-black">2</span>
                Shipping
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-2.5">
                {SHIPPING.map((s) => (
                  <button key={s.id} type="button" onClick={() => setShip(s.id)} className={`text-left rounded-xl border p-4 transition ${ship === s.id ? "border-[#134E8D] bg-[#EDF3FA]" : "border-[#E5E7EB] hover:border-[#134E8D]/50"}`}>
                    <p className="font-semibold text-sm flex items-center gap-1.5 text-[#222538]"><Truck size={15} className="text-[#134E8D]" />{s.label}</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-1">{s.eta}</p>
                    <p className="text-[13px] font-bold mt-1.5 text-[#222538]">{s.fee(total) === 0 ? "Free" : `$${s.fee(total).toFixed(2)}`}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <p className="font-display font-bold text-lg flex items-center gap-2 text-[#222538]">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-[#134E8D] text-white text-[13px] font-black">3</span>
                Payment
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
                {PAYMENTS.map((m) => (
                  <button key={m} type="button" onClick={() => setPay(m)} className={`rounded-xl border p-4 text-left text-sm font-semibold transition flex items-center gap-2 ${pay === m ? "border-[#134E8D] bg-[#EDF3FA] text-[#222538]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#134E8D]/50"}`}>
                    <CreditCard size={15} className="text-[#9CA3AF]" />{m}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {pay === "Card" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-5 p-5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl space-y-3">
                      <p className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase flex items-center gap-1.5"><Lock size={12}/> Secure Payment</p>
                      
                      <div className="relative">
                        <input value={card.number} onChange={handleCardNumber} onPaste={(e) => e.preventDefault()} placeholder="Card number" className={`w-full rounded-lg px-4 py-3 bg-white border outline-none text-sm font-mono text-[#222538] transition ${errors.card ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                        {errors.card && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.card}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input value={card.expiry} onChange={handleCardExpiry} onPaste={(e) => e.preventDefault()} placeholder="MM/YY" className={`w-full rounded-lg px-4 py-3 bg-white border outline-none text-sm font-mono text-[#222538] transition ${errors.expiry ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                          {errors.expiry && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.expiry}</p>}
                        </div>
                        <div>
                          <input value={card.cvv} onChange={handleCardCvv} onPaste={(e) => e.preventDefault()} type="password" placeholder="CVV" maxLength={4} className={`w-full rounded-lg px-4 py-3 bg-white border outline-none text-sm font-mono text-[#222538] transition ${errors.cvv ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#134E8D]'}`} />
                          {errors.cvv && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.cvv}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] mt-2 flex items-start gap-1.5 leading-snug">
                        <AlertTriangle size={12} className="text-[#F59E0B] shrink-0 mt-0.5" /> 
                        This is a demo. Paste functionality is disabled. Do not enter real credit card details.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {pay !== "Card" && <p className="mt-3 text-[12px] text-[#9CA3AF] flex items-center gap-1.5"><Lock size={13} /> Demo checkout. You will not be charged.</p>}
            </section>
          </div>

          {/* Order Summary */}
          <aside className="rounded-2xl bg-white border border-[#E5E7EB] p-7 lg:sticky lg:top-28 shadow-sm">
            <p className="font-display font-bold text-xl text-[#222538]">Order summary</p>
            <div className="mt-4 space-y-3 max-h-[280px] overflow-auto pr-1">
              {cart.map((i) => (
                <div key={i.sku} className="flex gap-3 text-[13px]">
                  <span className="font-bold bg-[#222538] text-white rounded-lg w-8 h-8 grid place-items-center shrink-0">{i.qty}</span>
                  <span className="flex-1">
                    <b className="block leading-snug text-[#222538]">{i.name}</b>
                    <span className="text-[#9CA3AF]">{i.sku}</span>
                  </span>
                  <b className="text-[#222538]">${(i.price * i.qty).toFixed(2)}</b>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-1.5 text-sm font-semibold">
              <p className="flex justify-between"><span className="text-[#6B7280]">Subtotal</span><span className="text-[#222538]">${total.toFixed(2)}</span></p>
              <p className="flex justify-between"><span className="text-[#6B7280]">Shipping ({shipOpt.label})</span><span className="text-[#222538]">{fee === 0 ? "Free" : `$${fee.toFixed(2)}`}</span></p>
              <p className="flex justify-between font-display font-bold text-xl pt-2 text-[#222538]"><span>Total</span><span>${grand.toFixed(2)}</span></p>
            </div>
            <button onClick={() => {
              if (!validate()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
              }
              const order = placeOrder({ items: cart, subtotal: total, shipping: shipOpt.label, shippingFee: fee, payment: pay, total: grand, address: form });
              setCart([]);
              nav(`/order-success/${order.id}`);
            }} className="mt-5 w-full bg-[#134E8D] text-white rounded-xl py-4 text-sm font-bold hover:bg-[#222538] transition flex items-center justify-center gap-2">
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
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="text-center print:hidden">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto w-20 h-20 rounded-full bg-[#10B981] grid place-items-center">
          <CheckCircle2 size={40} className="text-white" />
        </motion.div>
        <h1 className="font-display font-bold text-4xl mt-6 text-[#222538]">Order locked in</h1>
        <p className="text-[#6B7280] text-sm mt-2">Order <b className="text-[#222538]">{id}</b> is packed in Campbellfield VIC.</p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={`/track?order=${id || ""}`} className="bg-[#134E8D] text-white rounded-xl px-7 py-3.5 text-sm font-bold hover:bg-[#222538] transition">Track this order</Link>
          <button onClick={() => window.print()} className="rounded-xl px-7 py-3.5 text-sm font-bold border border-[#E5E7EB] text-[#222538] flex items-center gap-2 hover:border-[#134E8D] transition bg-white">
            <Printer size={16} /> Print Tax Invoice
          </button>
          <Link to="/shop" className="rounded-xl px-7 py-3.5 text-sm font-bold border border-[#E5E7EB] text-[#222538] flex items-center gap-2 hover:border-[#134E8D] transition bg-white">
            Keep shopping <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {order && (
        <div className="mt-12 p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm print:shadow-none print:border-none print:mt-0 print:p-0">
          <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-6">
            <div>
              <p className="font-display font-black text-2xl text-[#222538]">TAX INVOICE</p>
              <p className="text-[#6B7280] text-sm mt-1">Aurex Truck Parts Australia Pty Ltd</p>
              <p className="text-[#6B7280] text-sm">ABN: 12 345 678 901</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#222538]">Order # {id}</p>
              <p className="text-[#6B7280] text-sm mt-1">{new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="py-6 grid sm:grid-cols-2 gap-8 border-b border-[#E5E7EB]">
            <div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Billed To</p>
              <p className="font-semibold text-[#222538]">{order.address.firstName} {order.address.lastName}</p>
              <p className="text-[#6B7280] text-sm mt-1">{order.address.company}</p>
              <p className="text-[#6B7280] text-sm">{order.address.address}</p>
              <p className="text-[#6B7280] text-sm">{order.address.suburb} {order.address.state} {order.address.postcode}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Payment</p>
              <p className="font-semibold text-[#222538]">{order.payment}</p>
              <p className="text-[#6B7280] text-sm mt-1">Paid in full</p>
            </div>
          </div>

          <div className="py-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#9CA3AF] border-b border-[#E5E7EB]">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium text-right w-20">Qty</th>
                  <th className="pb-3 font-medium text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {order.items.map((i, idx) => (
                  <tr key={idx}>
                    <td className="py-4">
                      <p className="font-semibold text-[#222538]">{i.name}</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">SKU: {i.sku}</p>
                    </td>
                    <td className="py-4 text-right font-medium">{i.qty}</td>
                    <td className="py-4 text-right font-medium">${(i.price * i.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-6 border-t border-[#E5E7EB] flex flex-col items-end gap-2 text-sm">
            <div className="flex justify-between w-64 text-[#6B7280]">
              <span>Subtotal</span>
              <span className="text-[#222538] font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-[#6B7280]">
              <span>Shipping ({order.shipping})</span>
              <span className="text-[#222538] font-medium">${order.shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-[#6B7280]">
              <span>GST Included (10%)</span>
              <span className="text-[#222538] font-medium">${(order.total / 11).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 font-display font-bold text-xl text-[#222538] pt-3 border-t border-[#E5E7EB] mt-1">
              <span>Total paid</span>
              <span className="text-[#134E8D]">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
