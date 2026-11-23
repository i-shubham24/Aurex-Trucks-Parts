import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  Wallet,
} from "lucide-react";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import SafeImage from "../components/SafeImage";
import { useCart } from "../store/cart";
import { useAuth } from "../store/auth";
import { useSite } from "../store/site";
import { useNotification } from "../store/notification";
import { api, API_ON } from "../lib/api";
import { apiClient } from "../api/client";
import ThemeSelect from "../components/ThemeSelect";
import { calculateOrderTotals, tradeDiscountFor } from "../utils/pricing";

const STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pcRx = /^\d{4}$/;

const PICKUP = "Click and Collect VIC";

const digits = (v) => v.replace(/\D/g, "");

// Validates Australian mobile, landline, 1300/1800, or international phone numbers
const validatePhone = (raw) => {
  if (!raw || !String(raw).trim()) return false;
  const clean = String(raw).trim().replace(/[\s\-().]/g, "");
  // Australian mobile or landline with or without +61 or 0
  if (/^(\+?61|0)?[2-578]\d{8}$/.test(clean)) return true;
  // Australian 1300 / 1800 (10 digits)
  if (/^(1300|1800)\d{6}$/.test(clean)) return true;
  // Australian 13 (6 digits)
  if (/^13\d{4}$/.test(clean)) return true;
  // International phone (+ followed by 8 to 15 digits)
  if (/^\+\d{8,15}$/.test(clean)) return true;
  // General digits check
  const digitsOnly = clean.replace(/\D/g, "");
  return digitsOnly.length >= 8 && digitsOnly.length <= 15;
};

// Accepts spaces, dashes, brackets and a +61 / 61 prefix; returns the 0-leading AU form.
const normalisePhone = (v) => {
  const d = String(v || "").replace(/[\s\-().]/g, "");
  const intl = d.match(/^\+?610?([2-578]\d{8})$/);
  return intl ? `0${intl[1]}` : d;
};

export default function Checkout() {
  const { lines, clear, setQty, remove } = useCart();
  const { user, openAuthModal, updateProfile, placeOrder } = useAuth();
  const { settings } = useSite();
  const { notify } = useNotification();
  const go = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const SHIP = [
    {
      id: "Standard road",
      name: "Standard Road Freight",
      estimate: "2–5 Business Days",
      desc: `${formatAUD(settings.standardFee || 18)} flat rate. Reliable road transport across VIC and Australia-wide.`,
    },
    {
      id: "Express priority",
      name: "Express Priority Freight",
      estimate: "1–2 Business Days",
      desc: `${formatAUD(settings.expressFee || 38)} priority dispatch. Melbourne metro overnight; interstate capitals 1–2 days.`,
    },
    {
      id: PICKUP,
      name: "Click & Collect (Campbellfield VIC)",
      estimate: "Ready in 4 Hours",
      desc: "Free warehouse collection from 77 Capital Link Drive, Campbellfield VIC 3061.",
    },
  ];

  const [form, setForm] = useState({
    name: "",
    company: "",
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
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponErr, setCouponErr] = useState("");

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  // Handle returning from Stripe if user canceled payment
  useEffect(() => {
    const isCanceled = searchParams.get("payment_canceled");
    const canceledOrder = searchParams.get("orderNumber");
    // Signed token from Stripe's cancel URL; the API needs it to cancel a guest's order.
    const cancelToken = searchParams.get("ct");
    if (isCanceled === "true") {
      if (canceledOrder && API_ON) {
        api.post("/payments/cancel-order", { orderNumber: canceledOrder, cancelToken: cancelToken || undefined }).catch(() => {});
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
        // state always has a value ("VIC"), so take the saved one whenever the address is filled from it
        state: prev.address ? prev.state : savedAddress.state || prev.state,
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
  // Same rules as the server (trade discount, free freight on the discounted subtotal,
  // core deposits), so the total shown is the total charged.
  const tradeDiscountPercent = tradeDiscountFor(user);
  const totals = calculateOrderTotals({ lines, shippingMethod: shipOpt.id, tradeDiscountPercent, settings, coupon: appliedCoupon });
  const shipFee = totals.shippingFee;
  const grand = totals.grandTotal;

  const applyCouponCode = async (rawCode, silent = false) => {
    const code = (rawCode || "").trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponErr("");
    try {
      if (API_ON) {
        try {
          const res = await api.post("/coupons/validate", { code, cartSubtotal: totals.subtotal });
          if (res?.data?.coupon || res?.coupon) {
            const coup = res?.data?.coupon || res?.coupon;
            setAppliedCoupon(coup);
            setCouponInput(coup.code);
            localStorage.setItem("aurex_applied_coupon", coup.code);
            if (!silent) {
              notify.info({
                kicker: "COUPON APPLIED",
                title: "10% Discount Applied",
                message: `Coupon ${coup.code} applied! 10% off your parts.`,
                duration: 4000
              });
            }
            return;
          }
        } catch (apiErr) {
          if (code === "AUREX10" || code === "SAVE10" || code === "WELCOME10") {
            const fallback = { code, discountType: "PERCENTAGE", discountValue: 10, description: "10% Off Limited Period" };
            setAppliedCoupon(fallback);
            setCouponInput(code);
            localStorage.setItem("aurex_applied_coupon", code);
            if (!silent) {
              notify.info({
                kicker: "COUPON APPLIED",
                title: "10% Discount Applied",
                message: `Coupon ${code} applied! 10% off your parts.`,
                duration: 4000
              });
            }
            return;
          }
          throw apiErr;
        }
      } else {
        if (code === "AUREX10" || code === "SAVE10" || code === "WELCOME10") {
          const fallback = { code, discountType: "PERCENTAGE", discountValue: 10, description: "10% Off Limited Period" };
          setAppliedCoupon(fallback);
          setCouponInput(code);
          localStorage.setItem("aurex_applied_coupon", code);
          return;
        }
        throw new Error("Invalid or expired coupon code");
      }
    } catch (err) {
      setCouponErr(err.message || "Invalid or expired coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponErr("");
    localStorage.removeItem("aurex_applied_coupon");
  };

  useEffect(() => {
    const qCoupon = searchParams.get("coupon") || searchParams.get("promo");
    const saved = qCoupon || localStorage.getItem("aurex_applied_coupon");
    if (saved && !appliedCoupon) {
      applyCouponCode(saved, true);
    }
  }, [searchParams]);

  const PAYMENTS = [
    cardEnabled && {
      id: "Card",
      name: "Credit / Debit Card",
      badge: "INSTANT CONFIRMATION",
      desc: "Visa, Mastercard, AMEX & Apple Pay on 256-bit secure Stripe checkout.",
      icon: CreditCard,
    },
    {
      id: "Bank transfer",
      name: "Direct Bank Transfer (EFT)",
      badge: "BUSINESS EFT",
      desc: "NAB account details provided upon confirmation. Items dispatched once funds settle.",
      icon: Landmark,
    },
    ship === PICKUP && {
      id: "Pay on pickup",
      name: "Pay on Pickup (Campbellfield)",
      badge: "COUNTER COLLECTION",
      desc: "Pay by Card or Cash when collecting from 77 Capital Link Drive, Campbellfield.",
      icon: Wallet,
    },
    {
      id: "30 day fleet terms",
      name: "30-Day Commercial Account",
      badge: user?.isTradeApproved ? "TRADE ACCOUNT" : "TRADE ONLY",
      desc: user?.isTradeApproved
        ? "Charged to your registered 30-day commercial fleet account."
        : "Approved fleet & workshop trade accounts only.",
      icon: Truck,
      disabled: !user?.isTradeApproved,
    },
  ].filter(Boolean);

  const payId = PAYMENTS.some((m) => m.id === pay && !m.disabled) ? pay : (cardEnabled ? "Card" : "Bank transfer");
  const input = (bad) =>
    `w-full rounded-md border bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-faint transition ${
      bad ? "border-red-500 bg-red-50/20 focus:border-red-600" : "border-line-dark focus:border-gold"
    }`;

  const place = async (e) => {
    e.preventDefault();

    const phone = normalisePhone(form.phone);
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required for receipt & tracking";
    } else if (!emailRx.test(form.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required for dispatch & freight updates";
    } else if (!validatePhone(form.phone)) {
      errs.phone = "Enter a valid phone number, e.g. 0412 345 678 or +61 412 345 678";
    }
    if (ship !== PICKUP) {
      if (!form.address.trim()) errs.address = "Street address is required";
      if (!form.suburb.trim()) errs.suburb = "Suburb is required";
      if (!pcRx.test(form.postcode)) errs.postcode = "4-digit Australian postcode required";
    }
    setFieldErrs(errs);
    if (Object.keys(errs).length) {
      setErr("Please check the highlighted fields below and try again.");
      setIsEditingAddress(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErr("");

    const details = {
      ...form,
      phone,
      companyName: form.company || undefined,
      addressLine1: ship === PICKUP ? "Click and Collect" : form.address,
      suburbOrCity: ship === PICKUP ? "Campbellfield" : form.suburb,
      state: ship === PICKUP ? "VIC" : form.state,
      postalCode: ship === PICKUP ? "3061" : form.postcode,
    };

    if (placing) return;
    setPlacing(true);

    // Save address to profile if logged in
    if (user && updateProfile) {
      try {
        await updateProfile({
          address: { ...details },
          shippingAddress: { ...details },
        });
      } catch (saveErr) {
        console.warn("Could not save address to profile:", saveErr);
      }
    }

    const order = await placeOrder({
      items: lines.map((l) => ({ sku: l.sku, name: l.name, price: l.price, qty: l.qty })),
      subtotal: totals.subtotal,
      discount: totals.totalDiscount,
      promoCode: appliedCoupon?.code || null,
      shipping: shipOpt.id,
      shippingFee: shipFee,
      payment: payId,
      total: grand,
      address: details,
      isGuest: !user,
      guestEmail: !user ? details.email : undefined
    });

    if (!order) {
      setPlacing(false);
      return;
    }

    // Persist in guest orders so user can always track it when returning
    try {
      const orderId = order.orderNumber || order.ref || order.id;
      const guestOrders = JSON.parse(localStorage.getItem("aurex_guest_orders") || "[]");
      const updatedGuest = [order, ...guestOrders.filter((o) => (o.orderNumber || o.ref || o.id) !== orderId)];
      localStorage.setItem("aurex_guest_orders", JSON.stringify(updatedGuest));
      localStorage.setItem("aurex_last_guest_email", details.email);

      const generalOrders = JSON.parse(localStorage.getItem("aurex_orders") || "[]");
      const updatedGeneral = [order, ...generalOrders.filter((o) => (o.orderNumber || o.ref || o.id) !== orderId)];
      localStorage.setItem("aurex_orders", JSON.stringify(updatedGeneral));
    } catch {}

    if (API_ON && payId === "Card") {
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

    const charged = order.total ?? grand;
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

          {/* CONTACT + DELIVERY ADDRESS */}
          <section className="rounded-md border border-line bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">
                    Step 1 • Contact &amp; Delivery Details
                  </p>
                  {!user && (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wide">
                      Guest Checkout: No Login Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-steel">
                  {user
                    ? "Delivery details will be saved to your profile for future orders"
                    : "One-time guest order. Tracking receipt and tax invoice will be sent to your email."}
                </p>
              </div>
              {!user ? (
                <button
                  type="button"
                  onClick={() => openAuthModal?.("login")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:underline cursor-pointer self-start sm:self-auto"
                >
                  <Lock size={12} /> Already have an account? Log in
                </button>
              ) : savedAddress && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-bold text-navy hover:underline cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>{isEditingAddress ? "Use Saved Address" : "Change / Edit Address"}</span>
                </button>
              )}
            </div>

            {/* If Click and Collect is chosen, show Campbellfield Depot info */}
            {ship === PICKUP && (
              <div className="mt-4 rounded-lg border-2 border-amber-500/30 bg-amber-50/60 p-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="text-amber-700 shrink-0 mt-0.5" size={18} />
                  <div className="text-xs">
                    <p className="font-extrabold text-amber-950 text-sm">Campbellfield Trade Warehouse Depot</p>
                    <p className="text-amber-900 mt-1 font-semibold">
                      77 Capital Link Drive, Campbellfield VIC 3061
                    </p>
                    <p className="text-amber-800 mt-0.5">
                      Trade Counter Hours: Monday–Friday 9:00 AM – 5:00 PM • Saturday 9:00 AM – 12:00 PM
                    </p>
                    <p className="text-emerald-800 font-bold mt-1.5 flex items-center gap-1">
                      ✓ Ready for collection within 4 business hours • Street delivery address not required
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Directly show saved address if available and not actively editing */}
            {savedAddress && !isEditingAddress && ship !== PICKUP ? (
              <div className="mt-4 rounded-lg border-2 border-emerald-600/40 bg-emerald-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Saved Profile Delivery Address</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="text-xs font-bold text-navy underline hover:text-ink cursor-pointer"
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
                    {ship === PICKUP ? "Enter your contact details for collection notice:" : (savedAddress ? "Update your delivery address below:" : "Enter your delivery address:")}
                  </p>
                  {user ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 size={12} /> Automatically saves to your profile
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      Direct dispatch delivery
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <input
                      value={form.name}
                      onChange={set("name")}
                      maxLength={80}
                      placeholder="Full name *"
                      aria-label="Full name"
                      autoComplete="name"
                      className={input(fieldErrs.name)}
                    />
                    {fieldErrs.name && (
                      <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{fieldErrs.name}</p>
                    )}
                  </div>

                  <div>
                    <input
                      value={form.phone}
                      onChange={set("phone")}
                      maxLength={20}
                      placeholder="Phone (04XX XXX XXX or +61...) *"
                      aria-label="Phone"
                      aria-invalid={Boolean(fieldErrs.phone)}
                      type="tel"
                      autoComplete="tel"
                      className={input(fieldErrs.phone)}
                    />
                    {fieldErrs.phone && (
                      <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{fieldErrs.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      value={form.email}
                      onChange={set("email")}
                      type="email"
                      maxLength={120}
                      placeholder="Email for receipt + live tracking *"
                      aria-label="Email for receipt and tracking"
                      autoComplete="email"
                      className={input(fieldErrs.email)}
                    />
                    {fieldErrs.email && (
                      <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{fieldErrs.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      value={form.company}
                      onChange={set("company")}
                      maxLength={100}
                      placeholder="Company or Workshop name (optional)"
                      aria-label="Company or Workshop name (optional)"
                      autoComplete="organization"
                      className={input(false)}
                    />
                  </div>

                  {ship !== PICKUP && (
                    <>
                      <div className="sm:col-span-2">
                        <input
                          value={form.address}
                          onChange={set("address")}
                          maxLength={120}
                          placeholder="Street address *"
                          aria-label="Street address"
                          autoComplete="street-address"
                          className={input(fieldErrs.address)}
                        />
                        {fieldErrs.address && (
                          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{fieldErrs.address}</p>
                        )}
                      </div>

                      <div>
                        <input
                          value={form.suburb}
                          onChange={set("suburb")}
                          maxLength={60}
                          placeholder="Suburb *"
                          aria-label="Suburb"
                          className={input(fieldErrs.suburb)}
                        />
                        {fieldErrs.suburb && (
                          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{fieldErrs.suburb}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <ThemeSelect
                          value={form.state}
                          onChange={(v) => setForm({ ...form, state: v })}
                          options={STATES}
                          label="State"
                        />
                        <div>
                          <input
                            value={form.postcode}
                            onChange={(e) =>
                              setForm({ ...form, postcode: digits(e.target.value).slice(0, 4) })
                            }
                            placeholder="Postcode *"
                            aria-label="Postcode"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            className={`h-11 ${input(fieldErrs.postcode)}`}
                          />
                          {fieldErrs.postcode && (
                            <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{fieldErrs.postcode}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <input
                      value={form.notes}
                      onChange={set("notes")}
                      maxLength={300}
                      placeholder={ship === PICKUP ? "Pickup notes or vehicle rego (optional)" : "Delivery notes, forklift on site or VIN (optional)"}
                      aria-label="Delivery notes (optional)"
                      className={input(false)}
                    />
                  </div>
                </div>

                {savedAddress && (
                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="text-xs font-bold text-steel hover:underline cursor-pointer"
                    >
                      Cancel and use saved address
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 2. DELIVERY METHOD SELECTION */}
          <section className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">
                  Step 2 • Delivery Method
                </p>
                <h2 className="text-base font-extrabold text-ink">Choose Shipping Option</h2>
              </div>
              <span className="flex items-center gap-1 rounded bg-mist px-2.5 py-1 text-xs font-bold text-navy">
                <Truck size={14} /> {shipOpt.name}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {SHIP.map((s) => {
                const isSelected = ship === s.id;
                const isFree = s.id === "Standard road" && totals.subtotal >= 500;
                return (
                  <label
                    key={s.id}
                    onClick={() => {
                      setShip(s.id);
                      if (s.id !== PICKUP && pay === "Pay on pickup") {
                        setPay("Card");
                      }
                    }}
                    className={`relative flex cursor-pointer items-start gap-3.5 rounded-lg border p-4 transition ${
                      isSelected
                        ? "border-navy bg-navy/[0.02] ring-2 ring-navy/20"
                        : "border-line hover:border-line-dark hover:bg-mist/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={s.id}
                      checked={isSelected}
                      onChange={() => {
                        setShip(s.id);
                        if (s.id !== PICKUP && pay === "Pay on pickup") {
                          setPay("Card");
                        }
                      }}
                      className="mt-1 h-4 w-4 accent-navy cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-sm font-extrabold text-ink">{s.name}</span>
                        <span className="tabular text-sm font-extrabold text-navy">
                          {s.id === PICKUP || isFree ? (
                            <span className="text-emerald-700 font-extrabold">FREE</span>
                          ) : s.id === "Express priority" ? (
                            formatAUD(settings.expressFee || 38)
                          ) : (
                            formatAUD(settings.standardFee || 18)
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-steel leading-relaxed">{s.desc}</p>
                      {s.estimate && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded bg-mist px-2 py-0.5 text-[11px] font-bold text-faint">
                          <Clock size={11} /> {s.estimate}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* 3. PAYMENT METHOD SELECTION */}
          <section className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">
                  Step 3 • Payment Method
                </p>
                <h2 className="text-base font-extrabold text-ink">Choose How to Pay</h2>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck size={14} /> 256-bit Encrypted
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {PAYMENTS.map((p) => {
                const isSelected = payId === p.id;
                const Icon = p.icon;
                return (
                  <label
                    key={p.id}
                    onClick={() => {
                      if (!p.disabled) setPay(p.id);
                    }}
                    className={`relative flex cursor-pointer items-start gap-3.5 rounded-lg border p-4 transition ${
                      p.disabled
                        ? "opacity-50 cursor-not-allowed border-line bg-mist/20"
                        : isSelected
                        ? "border-navy bg-navy/[0.02] ring-2 ring-navy/20"
                        : "border-line hover:border-line-dark hover:bg-mist/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={p.id}
                      checked={isSelected}
                      disabled={p.disabled}
                      onChange={() => {
                        if (!p.disabled) setPay(p.id);
                      }}
                      className="mt-1 h-4 w-4 accent-navy cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="flex items-center gap-2 text-sm font-extrabold text-ink">
                          <Icon size={16} className="text-navy" /> {p.name}
                        </span>
                        {p.badge && (
                          <span className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            p.badge.includes('INSTANT') ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            p.badge.includes('FREE') || p.badge.includes('TRADE') ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-steel leading-relaxed">{p.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
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
              <span className="tabular font-bold text-ink">{formatAUD(totals.subtotal)}</span>
            </p>
            {totals.tradeDiscountAmount > 0 && (
              <p className="flex justify-between text-green-700">
                <span>Trade discount ({tradeDiscountPercent}%)</span>
                <span className="tabular font-bold">−{formatAUD(totals.tradeDiscountAmount)}</span>
              </p>
            )}
            {totals.couponDiscountAmount > 0 && (
              <p className="flex justify-between text-emerald-700 font-semibold">
                <span className="flex items-center gap-1"><Tag size={12} /> Promo ({appliedCoupon?.code || "10%"})</span>
                <span className="tabular font-bold">−{formatAUD(totals.couponDiscountAmount)}</span>
              </p>
            )}
            <p className="flex justify-between text-steel">
              <span>Freight ({shipOpt.name})</span>
              <span className="tabular font-bold text-ink">{shipFee === 0 ? "FREE" : formatAUD(shipFee)}</span>
            </p>
            {totals.totalCoreDeposit > 0 && (
              <p className="flex justify-between text-steel">
                <span>Core deposit (refundable)</span>
                <span className="tabular font-bold text-ink">{formatAUD(totals.totalCoreDeposit)}</span>
              </p>
            )}
            <p className="tabular flex justify-between pt-1 text-lg font-extrabold">
              <span>
                Total <span className="text-[11px] font-semibold text-faint">inc. GST</span>
              </span>
              <span>{formatAUD(grand)}</span>
            </p>
          </div>

          {/* Coupon / Promo Code Input Card */}
          <div className="mt-3 border-t border-line pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Tag size={12} className="text-amber-500" /> Have a Coupon or Promo Code?
              </span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <span className="font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded tracking-wide">{appliedCoupon.code}</span>
                  <span className="font-medium text-emerald-700">10% Off Applied</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. AUREX10)"
                    className="w-full uppercase rounded border border-line-dark bg-white px-2.5 py-1.5 text-xs font-mono font-bold tracking-wider outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    disabled={couponLoading || !couponInput.trim()}
                    onClick={() => applyCouponCode(couponInput)}
                    className="rounded bg-navy px-3.5 py-1.5 text-xs font-bold text-white hover:bg-gold hover:text-ink disabled:opacity-50 transition cursor-pointer shrink-0"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponErr && <p className="mt-1 text-[11px] text-red-600 font-semibold">{couponErr}</p>}
                <div className="mt-2 flex items-center justify-between text-[11px] bg-amber-50/70 border border-amber-200/60 rounded px-2.5 py-1.5">
                  <span className="text-amber-900 font-medium flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-600" /> Limited 10% off: <strong className="font-mono text-slate-900">AUREX10</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => applyCouponCode("AUREX10")}
                    className="font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <div className="space-y-2">
              <button
                type="submit"
                disabled={placing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gold py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white disabled:cursor-wait disabled:opacity-60 cursor-pointer shadow-md"
              >
                {placing ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-ink" />
                    <span>
                      {payId === "Card"
                        ? "Redirecting to Stripe…"
                        : payId === "Pay on pickup"
                        ? "Confirming pickup…"
                        : "Placing order…"}
                    </span>
                  </>
                ) : (
                  <>
                    {payId === "Card" ? (
                      <CreditCard size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    <span>
                      {user ? (
                        payId === "Card"
                          ? `Place Order & Pay with Card • ${formatAUD(grand)}`
                          : payId === "Pay on pickup"
                          ? `Confirm Click & Collect Order • ${formatAUD(grand)}`
                          : payId === "30 day fleet terms"
                          ? `Place on Trade Account • ${formatAUD(grand)}`
                          : `Place Order (Bank Transfer) • ${formatAUD(grand)}`
                      ) : (
                        payId === "Card"
                          ? `Guest Checkout: Pay with Card • ${formatAUD(grand)}`
                          : payId === "Pay on pickup"
                          ? `Confirm Click & Collect Order (Guest) • ${formatAUD(grand)}`
                          : `Place Order as Guest (Bank Transfer) • ${formatAUD(grand)}`
                      )}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-steel">
                <ShieldCheck size={14} className="text-emerald-600" />
                {payId === "Card" ? (
                  <span>Secure card payment powered by <strong>Stripe</strong></span>
                ) : payId === "Pay on pickup" ? (
                  <span>Pay upon counter collection at Campbellfield VIC</span>
                ) : payId === "30 day fleet terms" ? (
                  <span>Commercial 30-day terms invoice issued upon dispatch</span>
                ) : (
                  <span>Direct EFT tax invoice details provided upon confirmation</span>
                )}
              </div>

              {!user && (
                <div className="pt-2 text-center text-xs text-steel border-t border-line/60 mt-2">
                  <span>Want to save this address? </span>
                  <button
                    type="button"
                    onClick={() => openAuthModal?.("login")}
                    className="font-bold text-navy underline hover:text-ink cursor-pointer bg-transparent border-none p-0"
                  >
                    Log in or Create Account
                  </button>
                </div>
              )}
            </div>

          <p className="mt-2 text-center text-[11px] text-faint">
            Fitment double-checked before dispatch.
          </p>
        </aside>
      </form>
    </main>
  );
}
