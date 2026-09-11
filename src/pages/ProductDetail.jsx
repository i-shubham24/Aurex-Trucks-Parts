import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, CheckCircle2, ShieldCheck, Truck, RotateCcw, Minus, Plus, ScanLine, ChevronRight, TriangleAlert } from "lucide-react";
import { ProductCard, Reveal, SafeImg, Stars, staggerParent } from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import { useGarage } from "../components/garage/GarageContext.jsx";
import YMMWidget from "../components/garage/YMMWidget.jsx";
import { pushRecent, RecentlyViewed } from "../components/shopwise.jsx";

export default function ProductDetail() {
  const { sku } = useParams();
  const { products: PRODUCTS } = useProducts();
  const p = PRODUCTS.find((x) => x.sku === sku);
  const { add, toggleCompare, compare, setEnquirySku } = useShop();
  const { fitStatus, selectedVehicle, hasValidVehicle } = useGarage();
  useEffect(() => { if (p) pushRecent(p.sku); }, [sku]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("Specs");
  const [vin, setVin] = useState("");
  const [vinOk, setVinOk] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const gallery = useMemo(() => {
    if (!p) return [];
    const others = PRODUCTS.filter((x) => x.cat === p.cat && x.sku !== p.sku).map((x) => x.image);
    return [p.image, ...others].filter(Boolean).slice(0, 4);
  }, [p]);

  if (!p) return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <p className="text-[#1A1A2E]">Product not found.</p>
      <Link to="/shop" className="underline text-[#E53E00]">Back to shop</Link>
    </div>
  );

  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.sku !== p.sku).slice(0, 4);
  const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : null;
  const inStock = p.stock.includes("In stock");
  const fit = fitStatus(p);
  const fitMakes = [...new Set((p.fitment?.apps || []).map((a) => a.make))];
  const cut = { clipPath: "polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px))" };

  return (
    <div>
      <div className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <p className="text-[12px] text-[#9CA3AF] font-semibold flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#E53E00] transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-[#E53E00] transition">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A2E]">{p.sku}</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Gallery */}
          <Reveal dir="left">
            <div className="rounded-3xl overflow-hidden border border-[#E5E7EB] bg-[#F1F2F4] shine">
              <div className="relative aspect-[4/3]">
                <AnimatePresence mode="wait">
                  <motion.div key={activeImg} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                    <SafeImg src={gallery[activeImg]} alt={p.name} label={p.sku} className="w-full h-full object-cover" wrapClass="w-full h-full" />
                  </motion.div>
                </AnimatePresence>
                {discount && (
                  <span className="absolute top-4 left-4 z-10 bg-[#E53E00] text-white text-[12px] font-black px-3 py-1.5 rounded-lg shadow-primary">-{discount}%</span>
                )}
                <span className={`absolute top-4 right-4 z-10 text-[12px] font-bold px-3 py-1.5 rounded-lg ${inStock ? "bg-[#10B981] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"}`}>{p.stock}</span>
              </div>
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`rounded-xl overflow-hidden border-2 transition aspect-square ${activeImg === i ? "border-[#E53E00]" : "border-[#E5E7EB] hover:border-[#9CA3AF]"}`}>
                    <SafeImg src={g} alt="" label={p.sku} className="w-full h-full object-cover" wrapClass="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 grid grid-cols-3 divide-x divide-[#E5E7EB] border border-[#E5E7EB] rounded-2xl text-center text-[12px] font-semibold bg-white overflow-hidden">
              {[["SKU", p.sku], ["OEM", p.oem], ["SYSTEM", p.cat]].map(([k, v]) => (
                <span key={k} className="px-3 py-4">
                  <b className="block text-[#9CA3AF] text-[10px] tracking-widest mb-1">{k}</b>
                  <span className="text-[#1A1A2E]">{v}</span>
                </span>
              ))}
            </div>
          </Reveal>

          {/* Info */}
          <Reveal dir="right">
            <p className="text-[12px] font-bold tracking-[0.2em] text-[#E53E00] uppercase">{p.cat}</p>
            <h1 className="font-display font-bold tracking-[-0.02em] text-[28px] sm:text-[38px] leading-[1.05] mt-2 text-[#1A1A2E]">{p.name}</h1>
            <div className="flex items-center gap-2 mt-3 text-sm flex-wrap">
              <Stars rating={p.rating} reviews={null} size={15} />
              <span className="text-[#9CA3AF]">({p.reviews} verified reviews)</span>
              <span className="ml-1 text-[11px] font-bold bg-[#FFF0EB] text-[#E53E00] rounded-lg px-3 py-1">FREE FREIGHT OVER $500</span>
            </div>
            <p className="mt-4 text-[#6B7280] leading-relaxed text-[15px]">{p.desc}</p>

            <div className="mt-5 flex items-end gap-4">
              <p className="font-display font-bold text-[40px] text-[#1A1A2E]">${p.price.toFixed(2)}</p>
              {p.oldPrice && (
                <p className="mb-2">
                  <span className="line-through text-[#9CA3AF]">${p.oldPrice.toFixed(2)}</span>
                  <span className="ml-2 text-[12px] font-bold bg-[#E53E00] text-white rounded-lg px-2.5 py-1">SAVE ${(p.oldPrice - p.price).toFixed(0)}</span>
                </p>
              )}
            </div>

            {/* Garage fit box */}
            <div className="mt-5">
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
                  <Truck size={22} className="text-[#FF6B35] shrink-0" />
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
                    <p className="text-[#78350F] text-[13px]">Listed for {fitMakes.join(", ")}. Check the fitment tab or ask our desk before you buy for a {selectedVehicle.make}.</p>
                  </div>
                </div>
              )}
              {!hasValidVehicle && (
                <div className="bg-[#F7F8FA] border border-[#E5E7EB] border-l-4 border-l-[#E53E00] p-4 flex flex-wrap items-center gap-3">
                  <Truck size={20} className="text-[#E53E00] shrink-0" />
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-[#1A1A2E] text-[15px]">Add your truck to confirm fit</p>
                    <p className="text-[#6B7280] text-[13px]">We check OEM {p.oem} against your make before dispatch.</p>
                  </div>
                  <YMMWidget variant="pill" />
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
              <p className="text-[12px] font-bold tracking-widest text-[#9CA3AF] flex items-center gap-1.5 uppercase">
                <ScanLine size={14} className="text-[#E53E00]" /> Check Fitment by VIN
              </p>
              <div className="mt-2.5 flex gap-2">
                <input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="Enter VIN, 17 characters" className="flex-1 rounded-lg px-4 py-3 bg-white border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition" />
                <button onClick={() => setVinOk(vin.trim().length >= 6)} className="clip-cut bg-[#E53E00] text-white px-5 py-3 text-sm font-bold hover:bg-[#1A1A2E] transition">Check</button>
              </div>
              {vinOk === true && (
                <p className="mt-2 text-[13px] text-[#10B981] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Good match for this line. Add to quote and we double check before dispatch.
                </p>
              )}
              {vinOk === false && <p className="mt-2 text-[13px] text-[#9CA3AF]">Enter at least 6 characters of your VIN for a preliminary check.</p>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-2 py-1.5">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 grid place-items-center rounded-lg border border-[#E5E7EB] hover:border-[#E53E00] transition text-[#6B7280]"><Minus size={15} /></button>
                <b className="w-8 text-center font-display text-lg text-[#1A1A2E]">{qty}</b>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 grid place-items-center rounded-lg border border-[#E5E7EB] hover:border-[#E53E00] transition text-[#6B7280]"><Plus size={15} /></button>
              </span>
              <button onClick={() => add(p.sku, qty)} className="clip-cut flex-1 min-w-[220px] bg-[#E53E00] py-4 text-sm font-bold hover:bg-[#1A1A2E] active:scale-[0.99] transition flex items-center justify-center gap-2 text-white shadow-primary">
                <ShoppingCart size={16} /> Add {qty} to quote cart
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => toggleCompare(p.sku)} className={`clip-cut-sm flex-1 min-w-[150px] py-3 text-[13px] font-bold border-2 transition ${compare.includes(p.sku) ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#1A1A2E] hover:text-[#1A1A2E]"}`}>{compare.includes(p.sku) ? "Added to compare" : "Add to compare"}</button>
              <button onClick={() => setEnquirySku(p.sku)} className="clip-cut-sm flex-1 min-w-[150px] py-3 text-[13px] font-bold border-2 border-[#E5E7EB] text-[#6B7280] hover:border-[#E53E00] hover:text-[#E53E00] transition">Enquire on this SKU</button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5 text-[12px]">
              {[[ShieldCheck, "ADR checked"], [Truck, "1 to 2 day dispatch"], [RotateCcw, "Easy returns"]].map(([Icon, t]) => (
                <span key={t} className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2.5 font-semibold text-[#6B7280]">
                  <Icon size={15} className="text-[#E53E00]" />{t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Tabs */}
        <Reveal className="mt-12">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
            <div className="flex border-b border-[#E5E7EB]">
              {["Specs", "Fitment", "Freight"].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-4 text-sm font-bold transition border-b-2 ${tab === t ? "border-[#E53E00] text-[#E53E00] bg-[#FFF8F5]" : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"}`}>
                  {t}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 sm:p-8 text-[14px] text-[#6B7280] leading-relaxed">
                {tab === "Specs" && (
                  <ul className="grid sm:grid-cols-3 gap-3">
                    {p.specs.map((s) => (
                      <li key={s} className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 flex gap-2">
                        <CheckCircle2 size={16} className="text-[#10B981] mt-0.5 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                )}
                {tab === "Fitment" && (
                  <div className="space-y-4">
                    <p>{p.fit}.</p>
                    {p.fitment?.universal ? (
                      <p className="font-semibold text-[#1A1A2E]">Cross make part. Fits most Australian trucks and trailers. Confirm the physical dimensions against your unit.</p>
                    ) : (p.fitment?.apps?.length ? (
                      <div>
                        <p className="text-[11px] font-bold tracking-[0.2em] text-[#9CA3AF] uppercase mb-2">Confirmed makes and models</p>
                        <div className="flex flex-wrap gap-2">
                          {p.fitment.apps.map((a, i) => (
                            <span key={i} className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#1A1A2E]">
                              {a.make}{a.model ? " " + a.model : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null)}
                    <p className="text-[13px]">For mixed fleets, add your truck in the garage bar up top and we cross check OEM {p.oem} before you pay.</p>
                  </div>
                )}
                {tab === "Freight" && <p>VIC metro 1 day. Sydney, Brisbane and Adelaide 1 to 2 days. Perth and regional 2 to 5 days. Free freight over $500. VIC pickup from Campbellfield.</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* Related */}
        <h2 className="font-display font-bold text-[24px] mt-14 text-[#1A1A2E]">Related in {p.cat}</h2>
        <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {related.map((r, i) => <ProductCard key={r.sku} p={r} index={i} />)}
        </motion.div>
        <RecentlyViewed current={p.sku} />
      </div>
    </div>
  );
}
