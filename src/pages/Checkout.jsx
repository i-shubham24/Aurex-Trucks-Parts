import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  Edit2,
  Landmark,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import SafeImage from "../components/SafeImage";
import { useCompany } from "../store/site";
import { useCart } from "../store/cart";
import { useAuth } from "../store/auth";
import { useSite } from "../store/site";
import { useNotification } from "../store/notification";
import { api, API_ON } from "../lib/api";
import { apiClient } from "../api/client";
import ThemeSelect from "../components/ThemeSelect";

const STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRx = /^0[45]\d{8}$|^0[2378]\d{8}$/;
const pcRx = /^\d{4}$/;

const PICKUP = "Click and Collect VIC";

const digits = (v) => v.replace(/\D/g, "");

export default function Checkout() {
  const { lines, total, clear, setQty, remove } = useCart();
  const COMPANY = useCompany();
  const { user, openAuthModal, updateProfile, placeOrder } = useAuth();
  const { settings } = useSite();
  const { notify } = useNotification();
  const go = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const SHIP = [
    {
      id: "Standard road",
      name: "Standard Road",
      desc: `Free over ${formatAUD(settings.freeFreightOver)}, else ${formatAUD(settings.standardFee)}. 1 to 5 days.`,
      fee: (t) => (t >= settings.freeFreightOver ? 0 : settings.standardFee),
    },
    {
      id: "Express priority",
      name: "Express",
      desc: `${formatAUD(settings.expressFee)} flat. VIC metro next day.`,
      fee: () => settings.expressFee,
    },
    {
      id: PICKUP,
      name: "Click and Collect",
      desc: "Free. Ready in 4 hours, Campbellfield.",
      fee: () => 0,
    },
  ];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    suburb: "",
    state: "VIC",
    postcode: "",
    notes: "",
  });
  const [ship, setShip] = useState(SHIP[0].id);
  const [pay, setPay] = useState("Card");
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErrs, setFieldErrs] = useState({});
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  // Handle returning from Stripe if user canceled payment
  useEffect(() => {
    const isCanceled = searchParams.get("payment_canceled");
    const canceledOrder = searchParams.get("orderNumber");
    if (isCanceled === "true") {
      if (canceledOrder && API_ON) {
        api.post("/payments/cancel-order", { orderNumber: canceledOrder }).catch(() => {});
      }
      try {
        const stored = JSON.parse(localStorage.getItem("aurex_orders") || "[]");
        const updated = stored.map((o) =>
          o.orderNumber === canceledOrder || o.id === canceledOrder
            ? { ...o, status: "Payment failed", paymentStatus: "CANCELLED" }
            : o
        );
        localStorage.setItem("aurex_orders", JSON.stringify(updated));
      } catch {}

      notify.info({
        kicker: "PAYMENT INCOMPLETE",
        title: "Payment Was Not Completed",
        message: "Your items remain safely in your cart. You can review your details and try again.",
        duration: 6000,
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, notify]);

  // Query saved addresses from the profile API when user is logged in
  const { data: addressData } = useQuery({
    queryKey: ["user-addresses", user?.id || user?._id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await apiClient.get("/addresses");
        return res?.data?.addresses || [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  // Determine saved address from profile or API
  const savedAddress = useMemo(() => {
    if (!user) return null;
    const defaultFromApi = addressData?.find?.((a) => a.isDefault) || addressData?.[0];
    const profileAddr = user.shippingAddress || user.address;
    const candidate = defaultFromApi || profileAddr;

    if (candidate && (candidate.addressLine1 || candidate.address || candidate.streetAddress)) {
      return {
        name:
          candidate.fullName ||
          candidate.name ||
          user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        phone: candidate.phone || user.phone || "",
        email: candidate.email || user.email || "",
        company: candidate.companyName || user.companyName || "",
        address: candidate.addressLine1 || candidate.address || candidate.streetAddress || "",
        suburb: candidate.suburbOrCity || candidate.suburb || "",
        state: candidate.state || "VIC",
        postcode: candidate.postalCode || candidate.postcode || "",
        notes: candidate.deliveryInstructions || candidate.notes || "",
      };
    }
    return null;
  }, [user, addressData]);

  // Pre-fill form when user logs in or saved address loads
  useEffect(() => {
    if (!user) return;
    if (savedAddress) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || savedAddress.name,
        email: prev.email || savedAddress.email,
        phone: prev.phone || savedAddress.phone,
        address: prev.address || savedAddress.address,
        suburb: prev.suburb || savedAddress.suburb,
        state: prev.state || savedAddress.state,
        postcode: prev.postcode || savedAddress.postcode,
        notes: prev.notes || savedAddress.notes,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user, savedAddress]);

  const { data: payConfig } = useQuery({
    queryKey: ["payment-config"],
    queryFn: () => apiClient.get("/payments/config").then((r) => r?.data || {}),
    staleTime: 5 * 60 * 1000,
  });
  const cardEnabled = Boolean(payConfig?.card?.enabled);

  if (lines.length === 0)
    return (
      <main className="mx-auto max-w-xl px-4 py-14 text-center">
        <Truck size={36} className="mx-auto text-faint" />
        <h1 className="mt-3 text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-steel">Add some lines first, then come back to check out.</p>
        <Link
          to="/shop"
          className="mt-5 inline-block rounded bg-gold px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white"
        >
          Shop All Products
        </Link>
      </main>
    );

  const shipOpt = SHIP.find((s) => s.id === ship) || SHIP[0];
  const shipFee = shipOpt.fee(total);
  const grand = Math.round((total + shipFee) * 100) / 100;

  const PAYMENTS = [
    cardEnabled && {
      id: "Card",
      name: "Card",
      desc: "Visa and Mastercard, on our secure payment page.",
      icon: CreditCard,
    },
    {
      id: "Bank transfer",
      name: "Bank Transfer",
      desc: "EFT details shown with your order confirmation.",
      icon: Landmark,
    },
    ship === PICKUP && {
      id: "Pay on pickup",
      name: "Pay on Pickup",
      desc: "Pay at the Campbellfield counter when you collect.",
      icon: Wallet,
    },
    {
      id: "30 day fleet terms",
      name: "30 Day Fleet Terms",
      desc: user?.isTradeApproved
        ? "Charged to your trade account."
        : "Approved trade accounts only. Call us to apply.",
      icon: Truck,
      disabled: !user?.isTradeApproved,
    },
  ].filter(Boolean);

  const payId = PAYMENTS.some((m) => m.id === pay && !m.disabled) ? pay : "Bank transfer";
  const input = (bad) =>
    `w-full rounded-md border bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-faint transition ${
      bad ? "border-red-500" : "border-line-dark focus:border-gold"
    }`;

  const place = async (e) => {
    e.preventDefault();

    if (!user) {
      openAuthModal?.("login");
      return;
    }

    const errs = {};
    if (!form.name.trim()) errs.name = 1;
    if (!emailRx.test(form.email.trim())) errs.email = 1;
    if (!phoneRx.test(form.phone.replace(/\s/g, ""))) errs.phone = 1;
    if (ship !== PICKUP) {
      if (!form.address.trim()) errs.address = 1;
      if (!form.suburb.trim()) errs.suburb = 1;
      if (!pcRx.test(form.postcode)) errs.postcode = 1;
    }
    setFieldErrs(errs);
    setErr(Object.keys(errs).length ? "Check the highlighted fields and try again." : "");
    if (Object.keys(errs).length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (placing) return;
    setPlacing(true);

    // Save whatever address user writes here to their profile!
    try {
      if (updateProfile) {
        await updateProfile({
          address: { ...form },
          shippingAddress: { ...form },
        });
      }
    } catch (saveErr) {
      console.warn("Could not save address to profile:", saveErr);
    }

    const shipOpt = SHIP.find((s) => s.id === ship) || SHIP[0];
    const shipFee = shipOpt.fee(total);
    const grand = Math.round((total + shipFee) * 100) / 100;

    const order = await placeOrder({
      items: lines.map((l) => ({ sku: l.sku, name: l.name, price: l.price, qty: l.qty })),
      subtotal: total,
      discount: 0,
      promoCode: null,
      shipping: shipOpt.id,
      shippingFee: shipFee,
      payment: "Card",
      total: grand,
      address: { ...form },
    });

    if (!order) {
      setPlacing(false);
      return;
    }

    if (API_ON) {
      try {
        const orderRef = order.orderNumber || order.ref || order.id;
        const res = await api.post("/payments/create-checkout-session", { ref: orderRef });
        if (res?.url) {
          // Keep cart intact so if user cancels or navigates back, their cart is NOT empty!
          // The cart will be cleared on OrderSuccess only when payment is confirmed.
          window.location.href = res.url;
          return;
        }
      } catch (stripeErr) {
        console.error("Stripe session error:", stripeErr);
        notify.info({
          kicker: "STRIPE PAYMENT",
          title: "Payment Error",
          message: stripeErr?.message || "Could not initialize Stripe Checkout. Please try again.",
        });
        setPlacing(false);
        return;
      }
    }

    const charged = order.total ?? total;
    notify.success({
      kicker: "ORDER RECEIVED",
      title: "Order Placed Successfully!",
      message: `Order #${order.id} for ${formatAUD(charged)}. Preparing for dispatch from Campbellfield VIC.`,
      icon: "order",
      action: { label: "Track Order", url: `/track?id=${order.id}` },
      duration: 5000,
      sound: true,
    });
    clear();
    setPlacing(false);
    go(`/order-success/${order.id}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-[12px] text-faint">
        <Link to="/" className="hover:text-navy hover:underline">
          Home
        </Link>{" "}
        / <span className="font-semibold text-ink">Checkout</span>
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Checkout</h1>

      {err && (
        <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </p>
      )}

      <form onSubmit={place} className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          {/* PRODUCTS IN YOUR ORDER (ALWAYS VISIBLE) */}
          <section className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-base font-extrabold text-ink">
                Products in Your Order
              </h2>
              <span className="rounded bg-mist px-2.5 py-1 text-xs font-bold text-navy">
                {lines.reduce((s, l) => s + l.qty, 0)} Items
              </span>
            </div>

            <div className="mt-4 divide-y divide-line">
              {lines.map((l) => (
                <div key={l.sku} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded border border-line bg-mist">
                    <SafeImage
                      src={l.image || imgFor(l.sku)}
                      alt={l.name}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-ink leading-snug">{l.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-faint">{l.sku}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="flex items-center rounded border border-line-dark">
                        <button
                          type="button"
                          onClick={() => setQty(l.itemId || l.sku, l.qty - 1)}
                          className="px-2 py-1 transition-colors hover:bg-mist cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="tabular w-7 text-center text-xs font-bold">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(l.itemId || l.sku, l.qty + 1)}
                          className="px-2 py-1 transition-colors hover:bg-mist cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </span>
                      <span className="tabular text-sm font-extrabold text-primary">
                        {formatAUD(l.price * l.qty)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.itemId || l.sku)}
                    className="self-start text-xs font-bold text-faint underline transition-colors hover:text-navy cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* CONTACT + DELIVERY ADDRESS (WHEN LOGGED IN) */}
          {user && (
            <section className="rounded-md border border-line bg-white p-5">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">
                      Contact + Delivery Address
                    </p>
                    <p className="text-xs text-steel">
                      Delivery details will be saved to your profile for future orders
                    </p>
                  </div>
                  {savedAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress((prev) => !prev)}
                      className="flex items-center gap-1.5 text-xs font-bold text-navy hover:underline"
                    >
                      <Edit2 size={13} />
                      <span>{isEditingAddress ? "Use Saved Address" : "Change / Edit Address"}</span>
                    </button>
                  )}
                </div>

                {/* Directly show saved address if available and not actively editing */}
                {savedAddress && !isEditingAddress ? (
                  <div className="mt-4 rounded-lg border-2 border-emerald-600/40 bg-emerald-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Saved Profile Delivery Address</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(true)}
                        className="text-xs font-bold text-navy underline hover:text-ink"
                      >
                        Edit Address
                      </button>
                    </div>
                    <div className="mt-2.5 space-y-0.5 text-sm">
                      <p className="font-bold text-ink">{form.name || savedAddress.name}</p>
                      <p className="text-steel">
                        {form.address || savedAddress.address}, {form.suburb || savedAddress.suburb}{" "}
                        {form.state || savedAddress.state} {form.postcode || savedAddress.postcode}
                      </p>
                      <p className="text-xs text-faint">
                        Phone: {form.phone || savedAddress.phone} • Email: {form.email || savedAddress.email}
                      </p>
                      {form.notes && (
                        <p className="mt-1.5 rounded bg-white/70 px-2.5 py-1 text-xs text-steel">
                          <strong>Delivery note:</strong> {form.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Editable form inputs */
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold text-steel">
                        {savedAddress ? "Update your delivery address below:" : "Enter your delivery address:"}
                      </p>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 size={12} /> Automatically saves to your profile
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <input
                        value={form.name}
                        onChange={set("name")}
                        maxLength={80}
                        placeholder="Full name *"
                        className={input(fieldErrs.name)}
                      />
                      <input
                        value={form.phone}
                        onChange={set("phone")}
                        maxLength={20}
                        placeholder="Phone (04XX XXX XXX) *"
                        className={input(fieldErrs.phone)}
                      />
                      <input
                        value={form.email}
                        onChange={set("email")}
                        type="email"
                        maxLength={120}
                        placeholder="Email for receipt + tracking *"
                        className={`sm:col-span-2 ${input(fieldErrs.email)}`}
                      />
                      <input
                        value={form.address}
                        onChange={set("address")}
                        maxLength={120}
                        placeholder="Street address *"
                        className={`sm:col-span-2 ${input(fieldErrs.address)}`}
                      />
                      <input
                        value={form.suburb}
                        onChange={set("suburb")}
                        maxLength={60}
                        placeholder="Suburb *"
                        className={input(fieldErrs.suburb)}
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <ThemeSelect
                          value={form.state}
                          onChange={(v) => setForm({ ...form, state: v })}
                          options={STATES}
                          label="State"
                        />
                        <input
                          value={form.postcode}
                          onChange={(e) =>
                            setForm({ ...form, postcode: digits(e.target.value).slice(0, 4) })
                          }
                          placeholder="Postcode *"
                          inputMode="numeric"
                          className={`h-11 ${input(fieldErrs.postcode)}`}
                        />
                      </div>
                      <input
                        value={form.notes}
                        onChange={set("notes")}
                        maxLength={300}
                        placeholder="Delivery notes, forklift on site or VIN (optional)"
                        className={`sm:col-span-2 ${input(false)}`}
                      />
                    </div>
                    {savedAddress && (
                      <div className="mt-3 text-right">
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(false)}
                          className="text-xs font-bold text-steel hover:underline"
                        >
                          Cancel and use saved address
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
          )}
        </div>

        {/* ORDER SUMMARY ASIDE */}
        <aside className="rounded-md border border-line bg-white p-5 lg:sticky lg:top-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">Order summary</p>
          <div className="mt-3 max-h-[280px] space-y-3 overflow-auto pr-1">
            {lines.map((l) => (
              <div key={l.sku} className="flex gap-2.5">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded border border-line bg-mist">
                  <SafeImage
                    src={l.image || imgFor(l.sku)}
                    alt={l.name}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{l.name}</span>
                  <span className="font-mono text-[11px] text-faint">
                    {l.sku} × {l.qty}
                  </span>
                </span>
                <span className="tabular shrink-0 text-[13px] font-extrabold">
                  {formatAUD(l.price * l.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <p className="flex justify-between text-steel">
              <span>Subtotal</span>
              <span className="tabular font-bold text-ink">{formatAUD(total)}</span>
            </p>
            <p className="flex justify-between text-steel">
              <span>Freight ({shipOpt.name})</span>
              <span className="tabular font-bold text-ink">{shipFee === 0 ? "FREE" : formatAUD(shipFee)}</span>
            </p>
            <p className="tabular flex justify-between pt-1 text-lg font-extrabold">
              <span>
                Total <span className="text-[11px] font-semibold text-faint">inc. GST</span>
              </span>
              <span>{formatAUD(grand)}</span>
            </p>
          </div>

          {/* ACTION BUTTON: If LOGGED IN -> Place Order. If NOT LOGGED IN -> Login to Checkout */}
          {user ? (
            <div className="space-y-2">
              <button
                type="submit"
                disabled={placing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gold py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white disabled:cursor-wait disabled:opacity-60 cursor-pointer shadow-md"
              >
                {placing ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-ink" />
                    <span>Redirecting to Stripe…</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-steel">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Secure card payment powered by <strong>Stripe</strong></span>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => openAuthModal?.("login")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gold py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white cursor-pointer"
              >
                <Lock size={16} /> Login to Checkout
              </button>
              <p className="mt-2 text-center text-xs text-steel">
                New trade customer?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal?.("signup")}
                  className="font-bold text-navy underline hover:text-ink cursor-pointer bg-transparent border-none p-0"
                >
                  Create Account
                </button>
              </p>
            </div>
          )}

          <p className="mt-2 text-center text-[11px] text-faint">
            Fitment double-checked before dispatch. {COMPANY.phone}.
          </p>
        </aside>
      </form>
    </main>
  );
}
