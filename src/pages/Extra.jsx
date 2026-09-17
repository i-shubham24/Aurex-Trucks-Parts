import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Phone, Send, PackageSearch, ArrowRight, BadgeCheck, MapPin, Mail, Clock, X, Heart, ShoppingCart } from "lucide-react";
import { BRANDS, GUIDES, NEWS, HERO } from "../data/catalog.js";
import { ProductCard, Reveal, SafeImg, SectionHead, staggerParent, staggerChild } from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import { useSite } from "../store/site.jsx";

function PageHero({ crumb, title, accent, sub, right }) {
  return (
    <section className="relative overflow-hidden bg-[#1A1A2E] text-white">
      <SafeImg src={HERO.dark} alt="" label="AUREX" className="absolute inset-0 w-full h-full object-cover opacity-[0.14]" wrapClass="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 grid-scrim opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E]/85 to-[#1A1A2E]/55" />

      {/* animated glows */}
      <motion.div aria-hidden animate={{ x: [0, 40, 0], y: [0, -24, 0], opacity: [0.2, 0.38, 0.2] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-24 -top-12 w-[440px] h-[440px] rounded-full bg-[#0B2F5C]/25 blur-[130px]" />
      <motion.div aria-hidden animate={{ x: [0, -30, 0], y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-24 -bottom-20 w-80 h-80 rounded-full bg-[#2F5E93]/15 blur-[130px]" />

      {/* floating angular shapes */}
      <motion.span aria-hidden animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="clip-cut hidden md:block absolute right-[9%] top-10 w-16 h-16 bg-[#0B2F5C]/15 border-2 border-[#0B2F5C]/40" />
      <motion.span aria-hidden animate={{ y: [0, 14, 0], rotate: [0, -6, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="clip-cut hidden md:block absolute right-[18%] bottom-9 w-11 h-11 bg-[#2F5E93]/10 border-2 border-[#2F5E93]/30" />
      <motion.span aria-hidden animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="clip-notch hidden lg:block absolute right-[4%] bottom-16 w-8 h-8 bg-white/5 border border-white/20" />

      <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-11 flex flex-wrap items-end gap-5">
        <Reveal className="max-w-2xl">
          <p className="text-[12px] font-semibold text-white/50">
            <Link to="/" className="hover:text-[#2F5E93] transition">Home</Link>
            <span className="mx-1.5">/</span>{crumb}
          </p>
          <h1 className="font-display font-bold tracking-[-0.02em] text-[36px] sm:text-[50px] leading-[0.98] mt-3">
            {title} <span className="text-[#C7CDD6]">{accent}</span>
          </h1>
          {sub && <p className="text-white/60 text-[15px] mt-3 max-w-xl">{sub}</p>}
        </Reveal>
        {right && <div className="ml-auto relative">{right}</div>}
      </div>
    </section>
  );
}

export function CategoriesPage() {
  const { liveCategories: CATEGORIES } = useSite();
  return (
    <div>
      <PageHero crumb="Categories" title="Six categories." accent="One catalogue." sub="The approved range with live counts. Open any card for a pre filtered shop view." />
      <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="mx-auto max-w-7xl px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((c) => (
          <motion.div key={c.name} variants={staggerChild}>
            <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group relative block rounded-2xl overflow-hidden border border-[#E5E7EB] h-64 shine">
              <SafeImg src={c.image} alt={c.name} label={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" wrapClass="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/95 via-[#1A1A2E]/45 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#0B2F5C] text-white mb-3 group-hover:scale-110 transition"><c.icon size={20} /></span>
                <p className="font-display font-bold text-xl">{c.name}</p>
                <p className="text-white/70 text-[13px] mt-0.5">{c.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.subs.slice(0, 3).map((s) => (
                    <span key={s} className="text-[11px] bg-white/10 border border-white/15 rounded-lg px-2.5 py-1 text-white/80">{s}</span>
                  ))}
                </div>
                <p className="mt-3 text-[13px] font-bold text-[#2F5E93] flex items-center gap-1.5">{c.count} lines <ArrowRight size={14} className="group-hover:translate-x-1 transition" /></p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 sm:p-8">
          <h2 className="font-display font-bold text-2xl text-[#1A1A2E]">Truck parts by system, explained</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-x-8 gap-y-4">
            {CATEGORIES.map((c) => (
              <div key={c.name}>
                <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="font-bold text-[#1A1A2E] hover:text-[#0B2F5C] text-[14px]">{c.name} parts →</Link>
                <p className="text-[13px] text-[#6B7280] mt-0.5">{c.blurb}. Shop {(c.subs || []).join(", ").toLowerCase()} with OEM crosses and VIC stock.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandsPage() {
  const { setQuery } = useShop();
  const { products: PRODUCTS } = useProducts();
  const [active, setActive] = useState(null);
  const preview = useMemo(() => (active ? PRODUCTS.filter((p) => (p.brand || "").toLowerCase().includes(active.toLowerCase().split(" ")[0])) : []), [active, PRODUCTS]);
  return (
    <div>
      <PageHero crumb="Brands" title="Shop by" accent="make." sub="Pick a badge to filter the shop. Preview shows live matches before you open the catalogue." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-40px" }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BRANDS.map((b) => (
            <motion.button
              key={b}
              variants={staggerChild}
              onClick={() => setActive(b)}
              className={`rounded-2xl py-7 px-3 font-display font-bold tracking-wider transition border ${
                active === b ? "bg-[#0B2F5C] text-white border-[#0B2F5C] shadow-primary" : "bg-white border-[#E5E7EB] text-[#1A1A2E] hover:border-[#0B2F5C] hover:-translate-y-1 hover:shadow-card-hover"
              }`}
            >
              {b}
            </motion.button>
          ))}
        </motion.div>
        <AnimatePresence>
          {active && (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-display font-bold text-2xl text-[#1A1A2E]">{active}</p>
                <span className="text-[12px] font-semibold text-[#9CA3AF]">{preview.length} live matches</span>
                <span className="ml-auto flex gap-2">
                  <Link to={`/brand/${encodeURIComponent(active)}`} className="border border-[#E5E7EB] rounded-lg px-5 py-3 text-sm font-bold hover:border-[#1A1A2E] transition">Brand page</Link>
                  <Link to="/shop" onClick={() => setQuery(active.split(" ")[0])} className="bg-[#0B2F5C] text-white rounded-lg px-6 py-3 text-sm font-bold hover:bg-[#1A1A2E] transition">Open in shop</Link>
                </span>
              </div>
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {preview.slice(0, 3).map((p, i) => <ProductCard key={p.sku} p={p} index={i} />)}
                {preview.length === 0 && <p className="text-[#9CA3AF] text-sm">No demo lines for this badge yet.</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DealsPage() {
  const { add, toggleCompare, compare, setEnquirySku, wishlist, setWishlist } = useShop();
  const { products: PRODUCTS } = useProducts();
  const discounted = PRODUCTS.filter((p) => p.oldPrice);
  const hasDeals = discounted.length > 0;
  // No discounted lines in the approved catalogue yet: feature the most
  // reviewed lines instead of rendering an empty page.
  const deals = (hasDeals ? discounted : [...PRODUCTS].sort((a, b) => (b.reviews || 0) - (a.reviews || 0))).slice(0, 9);
  return (
    <div>
      <PageHero crumb="Deals" title={hasDeals ? "Live" : "Featured"} accent={hasDeals ? "deals." : "lines."} sub={hasDeals ? "Clear pricing with stock bars showing how fast each offer moves." : "Most reordered lines from the approved catalogue. Ask the desk for fleet pricing."} />
      <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="mx-auto max-w-7xl px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {deals.map((p, i) => {
          const save = p.oldPrice ? p.oldPrice - p.price : 0;
          const pct = p.oldPrice ? Math.round((save / p.oldPrice) * 100) : 0;
          const claimed = 62 + ((i * 11) % 30);
          const wished = wishlist.includes(p.sku);
          const inCompare = compare.includes(p.sku);
          return (
          <motion.div key={p.sku} variants={staggerChild} className="group relative bg-white border border-[#E5E7EB] overflow-hidden hover:border-[#0B2F5C]/40 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-500 flex flex-col" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,26px 100%,0 calc(100% - 26px))" }}>
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F1F2F4] shine">
              <Link to={`/product/${p.sku}`} className="block w-full h-full">
                <SafeImg src={p.image} alt={p.name} label={p.sku} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" wrapClass="w-full h-full" />
              </Link>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none" />
              {p.oldPrice && (
                <span className="absolute top-3 left-3 z-10 bg-[#0B2F5C] text-white text-[11px] font-black px-2.5 py-1 shadow-primary" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px))" }}>
                  SAVE ${save.toFixed(0)} • {pct}%
                </span>
              )}
              <button
                onClick={() => setWishlist((w) => (wished ? w.filter((x) => x !== p.sku) : [...w, p.sku]))}
                aria-label="wishlist"
                className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-white/95 backdrop-blur border border-[#E5E7EB] hover:border-[#0B2F5C] hover:scale-110 transition shadow-sm"
              >
                <Heart size={15} className={wished ? "fill-[#0B2F5C] text-[#0B2F5C]" : "text-[#9CA3AF]"} />
              </button>
              <span className="absolute bottom-3 left-3 z-10 text-[11px] font-bold text-[#6B7280] bg-white/90 backdrop-blur px-2.5 py-1">{p.sku}</span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="text-[11px] font-semibold tracking-wide text-[#9CA3AF] uppercase">{p.brand ? p.brand + " • " : ""}{p.cat}</p>
              <Link to={`/product/${p.sku}`} className="font-display font-semibold text-[16px] mt-1.5 leading-snug min-h-[44px] block text-[#1A1A2E] hover:text-[#0B2F5C] transition">{p.name}</Link>
              <p className="mt-2 flex items-baseline gap-2">
                {p.oldPrice && <span className="line-through text-[#9CA3AF] text-sm">${p.oldPrice.toFixed(2)}</span>}
                {p.price == null ? (
                  <span className="font-display font-bold text-[20px] text-[#0B2F5C]">Enquire for price</span>
                ) : (
                  <span className="font-display font-bold text-[26px] text-[#0B2F5C]">${p.price.toFixed(2)}</span>
                )}
              </p>
              {p.oldPrice && (
              <div className="mt-3">
                <div className="h-2 bg-[#F3F4F6] overflow-hidden" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,6px 100%,0 calc(100% - 6px))" }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${claimed}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-[#0B2F5C] to-[#FFBB00]" />
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1.5"><b className="text-[#1A1A2E]">{claimed}% claimed</b> • Selling fast this week</p>
              </div>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => (p.price == null ? setEnquirySku(p.sku) : add(p.sku))} className="flex-1 bg-[#0B2F5C] text-white py-3 text-sm font-bold hover:bg-[#1A1A2E] active:scale-[0.99] transition flex items-center justify-center gap-2" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))" }}>
                  <ShoppingCart size={14} /> {p.price == null ? "Enquire" : p.oldPrice ? "Add deal to cart" : "Add to cart"}
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => toggleCompare(p.sku)} className={`flex-1 py-2 text-[12px] font-bold border transition ${inCompare ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#1A1A2E] hover:text-[#1A1A2E]"}`}>{inCompare ? "Added to compare" : "Compare"}</button>
                <button onClick={() => setEnquirySku(p.sku)} className="flex-1 py-2 text-[12px] font-bold border border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C] hover:text-[#0B2F5C] transition">Enquire</button>
              </div>
            </div>
          </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function TipperSelector() {
  const [body, setBody] = useState("2T Aluminium");
  const rows = {
    "1.5T Aluminium": ["W2450 x H2400", "24V", "TL-15-2450-2400"],
    "2T Aluminium": ["W2450 x H2400", "24V", "TL-20-2450-2400"],
    "2T Tall": ["W2450 x H2600", "24V", "TL-20-2450-2600"],
    "3T Steel": ["W2450 x H2600", "24V", "TL-30-2450-2600-S"],
  };
  const r = rows[body];
  return (
    <div className="rounded-2xl bg-[#1A1A2E] text-white p-6">
      <p className="text-[11px] font-black tracking-[0.2em] text-[#2F5E93] uppercase">Tail lift selector</p>
      <div className="mt-3 flex flex-wrap gap-2">{Object.keys(rows).map((b) => <button key={b} onClick={() => setBody(b)} className={`px-4 py-2 rounded-lg text-[13px] font-bold border transition ${body === b ? "bg-[#0B2F5C] border-[#0B2F5C]" : "border-white/15 text-white/60 hover:text-white"}`}>{b}</button>)}</div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">{r.map((x) => <p key={x} className="rounded-xl bg-white/5 border border-white/10 px-2 py-3 text-[13px] font-bold">{x}</p>)}</div>
      <Link to="/shop?cat=Tail%20Lifts" className="mt-4 inline-block bg-[#0B2F5C] rounded-lg px-5 py-2.5 text-[13px] font-bold">Shop tail lifts</Link>
    </div>
  );
}

function BrakeSelector() {
  const [atm, setAtm] = useState("Steel gear");
  const rows = {
    "Steel gear": ["27mm", "200L plus 200R", "GL-11113"],
    "No latch": ["27mm", "Without latch", "GL-11113-NL"],
    "Stainless": ["27mm", "50L plus 50R", "GL-11113S"],
    "Hinges": ["228 to 235mm", "Steel plus 304", "GL-13213"],
  };
  const r = rows[atm];
  return (
    <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6">
      <p className="text-[11px] font-black tracking-[0.2em] text-[#0B2F5C] uppercase">Door gear selector</p>
      <div className="mt-3 flex flex-wrap gap-2">{Object.keys(rows).map((a) => <button key={a} onClick={() => setAtm(a)} className={`px-4 py-2 rounded-lg text-[13px] font-bold border transition ${atm === a ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "border-[#E5E7EB] text-[#6B7280]"}`}>{a}</button>)}</div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">{r.map((x) => <p key={x} className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] px-2 py-3 text-[13px] font-bold text-[#1A1A2E]">{x}</p>)}</div>
      <Link to="/shop?cat=Trailer%20Parts" className="mt-4 inline-block border border-[#E5E7EB] rounded-lg px-5 py-2.5 text-[13px] font-bold hover:border-[#1A1A2E] transition">Shop trailer parts</Link>
    </div>
  );
}

export function ResourcesPage() {
  const [open, setOpen] = useState(0);
  const faqs = [
    ["How do I match parts to my truck?", "Use Make and Model Year in the Shop filters, then check the SKU and OEM cross on the product page. Still unsure? Send your VIN on the Contact page and a specialist confirms fitment."],
    ["How fast is delivery?", "VIC metro 1 day. Sydney, Brisbane and Adelaide 1 to 2 days. Perth and regional 2 to 5 days. Free freight over $500."],
    ["Genuine or aftermarket?", "Both. The brand and OEM cross reference is listed on every product so you can choose with confidence."],
    ["Do you offer fleet terms?", "Yes. Trade and fleet accounts can apply for 30 day terms at checkout or by contacting the parts desk."],
    ["Can I return a part?", "We offer hassle free change of mind returns on unused parts in original packaging. See our returns policy for details."],
  ];
  const articles = [...GUIDES, ...NEWS];
  const [art, setArt] = useState(null);
  const BODIES = {
    "How to pick the right tail lift": [["Capacity", "1.5T", "2T", "3T"], ["Platform", "W2450 x H2400", "W2450 x H2600", "W2450 x H2600"], ["Material", "Aluminium", "Aluminium", "Steel"]],
    "Door gear and hinge checklist": [["Part", "Locking gear", "Hinge 228mm", "Hinge 235mm"], ["Spec", "27mm L/R", "Steel", "304 stainless"], ["SKU", "GL-11113", "GL-13213", "GL-13195S"]],
    "Q track vs F track": [["Track", "Q steel", "Q stainless", "F steel"], ["Length", "4.5m", "4.5m", "4.5m"], ["SKU", "GL-19113H1", "GL-19113SH1", "GL-19111H1"]],
    "Toolbox lock and latch guide": [["Part", "Toolbox", "Paddle latch", "Lock"], ["Spec", "1200mm steel", "DN16 304", "Zinc alloy"], ["SKU", "GL-25126", "A20-01S-06", "GL-12140"]],
  };
  return (
    <div>
      <PageHero crumb="Resources" title="Guides plus" accent="answers." sub="Fitment explainers and the questions fleets ask most." />
      <div className="mx-auto max-w-7xl px-4 pt-12 grid md:grid-cols-2 gap-5">
        <TipperSelector />
        <BrakeSelector />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <SectionHead kicker="Workshop library" title="Latest guides" />
        <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <motion.div key={a.title} variants={staggerChild}>
              <button onClick={() => setArt(a)} className="group relative block w-full text-left h-72 overflow-hidden clip-cut-lg">
                <SafeImg src={a.img} alt={a.title} label={a.tag} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" wrapClass="absolute inset-0 w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/35 to-transparent" />
                <span className="clip-cut-lg absolute inset-0 border-[3px] border-[#0B2F5C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="clip-cut-sm absolute top-4 left-4 text-[11px] font-black uppercase tracking-wide bg-[#0B2F5C] text-white px-3 py-1.5">{a.tag}</span>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-display font-bold text-[19px] leading-tight">{a.title}</p>
                  <p className="text-[13px] text-white/70 mt-1.5 line-clamp-2">{a.desc || "Read the full workshop guide and fitment tips."}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-black text-[#2F5E93] group-hover:gap-2.5 transition-all">Read guide <ArrowRight size={14} /></span>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
          <Reveal>
            <h3 className="font-display font-bold text-2xl text-[#1A1A2E] mb-4">Frequently asked</h3>
            <div className="space-y-2">
              {faqs.map(([q, a], i) => (
                <div key={q} className="rounded-xl border border-[#E5E7EB] overflow-hidden bg-white">
                  <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex justify-between gap-3 px-5 py-4 font-semibold text-left text-[14px] text-[#1A1A2E] hover:bg-[#F7F8FA] transition">
                    {q}
                    <ChevronDown size={17} className={`text-[#9CA3AF] transition shrink-0 ${open === i ? "rotate-180 text-[#0B2F5C]" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {open === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-5 pb-5 text-[13px] text-[#6B7280] leading-relaxed">{a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal dir="right">
            <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] relative">
              <SafeImg src={GUIDES[2].img} alt="Workshop" label="AUREX" className="w-full h-56 object-cover" wrapClass="w-full h-56" />
              <div className="p-6 bg-[#1A1A2E] text-white">
                <p className="font-display font-bold text-xl">Need a hand from a specialist?</p>
                <p className="text-white/60 text-[14px] mt-2">Send your VIN and a photo. Our team replies within 4 business hours with the exact parts and pricing.</p>
                <Link to="/contact" className="mt-4 inline-flex items-center gap-2 bg-[#0B2F5C] text-white rounded-lg px-6 py-3 text-sm font-bold hover:bg-[#1A1A2E] transition">Contact the parts desk <ArrowRight size={14} /></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <AnimatePresence>
        {art && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setArt(null)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 max-h-[86vh] overflow-auto">
              <div className="flex items-start gap-3"><div><p className="text-[11px] font-bold text-[#0B2F5C]">{art.tag}</p><p className="font-display font-bold text-2xl text-[#1A1A2E] mt-1">{art.title}</p></div><button onClick={() => setArt(null)} className="ml-auto p-2 border border-[#E5E7EB] rounded-lg text-[#6B7280]"><X size={15} /></button></div>
              <img src={art.img} alt="" className="mt-4 w-full h-52 object-cover rounded-xl" loading="lazy" />
              <p className="mt-4 text-[14px] text-[#6B7280] leading-relaxed">{art.desc || "Workshop guide with fitment tips from the Aurex parts desk."} Match the table below to your rig, then shop the linked system with your SKU shortlist ready.</p>
              {BODIES[art.title] ? (
                <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E7EB]"><table className="w-full text-[13px] min-w-[480px]">
                  <tbody>{BODIES[art.title].map((row, i) => <tr key={i} className={i === 0 ? "bg-[#1A1A2E] text-white" : "border-t border-[#F3F4F6]"}>{row.map((c, j) => <td key={j} className="px-4 py-2.5 font-semibold">{c}</td>)}</tr>)}</tbody>
                </table></div>
              ) : (
                <ul className="mt-4 space-y-2">{["Check SKU plus OEM cross before ordering.", "Confirm voltage, size or grade against your old part.", "Torque all fasteners to spec and recheck after 50km.", "Keep your invoice for warranty plus returns."].map((t) => <li key={t} className="text-[14px] text-[#4B5563] flex gap-2"><span className="text-[#0B2F5C] font-black">✓</span>{t}</li>)}</ul>
              )}
              <div className="mt-5 flex gap-2.5"><Link to="/shop" onClick={() => setArt(null)} className="flex-1 text-center bg-[#0B2F5C] text-white rounded-xl py-3.5 text-sm font-bold">Shop related parts</Link><Link to="/contact" onClick={() => setArt(null)} className="flex-1 text-center border border-[#E5E7EB] rounded-xl py-3.5 text-sm font-bold">Ask a specialist</Link></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CompliancePage() {
  const { products } = useProducts();
  const RULES = [
    ["ADR 42/05", "General Safety Requirements", "Trailer Parts", "Hinges, door gear, locks and body fittings must stay secured in normal operation."],
    ["ADR 62/02", "Mechanical Connections", "Tail Lifts", "A fitted lift must not hide rear lamps, reflectors or the number plate, and must not compromise coupling access."],
    ["Load Restraint Guide", "Cargo Control", "Accessories", "Cargo bars, tracks and fittings must restrain loads to the national load restraint guide."],
    ["ADR 42/05", "Body Fittings", "Tool Boxes", "Tool boxes must be mounted securely with working latches and locks so lids cannot open in transit."],
    ["Best Practice", "Fitment Checks", "Replacement Parts", "Match handles, retainers and caps to the original variant and confirm left/right before ordering."],
    ["Best Practice", "Workshop Safety", "Tools and Others", "Rate rollers and hardware within their load limits and inspect welds and fasteners regularly."],
  ];
  return (
    <div>
      <PageHero crumb="Compliance" title="ADR" accent="compliance centre." sub="Every safety critical line maps to its Australian Design Rule. Buy with the paperwork story straight." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl bg-[#1A1A2E] text-white p-6 sm:p-8 flex flex-wrap items-center gap-4">
          <div><p className="font-display font-bold text-2xl">Compliance is our trust engine</p><p className="text-white/60 text-sm mt-1">Products are designed, manufactured and tested to comply with Australian Design Rules for tough local conditions.</p></div>
          <Link to="/shop" className="ml-auto bg-[#0B2F5C] rounded-lg px-6 py-3 text-sm font-bold">Shop compliant lines</Link>
        </div>
        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]">
            <thead><tr className="text-left text-[11px] text-[#9CA3AF]">{["RULE", "TITLE", "APPLIES TO", "COUNT"].map((h) => <th key={h} className="px-5 py-3.5 font-black tracking-widest">{h}</th>)}</tr></thead>
            <tbody>{RULES.map(([rule, title, cat, note]) => {
              const n = products.filter((p) => p.cat === cat).length;
              return <tr key={rule} className="border-t border-[#F3F4F6] hover:bg-[#F7F8FA]"><td className="px-5 py-3.5 font-black text-[#0B2F5C] whitespace-nowrap">{rule}</td><td className="px-5 py-3.5 font-semibold text-[#1A1A2E]">{title}<span className="block text-[12px] font-normal text-[#6B7280]">{note}</span></td><td className="px-5 py-3.5"><Link to={`/shop?cat=${encodeURIComponent(cat)}`} className="text-[13px] font-bold underline">{cat}</Link></td><td className="px-5 py-3.5 font-bold">{n} lines</td></tr>;
            })}</tbody>
          </table></div>
        </div>
        <p className="mt-4 text-[12px] text-[#9CA3AF]">Guidance summary only. Formal Component Type Approval documents are supplied with regulated lines on request through the contact page.</p>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { addEnquiry } = useSite();
  const [sent, setSent] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [f, setF] = useState({ name: "", phone: "", truck: "", message: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div>
      <PageHero crumb="Contact" title="Talk to the" accent="parts desk." sub="Send your VIN plus photos. A specialist replies within 4 business hours." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-[1fr_1.05fr] gap-8 items-start">
        <Reveal className="space-y-5">
          <div>
            <p className="text-[12px] font-black tracking-[0.22em] text-[#0B2F5C] uppercase">Reach the desk</p>
            <h2 className="font-display font-bold text-[26px] sm:text-[30px] text-[#1A1A2E] mt-1 leading-tight">Three ways to get parts moving</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[[Phone, "Call the trade desk", "03 9000 0000", "Mon to Fri, 8am to 5pm AEST"], [Mail, "Email us", "sales@aurextruckparts.com.au", "Replies within 4 business hours"], [MapPin, "Visit VIC", "41 Halley Court", "Campbellfield VIC 3061"], [Clock, "Pickup hours", "Mon to Fri 8am to 5pm", "Saturday by appointment"]].map(([Icon, k, v1, v2]) => (
              <div key={k} className="group bg-white border border-[#E5E7EB] p-5 hover:border-[#0B2F5C]/40 hover:shadow-card-hover transition">
                <span className="clip-notch grid place-items-center w-11 h-11 bg-[#0B2F5C] text-white mb-3 group-hover:scale-110 transition"><Icon size={19} /></span>
                <p className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">{k}</p>
                <p className="font-bold text-[#1A1A2E] mt-1 break-words">{v1}</p>
                <p className="text-[13px] text-[#6B7280] mt-0.5">{v2}</p>
              </div>
            ))}
          </div>
          <div className="relative overflow-hidden bg-[#1A1A2E] text-white p-6 clip-cut-lg">
            <div className="absolute inset-0 grid-scrim opacity-40" />
            <div className="relative flex items-center gap-4">
              <span className="clip-notch grid place-items-center w-12 h-12 bg-[#0B2F5C] shrink-0"><Phone size={22} /></span>
              <div>
                <p className="font-display font-bold text-lg leading-tight">Prefer to call? We match by VIN on the spot.</p>
                <p className="text-white/60 text-[13px] mt-1">Have your VIN and a photo ready for the fastest match.</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal dir="right">
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            setFormErr("");
            // Honeypot check
            if (f.website) { setSent(true); return; } // Pretend it sent
            
            const phoneRx = /^0[45]\d{8}$|^0[2378]\d{8}$/;
            if (!phoneRx.test(f.phone.replace(/\s/g, ''))) {
              setFormErr("Please enter a valid 10-digit Australian phone number.");
              return;
            }
            
            addEnquiry({ name: f.name, phone: f.phone, email: "", truck: f.truck || "Not specified", message: f.message }); 
            setSent(true); 
            setF({ name: "", phone: "", truck: "", message: "", website: "" }); 
          }} className="bg-white border border-[#E5E7EB] overflow-hidden shadow-card">
            <div className="relative overflow-hidden bg-[#1A1A2E] text-white px-7 py-6">
              <div className="absolute inset-0 grid-scrim opacity-40" />
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#0B2F5C]/25 blur-[70px]" />
              <p className="relative text-[11px] font-black tracking-[0.2em] text-[#2F5E93] uppercase">Send an enquiry</p>
              <p className="relative font-display font-bold text-xl mt-1">Tell us what you need</p>
            </div>
            <div className="p-7 grid gap-3.5">
              {sent && <p className="clip-cut-sm bg-emerald-50 border-2 border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3">Thanks. Your enquiry is logged and our VIC team will reply within 4 business hours.</p>}
              {formErr && <p className="clip-cut-sm bg-red-50 border-2 border-red-200 text-red-600 text-[13px] font-semibold px-4 py-3">{formErr}</p>}
              
              <div style={{ display: "none" }} aria-hidden="true">
                <label>Website <input type="text" name="_website" value={f.website || ""} onChange={set("website")} tabIndex="-1" autoComplete="off" /></label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <label className="grid gap-1.5"><span className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Full name</span>
                  <input required value={f.name} onChange={set("name")} placeholder="John Smith" className="rounded-lg px-4 py-3.5 text-sm bg-[#F7F8FA] border-2 border-[#E5E7EB] outline-none text-[#1A1A2E] focus:border-[#0B2F5C] transition" /></label>
                <label className="grid gap-1.5"><span className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Phone</span>
                  <input required value={f.phone} onChange={set("phone")} placeholder="0400 000 000" className="rounded-lg px-4 py-3.5 text-sm bg-[#F7F8FA] border-2 border-[#E5E7EB] outline-none text-[#1A1A2E] focus:border-[#0B2F5C] transition" /></label>
              </div>
              <label className="grid gap-1.5"><span className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Truck make and model</span>
                <input value={f.truck} onChange={set("truck")} placeholder="Kenworth T610, 2021" className="rounded-lg px-4 py-3.5 text-sm bg-[#F7F8FA] border-2 border-[#E5E7EB] outline-none text-[#1A1A2E] focus:border-[#0B2F5C] transition" /></label>
              <label className="grid gap-1.5"><span className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Parts needed plus quantities</span>
                <textarea required value={f.message} onChange={set("message")} placeholder="List the SKUs or describe the parts and how many..." rows={5} className="rounded-lg px-4 py-3.5 text-sm bg-[#F7F8FA] border-2 border-[#E5E7EB] outline-none text-[#1A1A2E] focus:border-[#0B2F5C] transition resize-none" /></label>
              <button className="clip-cut bg-[#0B2F5C] text-white py-4 text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#1A1A2E] transition"><Send size={16} /> Send enquiry</button>
              <p className="text-[12px] text-[#9CA3AF] text-center">We reply within 4 business hours on weekdays.</p>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

export function QuotePage() {
  const { cart, setCart, total, count } = useShop();
  const { addQuote, settings } = useSite();
  const [saved, setSaved] = useState(null);
  const [post, setPost] = useState("");
  const [est, setEst] = useState(null);
  const estimate = () => {
    const d = (post.trim()[0] || "");
    const table = { 3: ["VIC metro", "1 day", 15], 2: ["NSW", "1 to 2 days", 24], 4: ["QLD", "2 to 3 days", 28], 5: ["SA", "2 days", 24], 6: ["WA", "3 to 5 days", 39], 7: ["TAS", "2 to 3 days", 28], 0: ["NT plus ACT", "3 to 5 days", 39] };
    const z = table[d] || ["Australia wide", "1 to 5 days", 28];
    const free = total >= (settings?.freeFreightOver ?? 500);
    setEst({ zone: z[0], eta: z[1], fee: free ? 0 : z[2], free });
  };
  return (
    <div>
      <PageHero crumb="Quote" title="Your fleet" accent={`quote (${count}).`} sub="One list for the whole job." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-4">
          {cart.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-12 text-center">
              <p className="font-display font-bold text-2xl text-[#1A1A2E]">Quote is empty</p>
              <Link to="/shop" className="mt-4 inline-block bg-[#0B2F5C] text-white rounded-lg px-7 py-3.5 text-sm font-bold hover:bg-[#1A1A2E] transition">Browse shop</Link>
            </div>
          )}
          {cart.map((i) => (
            <div key={i.sku} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
              <SafeImg src={i.image} alt="" label={i.sku} className="w-16 h-16 rounded-xl object-cover shrink-0" wrapClass="w-16 h-16 rounded-xl" />
              <div className="flex-1 min-w-[200px]">
                <p className="text-[11px] font-semibold text-[#9CA3AF]">{i.sku}</p>
                <p className="font-semibold text-[#1A1A2E]">{i.name}</p>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">Qty {i.qty}</p>
              </div>
              <p className="font-display font-bold text-xl w-28 text-right text-[#1A1A2E]">${(i.price * i.qty).toFixed(2)}</p>
              <button onClick={() => setCart((c) => c.filter((x) => x.sku !== i.sku))} className="text-[12px] text-[#0B2F5C] font-semibold hover:underline">Remove</button>
            </div>
          ))}
        </div>
        <aside className="rounded-2xl bg-white border border-[#E5E7EB] p-7 lg:sticky lg:top-28 shadow-sm">
          <p className="font-display font-bold text-xl text-[#1A1A2E]">Summary</p>
          <p className="mt-3 font-display font-bold text-3xl text-[#1A1A2E]">${total.toFixed(2)}</p>
          <p className="mt-2 text-[12px] text-[#9CA3AF] flex gap-1.5"><BadgeCheck size={14} className="text-[#10B981] shrink-0 mt-0.5" /> Free freight over $500.</p>
          <div className="mt-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-4">
            <p className="text-[12px] font-black tracking-widest text-[#6B7280] uppercase">Freight estimate</p>
            <div className="mt-2 flex gap-2">
              <input value={post} onChange={(e) => setPost(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Postcode" inputMode="numeric" className="flex-1 min-w-0 rounded-lg px-3 py-2.5 text-sm bg-white border border-[#E5E7EB] outline-none" />
              <button onClick={estimate} className="bg-[#1A1A2E] text-white rounded-lg px-4 py-2.5 text-[13px] font-bold">Go</button>
            </div>
            {est && <p className="mt-2 text-[13px] text-[#1A1A2E]"><b>{est.zone}</b> • {est.eta} • <b>{est.fee === 0 ? "Free" : `$${est.fee.toFixed(2)}`}</b>{est.free && " (order over threshold)"}</p>}
          </div>
          {saved && <p className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3">Saved as {saved}. Our desk replies shortly.</p>}
          <button disabled={cart.length === 0} onClick={() => { const id = addQuote({ email: "", items: cart, total }); setSaved(id); }} className="mt-3 w-full border border-[#E5E7EB] rounded-xl py-3.5 text-sm font-bold hover:border-[#1A1A2E] transition disabled:opacity-40 disabled:pointer-events-none">Save as quote request</button>
          {cart.length === 0 ? (
            <span className="mt-2.5 flex items-center justify-center gap-2 bg-[#E5E7EB] text-[#9CA3AF] rounded-xl py-4 text-sm font-bold">Go to checkout</span>
          ) : (
          <Link to="/checkout" className="mt-2.5 flex items-center justify-center gap-2 bg-[#0B2F5C] text-white rounded-xl py-4 text-sm font-bold hover:bg-[#1A1A2E] transition"><Send size={15} /> Go to checkout</Link>
          )}
        </aside>
      </div>
    </div>
  );
}

export function TrackPage() {
  const [id, setId] = useState("");
  const [done, setDone] = useState(false);
  const found = (() => {
    if (!done) return null;
    try {
      const raw = localStorage.getItem("aurex_orders");
      const arr = raw ? JSON.parse(raw) : [];
      return arr.find((o) => o.id.toLowerCase() === id.trim().toLowerCase()) || null;
    } catch { return null; }
  })();
  const steps = found
    ? [["Packed in Campbellfield VIC", true], ["Courier booked", ["Courier booked", "In transit", "Delivered"].includes(found.status)], ["In transit", ["In transit", "Delivered"].includes(found.status)], ["Delivered", found.status === "Delivered"]]
    : [["Packed in Campbellfield VIC", true], ["Courier booked", true], ["In transit", false], ["Delivered", false]];
  return (
    <div>
      <PageHero crumb="Track" title="Where is" accent="my order?" sub="Enter the order number from your confirmation email." />
      <div className="mx-auto max-w-2xl px-4 py-12">
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 flex gap-2 shadow-sm">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] shrink-0"><PackageSearch size={20} className="text-[#6B7280]" /></span>
          <input value={id} onChange={(e) => setId(e.target.value)} required placeholder="AUX-0000" className="flex-1 min-w-0 bg-transparent outline-none font-bold tracking-widest text-[#1A1A2E]" />
          <button className="bg-[#0B2F5C] text-white rounded-xl px-6 py-3 text-sm font-bold hover:bg-[#1A1A2E] transition">Track</button>
        </form>
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <p className="font-bold text-[#1A1A2E]">Order {id || "AUX-0000"}</p>
              {done && !found && id.trim() !== "" && <p className="mt-1.5 text-[13px] text-[#9CA3AF]">No checkout record for this number in this browser. Showing demo timeline. Log in and order to track live.</p>}
              {found && <p className="mt-1.5 text-[13px] font-bold text-emerald-600">Live status: {found.status}, ${found.total.toFixed(2)}, {found.items.length} lines</p>}
              <div className="mt-3">
                {steps.map(([t, on], i) => (
                  <p key={t} className="flex gap-2.5 py-2 text-sm">
                    <span className={`w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold ${on ? "bg-[#10B981] text-white" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{on ? "✓" : i + 1}</span>
                    <span className={on ? "text-[#1A1A2E]" : "text-[#9CA3AF]"}>{t}</span>
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
