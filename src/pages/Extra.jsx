import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Phone, Send, PackageSearch, ArrowRight, BadgeCheck, MapPin, Mail, Clock } from "lucide-react";
import { BRANDS, GUIDES, NEWS } from "../data/catalog.js";
import { ProductCard, Reveal, SafeImg, SectionHead, staggerParent, staggerChild } from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import { useSite } from "../store/site.jsx";

function PageHero({ crumb, title, accent, sub, right }) {
  return (
    <section className="relative overflow-hidden bg-[#1A1A2E] text-white">
      <div className="absolute inset-0 grid-scrim opacity-40" />
      <div className="absolute -right-16 top-0 w-80 h-80 rounded-full bg-[#E53E00]/20 blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-9 flex flex-wrap items-end gap-5">
        <Reveal className="max-w-2xl">
          <p className="text-[12px] font-semibold text-white/50">
            <Link to="/" className="hover:text-[#FF6B35] transition">Home</Link>
            <span className="mx-1.5">/</span>{crumb}
          </p>
          <h1 className="font-display font-bold tracking-[-0.02em] text-[36px] sm:text-[50px] leading-[0.98] mt-3">
            {title} <span className="text-gradient">{accent}</span>
          </h1>
          {sub && <p className="text-white/60 text-[15px] mt-3 max-w-xl">{sub}</p>}
        </Reveal>
        {right && <div className="ml-auto">{right}</div>}
      </div>
    </section>
  );
}

export function CategoriesPage() {
  const { liveCategories: CATEGORIES } = useSite();
  return (
    <div>
      <PageHero crumb="Categories" title="Every system." accent="One home." sub="Twelve heavy systems with sub groups and live counts. Open any card for a pre filtered shop view." />
      <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="mx-auto max-w-7xl px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((c) => (
          <motion.div key={c.name} variants={staggerChild}>
            <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group relative block rounded-2xl overflow-hidden border border-[#E5E7EB] h-64 shine">
              <SafeImg src={c.image} alt={c.name} label={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" wrapClass="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/95 via-[#1A1A2E]/45 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#E53E00] text-white mb-3 group-hover:scale-110 transition"><c.icon size={20} /></span>
                <p className="font-display font-bold text-xl">{c.name}</p>
                <p className="text-white/70 text-[13px] mt-0.5">{c.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.subs.slice(0, 3).map((s) => (
                    <span key={s} className="text-[11px] bg-white/10 border border-white/15 rounded-lg px-2.5 py-1 text-white/80">{s}</span>
                  ))}
                </div>
                <p className="mt-3 text-[13px] font-bold text-[#FF6B35] flex items-center gap-1.5">{c.count} lines <ArrowRight size={14} className="group-hover:translate-x-1 transition" /></p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
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
                active === b ? "bg-[#E53E00] text-white border-[#E53E00] shadow-primary" : "bg-white border-[#E5E7EB] text-[#1A1A2E] hover:border-[#E53E00] hover:-translate-y-1 hover:shadow-card-hover"
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
                <Link to="/shop" onClick={() => setQuery(active.split(" ")[0])} className="ml-auto bg-[#E53E00] text-white rounded-lg px-6 py-3 text-sm font-bold hover:bg-[#C23400] transition">Open in shop</Link>
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
  const { add } = useShop();
  const { products: PRODUCTS } = useProducts();
  const deals = PRODUCTS.filter((p) => p.oldPrice).slice(0, 9);
  return (
    <div>
      <PageHero crumb="Deals" title="Live" accent="deals." sub="Clear pricing with stock bars showing how fast each offer moves." />
      <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="mx-auto max-w-7xl px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {deals.map((p, i) => (
          <motion.div key={p.sku} variants={staggerChild} className="rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] hover:border-[#E53E00]/40 hover:shadow-card-hover transition p-5">
            <p className="flex justify-between text-[11px] font-bold">
              <span className="bg-[#E53E00] text-white rounded-lg px-3 py-1">SAVE ${(p.oldPrice - p.price).toFixed(0)}</span>
              <span className="text-[#9CA3AF]">{p.sku}</span>
            </p>
            <Link to={`/product/${p.sku}`} className="block rounded-xl overflow-hidden mt-3 shine">
              <SafeImg src={p.image} alt={p.name} label={p.sku} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" wrapClass="w-full h-40" />
            </Link>
            <Link to={`/product/${p.sku}`} className="font-display font-semibold text-[16px] mt-3 leading-snug min-h-[44px] block text-[#1A1A2E] hover:text-[#E53E00] transition">{p.name}</Link>
            <p className="mt-2">
              <span className="line-through text-[#9CA3AF] text-sm">${p.oldPrice.toFixed(2)}</span>{" "}
              <span className="font-display font-bold text-[24px] text-[#E53E00] ml-1">${p.price.toFixed(2)}</span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${62 + ((i * 11) % 30)}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-[#E53E00] to-[#FFBB00]" />
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1.5">Selling fast this week</p>
            <button onClick={() => add(p.sku)} className="mt-3 w-full bg-[#E53E00] text-white rounded-lg py-3 text-sm font-bold hover:bg-[#C23400] transition">Add deal to cart</button>
          </motion.div>
        ))}
      </motion.div>
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
    "Tipper kit selection guide": [["Stage", "800mm", "900mm", "1050mm", "1200mm"], ["Suits", "8x5 single", "8x5 tandem", "10x5 tandem", "12ft bodies"], ["Oil needed", "12L", "16L", "20L", "28L"]],
    "Brake kit sizing guide": [["Trailer ATM", "750kg", "2T", "3.5T", "4.5T"], ["System", "Mechanical", "Hydraulic override", "Electric 10in", "Electric 12in"], ["Axles", "Single", "Single plus tandem", "Tandem", "Tri plus tandem"]],
    "Bearing finder by hub": [["Hub", "LM Holden", "Slimline", "Ford"], ["Cup", "11910/49", "L68149", "387A"], ["Cone", "67010/48", "L68110", "382A"]],
  };
  return (
    <div>
      <PageHero crumb="Resources" title="Guides plus" accent="answers." sub="Fitment explainers and the questions fleets ask most." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <SectionHead kicker="Workshop library" title="Latest guides" />
        <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <motion.div key={a.title} variants={staggerChild}>
              <div className="rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] hover:shadow-card-hover hover:border-[#E53E00]/40 transition h-full group">
                <div className="h-44 overflow-hidden relative shine">
                  <SafeImg src={a.img} alt={a.title} label={a.tag} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" wrapClass="w-full h-full" />
                  <span className="absolute top-3 left-3 text-[11px] font-bold bg-white/95 rounded-lg px-3 py-1.5 text-[#1A1A2E]">{a.tag}</span>
                </div>
                <div className="p-5">
                  <p className="font-display font-semibold text-[16px] text-[#1A1A2E] leading-snug">{a.title}</p>
                  <p className="text-[13px] text-[#6B7280] mt-1.5">{a.desc || "Read the full workshop guide and fitment tips."}</p>
                  <button onClick={() => setArt(a)} className="mt-3 text-[13px] font-bold text-[#E53E00] hover:underline">Read guide →</button>
                </div>
              </div>
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
                    <ChevronDown size={17} className={`text-[#9CA3AF] transition shrink-0 ${open === i ? "rotate-180 text-[#E53E00]" : ""}`} />
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
                <Link to="/contact" className="mt-4 inline-flex items-center gap-2 bg-[#E53E00] text-white rounded-lg px-6 py-3 text-sm font-bold hover:bg-[#C23400] transition">Contact the parts desk <ArrowRight size={14} /></Link>
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
              <div className="flex items-start gap-3"><div><p className="text-[11px] font-bold text-[#E53E00]">{art.tag}</p><p className="font-display font-bold text-2xl text-[#1A1A2E] mt-1">{art.title}</p></div><button onClick={() => setArt(null)} className="ml-auto p-2 border border-[#E5E7EB] rounded-lg text-[#6B7280]">✕</button></div>
              <img src={art.img} alt="" className="mt-4 w-full h-52 object-cover rounded-xl" loading="lazy" />
              <p className="mt-4 text-[14px] text-[#6B7280] leading-relaxed">{art.desc || "Workshop guide with fitment tips from the Aurex parts desk."} Match the table below to your rig, then shop the linked system with your SKU shortlist ready.</p>
              {BODIES[art.title] ? (
                <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E7EB]"><table className="w-full text-[13px] min-w-[480px]">
                  <tbody>{BODIES[art.title].map((row, i) => <tr key={i} className={i === 0 ? "bg-[#1A1A2E] text-white" : "border-t border-[#F3F4F6]"}>{row.map((c, j) => <td key={j} className="px-4 py-2.5 font-semibold">{c}</td>)}</tr>)}</tbody>
                </table></div>
              ) : (
                <ul className="mt-4 space-y-2">{["Check SKU plus OEM cross before ordering.", "Confirm voltage, size or grade against your old part.", "Torque all fasteners to spec and recheck after 50km.", "Keep your invoice for warranty plus returns."].map((t) => <li key={t} className="text-[14px] text-[#4B5563] flex gap-2"><span className="text-[#E53E00] font-black">✓</span>{t}</li>)}</ul>
              )}
              <div className="mt-5 flex gap-2.5"><Link to="/shop" onClick={() => setArt(null)} className="flex-1 text-center bg-[#E53E00] text-white rounded-xl py-3.5 text-sm font-bold">Shop related parts</Link><Link to="/contact" onClick={() => setArt(null)} className="flex-1 text-center border border-[#E5E7EB] rounded-xl py-3.5 text-sm font-bold">Ask a specialist</Link></div>
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
    ["ADR 38/05", "Trailer Braking Systems", "Braking", "Backing plates, drum kits, controllers and breakaway systems must meet braking performance rules."],
    ["ADR 6/00", "Direction Indicators", "Lighting", "Indicators must meet photometric and placement rules for trailers."],
    ["ADR 49/00", "Front, Rear and Side Lamps", "Lighting", "Stop, tail and end marker lamps must comply with visibility rules."],
    ["ADR 45/01", "Lighting Devices", "Lighting", "Signal devices not covered by ECE need local approval."],
    ["ADR 48/00", "Number Plate Illumination", "Lighting", "Rear plate must be lit. Our plate lamps cover this rule."],
    ["ADR 74/00", "Side Marker Lamps", "Lighting", "Side markers in amber and red at regulated spacings."],
    ["ADR 47/00", "Retro Reflectors", "Lighting", "Amber and red reflectors complete the conspicuity set."],
    ["ADR 1/00", "Reversing Lamps", "Lighting", "Reversing lamps where fitted must comply."],
    ["ADR 62/02", "Mechanical Connections", "Towing and Winches", "Couplings, balls and safety chains must meet connection rules."],
    ["ADR 96/00", "Commercial Vehicle Tyres", "Wheels and Tyres", "Tyres must carry compliant load and speed ratings."],
    ["ADR 42/05", "General Safety Requirements", "Truck Body", "Mudguards, flaps, mirrors and body fittings fall under general safety."],
  ];
  return (
    <div>
      <PageHero crumb="Compliance" title="ADR" accent="compliance centre." sub="Every safety critical line maps to its Australian Design Rule. Buy with the paperwork story straight." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl bg-[#1A1A2E] text-white p-6 sm:p-8 flex flex-wrap items-center gap-4">
          <div><p className="font-display font-bold text-2xl">Compliance is our trust engine</p><p className="text-white/60 text-sm mt-1">Products are designed, manufactured and tested to comply with Australian Design Rules for tough local conditions.</p></div>
          <Link to="/shop" className="ml-auto bg-[#E53E00] rounded-lg px-6 py-3 text-sm font-bold">Shop compliant lines</Link>
        </div>
        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]">
            <thead><tr className="text-left text-[11px] text-[#9CA3AF]">{["RULE", "TITLE", "APPLIES TO", "COUNT"].map((h) => <th key={h} className="px-5 py-3.5 font-black tracking-widest">{h}</th>)}</tr></thead>
            <tbody>{RULES.map(([rule, title, cat, note]) => {
              const n = products.filter((p) => p.cat === cat).length;
              return <tr key={rule} className="border-t border-[#F3F4F6] hover:bg-[#F7F8FA]"><td className="px-5 py-3.5 font-black text-[#E53E00] whitespace-nowrap">{rule}</td><td className="px-5 py-3.5 font-semibold text-[#1A1A2E]">{title}<span className="block text-[12px] font-normal text-[#6B7280]">{note}</span></td><td className="px-5 py-3.5"><Link to={`/shop?cat=${encodeURIComponent(cat)}`} className="text-[13px] font-bold underline">{cat}</Link></td><td className="px-5 py-3.5 font-bold">{n} lines</td></tr>;
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
  const [f, setF] = useState({ name: "", phone: "", truck: "", message: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div>
      <PageHero crumb="Contact" title="Talk to the" accent="parts desk." sub="Send your VIN plus photos. A specialist replies within 4 business hours." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-2 gap-6 items-start">
        <Reveal className="space-y-4">
          {[[MapPin, "Visit", "41 Halley Court, Campbellfield VIC 3061"], [Phone, "Call", "03 9000 0000, Mon to Fri 9am to 5pm"], [Mail, "Email", "sales@aurextruckparts.com.au"], [Clock, "Hours", "Mon to Fri 8am to 5pm AEST"]].map(([Icon, k, v]) => (
            <div key={k} className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-sm flex items-start gap-4">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#FFF0EB] text-[#E53E00] shrink-0"><Icon size={20} /></span>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">{k}</p>
                <p className="font-semibold mt-1 text-[#1A1A2E]">{v}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-gradient-to-br from-[#E53E00] to-[#C23400] p-6 flex items-center gap-4 text-white">
            <Phone size={28} />
            <p className="font-bold">Prefer to call? We match by VIN on the spot.</p>
          </div>
        </Reveal>
        <Reveal dir="right">
          <form onSubmit={(e) => { e.preventDefault(); addEnquiry({ name: f.name, phone: f.phone, email: "", truck: f.truck || "Not specified", message: f.message }); setSent(true); setF({ name: "", phone: "", truck: "", message: "" }); }} className="rounded-2xl bg-white border border-[#E5E7EB] p-7 grid gap-3 shadow-sm">
            {sent && <p className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3">Thanks. Your enquiry is logged and our VIC team will reply within 4 business hours.</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              <input required value={f.name} onChange={set("name")} placeholder="Full name" className="rounded-xl px-4 py-3.5 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-[#1A1A2E] focus:border-[#E53E00] transition" />
              <input required value={f.phone} onChange={set("phone")} placeholder="Phone" className="rounded-xl px-4 py-3.5 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-[#1A1A2E] focus:border-[#E53E00] transition" />
            </div>
            <input value={f.truck} onChange={set("truck")} placeholder="Truck make and model" className="rounded-xl px-4 py-3.5 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-[#1A1A2E] focus:border-[#E53E00] transition" />
            <textarea required value={f.message} onChange={set("message")} placeholder="Parts needed plus quantities" rows={5} className="rounded-xl px-4 py-3.5 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-[#1A1A2E] focus:border-[#E53E00] transition" />
            <button className="bg-[#E53E00] text-white rounded-xl py-4 text-sm font-bold hover:bg-[#C23400] transition">Send enquiry</button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

export function QuotePage() {
  const { cart, setCart, total, count } = useShop();
  const { addQuote } = useSite();
  const [saved, setSaved] = useState(null);
  return (
    <div>
      <PageHero crumb="Quote" title="Your fleet" accent={`quote (${count}).`} sub="One list for the whole job." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-4">
          {cart.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-12 text-center">
              <p className="font-display font-bold text-2xl text-[#1A1A2E]">Quote is empty</p>
              <Link to="/shop" className="mt-4 inline-block bg-[#E53E00] text-white rounded-lg px-7 py-3.5 text-sm font-bold hover:bg-[#C23400] transition">Browse shop</Link>
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
              <button onClick={() => setCart((c) => c.filter((x) => x.sku !== i.sku))} className="text-[12px] text-[#E53E00] font-semibold hover:underline">Remove</button>
            </div>
          ))}
        </div>
        <aside className="rounded-2xl bg-white border border-[#E5E7EB] p-7 lg:sticky lg:top-28 shadow-sm">
          <p className="font-display font-bold text-xl text-[#1A1A2E]">Summary</p>
          <p className="mt-3 font-display font-bold text-3xl text-[#1A1A2E]">${total.toFixed(2)}</p>
          <p className="mt-2 text-[12px] text-[#9CA3AF] flex gap-1.5"><BadgeCheck size={14} className="text-[#10B981] shrink-0 mt-0.5" /> Free freight over $500.</p>
          {saved && <p className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3">Saved as {saved}. Our desk replies shortly.</p>}
          <button onClick={() => { const id = addQuote({ email: "", items: cart, total }); setSaved(id); }} className="mt-3 w-full border border-[#E5E7EB] rounded-xl py-3.5 text-sm font-bold hover:border-[#1A1A2E] transition">Save as quote request</button>
          <Link to="/checkout" className="mt-2.5 flex items-center justify-center gap-2 bg-[#E53E00] text-white rounded-xl py-4 text-sm font-bold hover:bg-[#C23400] transition"><Send size={15} /> Go to checkout</Link>
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
          <button className="bg-[#E53E00] text-white rounded-xl px-6 py-3 text-sm font-bold hover:bg-[#C23400] transition">Track</button>
        </form>
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <p className="font-bold text-[#1A1A2E]">Order {id || "AUX-0000"}</p>
              {done && !found && id.trim() !== "" && <p className="mt-1.5 text-[13px] text-[#9CA3AF]">No checkout record for this number in this browser. Showing demo timeline. Log in and order to track live.</p>}
              {found && <p className="mt-1.5 text-[13px] font-bold text-emerald-600">Live status: {found.status} • ${found.total.toFixed(2)} • {found.items.length} lines</p>}
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
