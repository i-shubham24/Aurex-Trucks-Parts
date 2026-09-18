import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, CheckCircle2, ShieldCheck, Truck, RotateCcw, Minus, Plus,
  ScanLine, ChevronRight, TriangleAlert, Send, MapPin, Package, ArrowRight,
} from "lucide-react";
import { ProductCard, Reveal, SafeImg, Stars, staggerParent } from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import { useGarage } from "../components/garage/GarageContext.jsx";
import YMMWidget from "../components/garage/YMMWidget.jsx";
import { pushRecent, RecentlyViewed } from "../components/shopwise.jsx";

const RKEY = "aurex_reviews_v1";
const readReviews = (sku) => { try { const a = JSON.parse(localStorage.getItem(RKEY) || "{}"); return Array.isArray(a[sku]) ? a[sku] : []; } catch { return []; } };

function Reviews({ sku }) {
  const [list, setList] = useState(() => readReviews(sku));
  const [f, setF] = useState({ name: "", rating: 5, text: "" });
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const entry = { name: f.name.trim() || "Verified buyer", rating: Number(f.rating), text: f.text.trim(), at: new Date().toISOString() };
    try {
      const all = JSON.parse(localStorage.getItem(RKEY) || "{}");
      all[sku] = [entry, ...(Array.isArray(all[sku]) ? all[sku] : [])].slice(0, 20);
      localStorage.setItem(RKEY, JSON.stringify(all));
    } catch { /* noop */ }
    setList((l) => [entry, ...l].slice(0, 20));
    setF({ name: "", rating: 5, text: "" });
    setDone(true);
  };
  return (
    <div className="mt-12 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div>
        <h2 className="font-display font-bold text-[24px] text-[#1A1A2E]">Workshop reviews ({list.length})</h2>
        <div className="mt-4 space-y-3">
          {list.length === 0 && <p className="text-sm text-[#6B7280] border border-dashed border-[#E5E7EB] p-6 text-center">No reviews yet. Fitted this part? Leave the first one.</p>}
          {list.map((r, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] p-5">
              <p className="flex items-center gap-2 text-[13px]"><b>{r.name}</b><span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-0.5">Verified fitment</span><span className="ml-auto text-[#E8A90C]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span></p>
              <p className="text-sm text-[#4B5563] mt-2">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="bg-white border border-[#E5E7EB] p-6 lg:sticky lg:top-28">
        <p className="font-display font-bold text-lg text-[#1A1A2E]">Leave a review</p>
        {done && <p className="mt-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3">Thanks. Your review is live below.</p>}
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Name or workshop" className="mt-3 w-full px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
        <select value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} className="mt-2.5 w-full px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select>
        <textarea required value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} rows={4} placeholder="How did it fit and perform?" className="mt-2.5 w-full px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
        <button className="mt-3 w-full bg-[#1A1A2E] text-white py-3.5 text-sm font-bold hover:bg-[#0B2F5C] transition">Submit review</button>
      </form>
    </div>
  );
}

const STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
const FREIGHT_HINT = {
  VIC: "VIC metro 1 day, regional VIC 1–2 days. Pickup available Campbellfield.",
  NSW: "Sydney metro 1–2 days, regional NSW 2–3 days.",
  QLD: "Brisbane 1–2 days, regional QLD 2–4 days.",
  SA: "Adelaide 1–2 days, regional SA 2–4 days.",
  WA: "Perth 2–5 days, regional WA 3–6 days.",
  TAS: "Hobart/Launceston 2–4 days.",
  NT: "Darwin 3–6 days.",
  ACT: "Canberra 1–2 days.",
};

export default function ProductDetail() {
  const { sku } = useParams();
  const { products: PRODUCTS } = useProducts();
  const p = PRODUCTS.find((x) => x.sku === sku);
  const { add, toggleCompare, compare, setEnquirySku } = useShop();
  const { fitStatus, selectedVehicle, hasValidVehicle } = useGarage();
  useEffect(() => { if (p) pushRecent(p.sku); }, [sku]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("Description");
  const [vin, setVin] = useState("");
  const [vinOk, setVinOk] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [shipState, setShipState] = useState("VIC");
  const [postCode, setPostCode] = useState("");
  const [freight, setFreight] = useState(null);

  const gallery = useMemo(() => (p?.image ? [p.image] : []), [p]);
  useEffect(() => { setActiveImg(0); setQty(1); setFreight(null); setPostCode(""); }, [sku]);

  if (!p) return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <p className="text-[#1A1A2E]">Product not found.</p>
      <Link to="/shop" className="underline text-[#0B2F5C]">Back to shop</Link>
    </div>
  );

  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.sku !== p.sku).slice(0, 4);
  const discount = p.oldPrice && p.price != null ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : null;
  const inStock = String(p.stock).includes("In stock");
  const fit = fitStatus(p);
  const fitMakes = [...new Set((p.fitment?.apps || []).map((a) => a.make))];
  const cut = { clipPath: "polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px))" };

  const specRows = [
    ["SKU", p.sku],
    ["OEM cross", p.oem || "—"],
    ["Brand", p.brand || "—"],
    ["System", p.cat],
    ["Availability", p.stock],
    ["Fitment", p.fit],
  ];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": p.name,
    "image": p.image,
    "description": p.desc,
    "sku": p.sku,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "AUD",
      "price": p.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb trail */}
      <div className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-3.5">
          <p className="text-[12px] text-[#9CA3AF] font-semibold flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-[#0B2F5C] transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-[#0B2F5C] transition">Shop</Link>
            <ChevronRight size={12} />
            <Link to={`/shop?cat=${encodeURIComponent(p.cat)}`} className="hover:text-[#0B2F5C] transition">{p.cat}</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A2E]">{p.name}</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
          {/* ── Gallery ─────────────────────────────── */}
          <Reveal dir="left">
            <div className="border border-[#E5E7EB] bg-[#F4F6F9] overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}>
              <div className="relative aspect-[4/3]">
                <AnimatePresence mode="wait">
                  <motion.div key={activeImg} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                    <SafeImg src={gallery[activeImg]} alt={p.name} label={p.sku} className="w-full h-full object-cover" wrapClass="w-full h-full" />
                  </motion.div>
                </AnimatePresence>
                {discount && (
                  <span className="absolute top-4 left-4 z-10 bg-[#0B2F5C] text-white text-[12px] font-black px-3 py-1.5 shadow-primary">-{discount}%</span>
                )}
                {p.badge && (
                  <span className="absolute bottom-4 left-4 z-10 bg-[#1A1A2E]/90 backdrop-blur text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1">{p.badge}</span>
                )}
                <span className={`absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 ${inStock ? "bg-[#10B981] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-white" : "bg-[#9CA3AF]"}`} />
                  {inStock ? "In stock" : p.stock}
                </span>
              </div>
            </div>
            {/* Thumbnails */}
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`overflow-hidden border-2 transition aspect-[4/3] bg-[#F4F6F9] ${activeImg === i ? "border-[#0B2F5C]" : "border-[#E5E7EB] hover:border-[#9CA3AF]"}`}>
                  <SafeImg src={g} alt="" label={p.sku} className="w-full h-full object-cover" wrapClass="w-full h-full" />
                </button>
              ))}
              {gallery.length < 4 && (
                <div className="border-2 border-dashed border-[#E5E7EB] aspect-[4/3] grid place-items-center text-center px-2">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider leading-snug">More<br />angles<br />on request</p>
                </div>
              )}
            </div>
            {/* SKU / OEM / System strip */}
            <div className="mt-3 grid grid-cols-3 divide-x divide-[#E5E7EB] border border-[#E5E7EB] text-center text-[12px] font-semibold bg-white overflow-hidden">
              {[["SKU", p.sku], ["OEM", p.oem || "—"], ["SYSTEM", p.cat]].map(([k, v]) => (
                <span key={k} className="px-3 py-4">
                  <b className="block text-[#9CA3AF] text-[10px] tracking-widest mb-1">{k}</b>
                  <span className="text-[#1A1A2E] break-words">{v}</span>
                </span>
              ))}
            </div>
          </Reveal>

          {/* ── Summary ─────────────────────────────── */}
          <Reveal dir="right">
            <p className="text-[11px] font-black tracking-[0.2em] text-[#0B2F5C] uppercase">{p.brand} · {p.sku}</p>
            <h1 className="font-display font-bold tracking-[-0.02em] text-[28px] sm:text-[38px] leading-[1.05] mt-2 text-[#1A1A2E]">{p.name}</h1>
            <div className="flex items-center gap-2 mt-3 text-sm flex-wrap">
              <Stars rating={p.rating} reviews={null} size={15} />
              <span className="text-[#9CA3AF]">({p.reviews} verified reviews)</span>
              <span className="ml-1 text-[11px] font-bold bg-[#E8EEF5] text-[#0B2F5C] px-3 py-1">FREE FREIGHT OVER $500</span>
            </div>

            {/* Price block */}
            <div className="mt-5 pb-5 border-b border-[#E5E7EB] flex items-end gap-4 flex-wrap">
              {p.price == null ? (
                <p className="font-display font-bold text-[32px] text-[#0B2F5C]">Enquire for price</p>
              ) : (
                <p className="font-display font-bold text-[40px] leading-none text-[#1A1A2E]">${p.price.toFixed(2)}</p>
              )}
              {p.oldPrice && p.price != null && (
                <p className="mb-1">
                  <span className="line-through text-[#9CA3AF]">${p.oldPrice.toFixed(2)}</span>
                  <span className="ml-2 text-[12px] font-bold bg-[#0B2F5C] text-white px-2.5 py-1">SAVE ${(p.oldPrice - p.price).toFixed(0)}</span>
                </p>
              )}
              <p className="w-full text-[12px] text-[#9CA3AF]">Prices include GST where shown. Bulk fleet pricing applies in the quote cart.</p>
            </div>

            <p className="mt-4 text-[#4B5563] leading-relaxed text-[15px]">{p.desc}</p>

            {/* Stock line */}
            <p className="mt-4 flex items-center gap-2 text-[13.5px] font-semibold">
              <span className={`w-2 h-2 rounded-full ${inStock ? "bg-[#10B981]" : "bg-[#9CA3AF]"}`} />
              {inStock ? <span className="text-[#1A1A2E]">{p.stock} — ready for dispatch</span> : <span className="text-[#6B7280]">{p.stock}</span>}
              <span className="text-[#9CA3AF] font-medium">· VIC warehouse</span>
            </p>

            {/* Fit status */}
            <div className="mt-4">
              {fit === "fits" && (
                <div style={cut} className="bg-[#10B981] text-white p-4 flex items-center gap-3">
                  <CheckCircle2 size={22} className="shrink-0" />
                  <div>
                    <p className="font-display font-bold text-[15px]">This fits your {selectedVehicle.year ? selectedVehicle.year + " " : ""}{selectedVehicle.make} {selectedVehicle.model}</p>
                    <p className="text-white/85 text-[13px]">Matched against our fitment data. Order with confidence.</p>
                  </div>
                </div>
              )}
              {fit === "universal" && (
                <div style={cut} className="bg-[#12121B] text-white p-4 flex items-center gap-3">
                  <Truck size={22} className="text-[#8FB4E0] shrink-0" />
                  <div>
                    <p className="font-display font-bold text-[15px]">Universal fit</p>
                    <p className="text-white/60 text-[13px]">Cross make part. Works with your {selectedVehicle.make} and most trucks and trailers.</p>
                  </div>
                </div>
              )}
              {fit === "no" && (
                <div style={cut} className="bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#1A1A2E] p-4 flex items-center gap-3">
                  <TriangleAlert size={22} className="text-[#B45309] shrink-0" />
                  <div>
                    <p className="font-display font-bold text-[15px]">Heads up: made for other makes</p>
                    <p className="text-[#78350F] text-[13px]">Listed for {fitMakes.join(", ")}. Check the specifications tab or ask our desk before you buy for a {selectedVehicle.make}.</p>
                  </div>
                </div>
              )}
              {!hasValidVehicle && (
                <div className="bg-[#F7F8FA] border border-[#E5E7EB] border-l-4 border-l-[#0B2F5C] p-4 flex flex-wrap items-center gap-3">
                  <Truck size={20} className="text-[#0B2F5C] shrink-0" />
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-[#1A1A2E] text-[15px]">Add your truck to confirm fit</p>
                    <p className="text-[#6B7280] text-[13px]">We check OEM {p.oem} against your make before dispatch.</p>
                  </div>
                  <YMMWidget variant="pill" />
                </div>
              )}
            </div>

            {/* Qty + CTA */}
            <div className="mt-4 flex flex-wrap items-stretch gap-3">
              <span className="flex items-center gap-1 bg-[#F7F8FA] border border-[#E5E7EB] px-1.5 py-1.5">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-11 grid place-items-center border border-[#E5E7EB] bg-white hover:border-[#0B2F5C] transition text-[#6B7280]" aria-label="Decrease quantity"><Minus size={15} /></button>
                <b className="w-10 text-center font-display text-lg text-[#1A1A2E] tabular-nums">{qty}</b>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-11 grid place-items-center border border-[#E5E7EB] bg-white hover:border-[#0B2F5C] transition text-[#6B7280]" aria-label="Increase quantity"><Plus size={15} /></button>
              </span>
              {p.price == null ? (
                <button onClick={() => setEnquirySku(p.sku)} style={cut} className="flex-1 min-w-[220px] bg-[#1A1A2E] py-4 text-sm font-bold hover:bg-[#0B2F5C] active:scale-[0.99] transition flex items-center justify-center gap-2 text-white shadow-primary">
                  <Send size={15} /> Make an enquiry
                </button>
              ) : (
                <button onClick={() => add(p.sku, qty)} style={cut} className="flex-1 min-w-[220px] bg-[#0B2F5C] py-4 text-sm font-bold hover:bg-[#1A1A2E] active:scale-[0.99] transition flex items-center justify-center gap-2 text-white shadow-primary">
                  <ShoppingCart size={16} /> Add to cart
                </button>
              )}
            </div>
            <div className="mt-2.5 grid sm:grid-cols-2 gap-2.5">
              {p.price != null && (
                <button onClick={() => setEnquirySku(p.sku)} className="py-3 text-[13px] font-bold border-2 border-[#1A1A2E] text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white transition">Make an enquiry</button>
              )}
              <button onClick={() => toggleCompare(p.sku)} className={`py-3 text-[13px] font-bold border transition ${compare.includes(p.sku) ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#1A1A2E] hover:text-[#1A1A2E]"} ${p.price == null ? "sm:col-span-2" : ""}`}>
                {compare.includes(p.sku) ? "Added to compare ✓" : "Add to compare"}
              </button>
            </div>

            {/* Delivery estimator */}
            <div className="mt-4 border border-[#E5E7EB] bg-[#F7F8FA] p-4">
              <p className="text-[12px] font-black tracking-[0.14em] text-[#1A1A2E] uppercase flex items-center gap-1.5">
                <MapPin size={14} className="text-[#0B2F5C]" /> Delivery quote
              </p>
              <div className="mt-2.5 grid grid-cols-[110px_1fr_auto] gap-2">
                <select value={shipState} onChange={(e) => setShipState(e.target.value)} className="px-3 py-3 bg-white border border-[#E5E7EB] outline-none text-sm font-semibold text-[#1A1A2E] focus:border-[#0B2F5C]">
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={postCode} onChange={(e) => setPostCode(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Postcode" inputMode="numeric" className="px-4 py-3 bg-white border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#0B2F5C] min-w-0" />
                <button onClick={() => setFreight(FREIGHT_HINT[shipState])} className="bg-[#0B2F5C] text-white px-5 py-3 text-sm font-bold hover:bg-[#1A1A2E] transition" style={cut}>Calculate</button>
              </div>
              {freight ? (
                <p className="mt-2.5 text-[13px] text-[#1A1A2E] font-medium flex items-start gap-1.5"><Truck size={14} className="text-[#0B2F5C] mt-0.5 shrink-0" />{freight}{postCode ? ` Quoted for ${postCode} — exact rate confirmed at checkout.` : " Enter a postcode for an exact depot rate."}</p>
              ) : (
                <p className="mt-2 text-[12px] text-[#9CA3AF]">Free freight on orders over $500. Select your state for a transit estimate.</p>
              )}
            </div>

            {/* VIN check */}
            <div className="mt-3 border border-[#E5E7EB] p-4">
              <p className="text-[12px] font-bold tracking-widest text-[#9CA3AF] flex items-center gap-1.5 uppercase">
                <ScanLine size={14} className="text-[#0B2F5C]" /> Check fitment by VIN
              </p>
              <div className="mt-2.5 flex gap-2">
                <input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="Enter VIN, 17 characters" className="flex-1 px-4 py-3 bg-white border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#0B2F5C] transition min-w-0" />
                <button onClick={() => setVinOk(vin.trim().length >= 6)} className="bg-[#0B2F5C] text-white px-5 py-3 text-sm font-bold hover:bg-[#1A1A2E] transition" style={cut}>Check</button>
              </div>
              {vinOk === true && (
                <p className="mt-2 text-[13px] text-[#10B981] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Good match for this line. Add to quote and we double check before dispatch.
                </p>
              )}
              {vinOk === false && <p className="mt-2 text-[13px] text-[#9CA3AF]">Enter at least 6 characters of your VIN for a preliminary check.</p>}
            </div>

            {/* Meta */}
            <div className="mt-4 text-[13px] text-[#6B7280] space-y-1.5 border-t border-[#E5E7EB] pt-4">
              <p><b className="text-[#1A1A2E] font-bold">SKU:</b> {p.sku}</p>
              <p><b className="text-[#1A1A2E] font-bold">Categories:</b> <Link to={`/shop?cat=${encodeURIComponent(p.cat)}`} className="text-[#0B2F5C] hover:underline">{p.cat}</Link>{p.brand ? <>, <span className="text-[#0B2F5C]">{p.brand}</span></> : null}</p>
              <p className="flex items-center gap-1.5"><Package size={13} className="text-[#0B2F5C]" /> {p.fit}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5 text-[12px]">
              {[[ShieldCheck, "ADR checked"], [Truck, "1–2 day dispatch"], [RotateCcw, "Easy returns"]].map(([Icon, t]) => (
                <span key={t} className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E5E7EB] px-3 py-2.5 font-semibold text-[#6B7280]">
                  <Icon size={15} className="text-[#0B2F5C] shrink-0" />{t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── Tabs: Description / Features / Specifications ── */}
        <Reveal className="mt-12">
          <div className="border border-[#E5E7EB] bg-white overflow-hidden">
            <div className="flex border-b border-[#E5E7EB] overflow-x-auto">
              {["Description", "Features", "Specifications"].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 min-w-[150px] py-4 px-4 text-sm font-bold transition border-b-2 whitespace-nowrap ${tab === t ? "border-[#0B2F5C] text-[#0B2F5C] bg-[#F2F6FB]" : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"}`}>
                  {t}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="p-6 sm:p-8 text-[14px] text-[#4B5563] leading-relaxed">
                {tab === "Description" && (
                  <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
                    <div>
                      <h3 className="font-display font-bold text-[19px] text-[#1A1A2E]">{p.name}</h3>
                      <p className="mt-3">{p.desc}</p>
                      <p className="mt-3">Designed for Australian fleet conditions, this {p.cat.toLowerCase()} line suits {p.fit.charAt(0).toLowerCase() + p.fit.slice(1)}. Cross-check OEM {p.oem} against your unit, or send our VIC desk your VIN and we confirm before dispatch.</p>
                      <p className="mt-4 font-bold text-[#1A1A2E]">What’s included</p>
                      <ul className="mt-2 space-y-1.5">
                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#10B981] mt-0.5 shrink-0" />1 × {p.name} ({p.sku})</li>
                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#10B981] mt-0.5 shrink-0" />Fitment check against OEM {p.oem} before dispatch</li>
                      </ul>
                    </div>
                    <div className="bg-[#F7F8FA] border border-[#E5E7EB] p-5 h-fit">
                      <p className="text-[11px] font-black tracking-[0.18em] text-[#9CA3AF] uppercase">At a glance</p>
                      <dl className="mt-3 space-y-2.5 text-[13.5px]">
                        {[["Brand", p.brand], ["System", p.cat], ["Rating", `${p.rating} · ${p.reviews} reviews`], ["Availability", p.stock]].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4"><dt className="text-[#9CA3AF] font-semibold">{k}</dt><dd className="text-[#1A1A2E] font-bold text-right">{v}</dd></div>
                        ))}
                      </dl>
                      <Link to={`/shop?cat=${encodeURIComponent(p.cat)}`} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-black text-[#0B2F5C] hover:gap-3 transition-all">More {p.cat} <ArrowRight size={14} /></Link>
                    </div>
                  </div>
                )}
                {tab === "Features" && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {p.specs.map((s) => (
                      <li key={s} className="list-none bg-[#F7F8FA] border border-[#E5E7EB] p-4 flex gap-2.5">
                        <CheckCircle2 size={17} className="text-[#10B981] mt-0.5 shrink-0" />
                        <span><b className="block text-[#1A1A2E]">{s}</b><span className="text-[13px] text-[#6B7280]">Verified against our catalogue drawing.</span></span>
                      </li>
                    ))}
                    <li className="list-none bg-[#1A1A2E] text-white p-4 flex gap-2.5">
                      <ShieldCheck size={17} className="text-[#8FB4E0] mt-0.5 shrink-0" />
                      <span><b className="block">ADR-aware fitment</b><span className="text-[13px] text-white/60">Checked against OEM {p.oem} before it leaves VIC.</span></span>
                    </li>
                    <li className="list-none bg-[#1A1A2E] text-white p-4 flex gap-2.5">
                      <Truck size={17} className="text-[#8FB4E0] mt-0.5 shrink-0" />
                      <span><b className="block">Fleet-ready supply</b><span className="text-[13px] text-white/60">Bulk quantities unlock extra pricing in the quote cart.</span></span>
                    </li>
                  </div>
                )}
                {tab === "Specifications" && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[11px] font-black tracking-[0.18em] text-[#9CA3AF] uppercase mb-3">Technical data</p>
                      <div className="border border-[#E5E7EB]">
                        {specRows.map(([k, v], i) => (
                          <div key={k} className={`grid grid-cols-[150px_1fr] text-[13.5px] ${i % 2 ? "bg-[#F7F8FA]" : "bg-white"}`}>
                            <span className="px-4 py-3 font-bold text-[#1A1A2E] border-r border-[#E5E7EB]">{k}</span>
                            <span className="px-4 py-3 text-[#4B5563]">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-black tracking-[0.18em] text-[#9CA3AF] uppercase mb-3">Additional information</p>
                      <div className="border border-[#E5E7EB]">
                        {(p.specs || []).map((s, i) => (
                          <div key={s} className={`grid grid-cols-[150px_1fr] text-[13.5px] ${i % 2 ? "bg-[#F7F8FA]" : "bg-white"}`}>
                            <span className="px-4 py-3 font-bold text-[#1A1A2E] border-r border-[#E5E7EB]">Detail {String(i + 1).padStart(2, "0")}</span>
                            <span className="px-4 py-3 text-[#4B5563]">{s}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[12.5px] text-[#9CA3AF]">Need certified dimensions or drawings? <button onClick={() => setEnquirySku(p.sku)} className="text-[#0B2F5C] font-bold hover:underline">Ask our desk</button> with SKU {p.sku}.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* ── Related ── */}
        <div className="mt-14 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display font-bold text-[24px] text-[#1A1A2E]">Related in {p.cat}</h2>
          <Link to={`/shop?cat=${encodeURIComponent(p.cat)}`} className="inline-flex items-center gap-1.5 text-[13px] font-black text-[#0B2F5C] hover:gap-3 transition-all">View all {p.cat} <ArrowRight size={15} /></Link>
        </div>
        <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {related.map((r, i) => <ProductCard key={r.sku} p={r} index={i} />)}
        </motion.div>
        <Reviews sku={p.sku} />
        <RecentlyViewed current={p.sku} />
      </div>
    </div>
  );
}
