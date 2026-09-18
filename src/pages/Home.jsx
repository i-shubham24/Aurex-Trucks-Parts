import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones,
  ChevronRight, Flame,
} from "lucide-react";
import { GUIDES, NEWS, TESTIMONIALS } from "../data/catalog.js";
import {
  SectionHead, ProductRailCard, Reveal, SafeImg,
  Countdown, staggerParent, staggerChild,
} from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import YMMWidget from "../components/garage/YMMWidget.jsx";
import HeroFeature from "../components/home/HeroFeature.jsx";
import PartnerCarousel from "../components/home/PartnerCarousel.jsx";
import TestimonialCarousel from "../components/home/TestimonialCarousel.jsx";
import { RangeBento } from "../components/home/Showcase.jsx";

export default function Home() {
  const { add } = useShop();
  const { products: PRODUCTS } = useProducts();
  const findP = (sku) => PRODUCTS.find((p) => p.sku === sku);
  const [tab, setTab] = useState("Most Reordered");

  const dealEnd = useMemo(() => Date.now() + 4 * 86400000 + 9 * 3600000, []);
  const deal = findP("GL-25126");

  const tabs = ["Most Reordered", "Tail Lifts", "Trailer Parts", "Tool Boxes"];
  const tabProducts = useMemo(() => {
    if (tab === "Most Reordered") return [...PRODUCTS].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    return PRODUCTS.filter((p) => p.cat === tab);
  }, [tab, PRODUCTS]);

  return (
    <div className="space-y-0">
      {/* 1. Hero Feature */}
      <HeroFeature />

      {/* 2. Running Trusted Supplier Partner Carousel */}
      <PartnerCarousel />

      {/* 3. Range Bento (Shop by Bay) */}
      <div className="py-6">
        <RangeBento />
      </div>

      {/* 4. Garage / Rig Fitment Section */}
      <section className="relative overflow-hidden bg-[#F4F7FB] border-y border-[#D7E4F2] py-20">
        <div className="absolute -right-24 -top-24 w-[380px] h-[380px] rounded-full bg-[#9AC1EE]/25 blur-[110px]" />
        <div className="absolute -left-24 -bottom-24 w-[380px] h-[380px] rounded-full bg-[#134E8D]/10 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div className="relative overflow-hidden bg-[#222538] text-white p-8 sm:p-12 flex flex-col justify-center rounded-2xl shadow-elevated">
              <div className="absolute inset-0 grid-scrim opacity-20" />
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#134E8D]/40 blur-[90px]" />
              <Reveal className="relative">
                <p className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.22em] text-[#134E8D] uppercase bg-white rounded-full px-4 py-1.5">
                  Vehicle Fitment Guarantee
                </p>
                <h2 className="font-display font-black text-[30px] sm:text-[40px] leading-[1.05] mt-4">
                  Select your truck once.<br /><span className="text-[#9DB9DD]">We filter the whole catalog.</span>
                </h2>
                <p className="text-white/75 text-[14px] mt-3 leading-relaxed max-w-lg">
                  Ensure 100% precision fit for your chassis, bodybuilder setup, and hydraulic configurations before ordering.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3.5">
                  {[["01", "Select Make"], ["02", "Select Model"], ["03", "Exact Fit Only"]].map(([n, t]) => (
                    <div key={n} className="rounded-xl bg-white/[0.06] border border-white/10 p-3.5 text-center">
                      <p className="font-display font-black text-[#9DB9DD] text-lg">{n}</p>
                      <p className="text-white/90 text-[12px] font-semibold mt-1">{t}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="relative bg-white border border-[#D7E4F2] shadow-elevated p-8 sm:p-10 flex flex-col justify-center rounded-2xl overflow-hidden">
              <span className="absolute top-0 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-[#134E8D] via-[#5B93D1] to-[#B9D6F2]" />
              <p className="text-[12px] font-black tracking-[0.22em] text-[#134E8D] uppercase">Find Parts That Fit</p>
              <h3 className="font-display font-bold text-[22px] text-[#222538] mt-1">Check Rig Compatibility</h3>
              <p className="text-[13px] text-[#6B7280] mt-1 mb-6">Select your commercial vehicle specifications below:</p>
              <div><YMMWidget variant="hero" /></div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. Featured Products Tabs */}
      <section className="bg-white py-20 border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-10">
            <div>
              <p className="text-[12px] font-black tracking-[0.22em] text-[#134E8D] uppercase mb-1">Featured Inventory</p>
              <h2 className="font-display font-bold text-[28px] sm:text-[38px] text-[#222538] leading-[1.05]">Most Reordered Lines</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-[13px] font-bold rounded-xl border transition ${tab === t
                      ? "bg-[#134E8D] text-white border-[#134E8D] shadow-sm"
                      : "bg-[#F7F8FA] border-[#E5E7EB] text-[#6B7280] hover:border-[#134E8D] hover:text-[#134E8D]"
                    }`}
                >
                  {t}
                </button>
              ))}
              <Link to="/shop" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-black text-[#134E8D] hover:gap-3 transition-all ml-2">
                View All <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {tabProducts.slice(0, tab === "Most Reordered" ? 8 : 4).map((p, i) => (
              <ProductRailCard key={p.sku} p={p} index={i} />
            ))}
          </div>
        </div>
      </section>


      {/* 7. OEM Fleet Compatibility Grid */}
      <section className="bg-[#F8FAFC] py-16 border-y border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-[12px] font-black tracking-[0.22em] text-[#134E8D] uppercase">OEM & Fleet Fitment</p>
            <h2 className="font-display font-bold text-[26px] sm:text-[34px] text-[#222538] mt-1">Cross-Referenced for Major Heavy Transport Fleets</h2>
            <p className="text-[14px] text-[#6B7280] mt-2">Direct-fit replacement hardware, tail lifts, and spares matched for Australian heavy vehicles.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
            {[
              { make: "Kenworth", type: "Prime Movers" },
              { make: "Isuzu", type: "Rigid & Medium" },
              { make: "Hino", type: "Commercial Truck" },
              { make: "Volvo", type: "Heavy Transport" },
              { make: "Mack", type: "Heavy Duty" },
              { make: "Scania", type: "Linehaul Fleets" },
              { make: "Freighter", type: "Semi-Trailers" },
              { make: "Maxi-CUBE", type: "Refrigerated Vans" },
              { make: "Vawdrey", type: "Curtainsiders" },
              { make: "Krueger", type: "Freighters" },
              { make: "Barker", type: "Custom Bodies" },
              { make: "DAF", type: "Rigid & Haul" }
            ].map((rig) => (
              <div key={rig.make} className="bg-white border border-[#E5E7EB] hover:border-[#134E8D] p-4 rounded-xl text-center transition group shadow-sm">
                <p className="font-display font-bold text-[15px] text-[#222538] group-hover:text-[#134E8D] transition">{rig.make}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{rig.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 4-Pillar Trust Strip */}
      <section className="bg-white border-b border-[#E5E7EB] py-10">
        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-40px" }}
          className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
        >
          {[
            [Truck, "Quick Dispatch", "Shipped Australia wide in 1 to 2 business days"],
            [Headphones, "Expert Support", "Over 20 years of heavy vehicle knowledge"],
            [ShieldCheck, "ADR Compliant", "Tested to Australian Design Rules"],
            [RotateCcw, "Simple Returns", "Right part guarantee or return without hassle"],
          ].map(([Icon, title, desc]) => (
            <motion.div key={title} variants={staggerChild} className="flex items-start gap-3.5">
              <span className="grid place-items-center w-11 h-11 bg-[#EDF3FA] text-[#134E8D] shrink-0 rounded-xl">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-bold text-[14px] text-[#222538]">{title}</p>
                <p className="text-[12px] text-[#6B7280] mt-0.5 leading-snug">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 8. Deal of the week */}
      {deal && deal.price != null && (
        <section className="relative overflow-hidden bg-[#222538] text-white py-20">
          <div className="absolute inset-0 grid-scrim opacity-40" />
          <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-[#134E8D]/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-10 items-center">
            <Reveal dir="left">
              <div className="relative overflow-hidden shine rounded-2xl">
                <SafeImg src={deal.image} alt={deal.name} label={deal.sku} className="w-full h-[360px] object-cover" wrapClass="w-full h-[360px]" />
                {deal.oldPrice ? (
                  <span className="absolute top-4 left-4 bg-[#134E8D] text-white text-sm font-black px-3.5 py-1.5 shadow-primary rounded-lg">
                    Save ${(deal.oldPrice - deal.price).toFixed(0)}
                  </span>
                ) : null}
              </div>
            </Reveal>
            <Reveal dir="right">
              <p className="text-[12px] font-black tracking-[0.22em] text-[#9AC1EE] uppercase flex items-center gap-2">
                <Flame size={16} /> Deal of the week
              </p>
              <h2 className="font-display font-bold text-[32px] sm:text-[42px] leading-[1.05] mt-3">{deal.name}</h2>
              <p className="text-white/85 text-[15px] mt-3 max-w-md leading-relaxed">{deal.desc}</p>
              <div className="mt-5 flex items-end gap-4">
                <span className="font-display font-bold text-[44px] text-white">${deal.price.toFixed(2)}</span>
                {deal.oldPrice ? (
                  <span className="line-through text-white/40 text-lg mb-2">${deal.oldPrice.toFixed(2)}</span>
                ) : null}
              </div>
              <div className="mt-6"><Countdown end={dealEnd} /></div>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => add(deal.sku)} className="bg-[#134E8D] text-white px-7 py-4 text-sm font-black uppercase tracking-wide hover:bg-white hover:text-[#134E8D] transition flex items-center gap-2 shadow-primary rounded-xl">
                  Add to cart <ArrowRight size={15} />
                </button>
                <Link to={`/product/${deal.sku}`} className="border-2 border-white/25 hover:border-white/60 px-7 py-4 text-sm font-bold transition rounded-xl">
                  View Details
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 9. Testimonials Carousel */}
      <TestimonialCarousel items={TESTIMONIALS} />

      {/* 10. Guides / Resources */}
      <section className="py-20 bg-[#F2F6FB] border-t border-[#D7E4F2]">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead kicker="Resources" title="Guides that save downtime" sub="Short reads from the workshop. The full library lives on Resources." link="/resources" linkLabel="All guides" />
          {(() => {
            const [lead, ...rest] = [...GUIDES, ...NEWS].slice(0, 4);
            return (
              <div className="grid lg:grid-cols-2 gap-6 items-stretch">
                <motion.div variants={staggerChild} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-40px" }}>
                  <Link to="/resources" className="group relative block h-full min-h-[380px] overflow-hidden rounded-2xl">
                    <SafeImg src={lead.img} alt={lead.title} label={lead.tag} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" wrapClass="absolute inset-0 w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1526]/95 via-[#0d1526]/30 to-transparent" />
                    <span className="absolute top-5 left-5 text-[11px] font-black uppercase tracking-widest bg-white text-[#134E8D] px-3.5 py-2 rounded-lg">
                      {lead.tag} · Featured
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <p className="font-display font-bold text-white text-[26px] sm:text-[32px] leading-tight">{lead.title}</p>
                      <p className="text-white/80 text-[14px] mt-2 max-w-md">{lead.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-wide text-white">
                        Read guide <span className="grid place-items-center w-8 h-8 rounded-full bg-white text-[#134E8D] group-hover:gap-3 transition-all"><ArrowRight size={15} /></span>
                      </span>
                    </div>
                  </Link>
                </motion.div>
                <div className="grid gap-4 content-start">
                  {rest.map((g, i) => (
                    <motion.div key={g.title} variants={staggerChild} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.07 }}>
                      <Link to="/resources" className="group flex gap-4 bg-white border border-[#E5E7EB] p-3.5 pr-5 hover:border-[#134E8D]/50 hover:shadow-card-hover transition items-center rounded-xl">
                        <span className="font-display font-black text-[15px] text-[#9CA3AF] group-hover:text-[#134E8D] transition pl-2">0{i + 2}</span>
                        <span className="w-24 h-20 shrink-0 overflow-hidden rounded-xl">
                          <SafeImg src={g.img} alt={g.title} label={g.tag} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" wrapClass="w-full h-full" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-black tracking-[0.18em] text-[#134E8D] uppercase">{g.tag}</span>
                          <span className="block font-display font-bold text-[16px] text-[#222538] leading-snug truncate">{g.title}</span>
                          <span className="block text-[12px] text-[#6B7280] truncate mt-0.5">{g.desc}</span>
                        </span>
                        <ChevronRight size={17} className="text-[#C7CBD1] group-hover:text-[#134E8D] group-hover:translate-x-1 transition shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                  <Link to="/resources" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#B9D0E8] text-[#134E8D] font-bold text-[14px] py-4 hover:bg-white hover:border-[#134E8D] transition">
                    Open the full library <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
