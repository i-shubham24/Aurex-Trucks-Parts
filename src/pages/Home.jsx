import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones,
  ChevronRight, Flame,
} from "lucide-react";
import { GUIDES, NEWS, TESTIMONIALS } from "../data/catalog.js";
import {
  SectionHead, ProductCard, ProductRailCard, Reveal, ScrollRow, Countdown, SafeImg,
  staggerParent, staggerChild,
} from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import YMMWidget from "../components/garage/YMMWidget.jsx";
import HeroFeature from "../components/home/HeroFeature.jsx";
import BrandWall from "../components/home/BrandWall.jsx";
import TestimonialCarousel from "../components/home/TestimonialCarousel.jsx";
import { RangeBento, TrustTabs, StatsBand, RangeShowcase } from "../components/home/Showcase.jsx";

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
    <div>
      {/* Hero with animated words + browse categories slider */}
      <HeroFeature />

      {/* Trust strip */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <motion.div
          variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-40px" }}
          className="mx-auto max-w-7xl px-4 py-7 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            [Truck, "Quick dispatch", "Shipped Australia wide in 1 to 2 business days"],
            [Headphones, "Expert support", "Over 20 years of heavy vehicle knowledge"],
            [ShieldCheck, "ADR compliant", "Tested to Australian Design Rules"],
            [RotateCcw, "Simple returns", "Right part or send it back, no restock fee"],
          ].map(([Icon, title, desc]) => (
            <motion.div key={title} variants={staggerChild} className="flex items-start gap-3">
              <span className="grid place-items-center w-11 h-11 bg-[#E8EEF5] text-[#0B2F5C] shrink-0" style={{ clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)" }}>
                <Icon size={20} />
              </span>
              <div>
                <p className="font-bold text-[14px] text-[#1A1A2E]">{title}</p>
                <p className="text-[12px] text-[#6B7280] mt-0.5 leading-snug">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <RangeBento />

      {/* Garage filter band — full-width squared section */}
      <section className="relative overflow-hidden bg-[#EAF2FA] border-y border-[#D7E4F2] py-14">
        <div className="absolute -right-24 -top-24 w-[380px] h-[380px] rounded-full bg-[#8FB4E0]/25 blur-[110px]" />
        <div className="absolute -left-24 -bottom-24 w-[380px] h-[380px] rounded-full bg-[#0B2F5C]/10 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <div className="relative overflow-hidden bg-[#1A1A2E] text-white p-7 sm:p-10 flex flex-col justify-center clip-cut-lg">
              <div className="absolute inset-0 grid-scrim opacity-20" />
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#0B2F5C]/40 blur-[90px]" />
              <Reveal className="relative">
                <p className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.22em] text-[#0B2F5C] uppercase bg-white rounded-full px-4 py-2">Stop scrolling parts that will not fit</p>
                <h2 className="font-display font-black text-[30px] sm:text-[42px] leading-[1.02] mt-4">
                  Tell us your truck once.<br /><span className="text-[#9DB9DD]">We filter the whole store.</span>
                </h2>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[["1", "Pick make"], ["2", "Pick model"], ["3", "Shop filtered"]].map(([n, t]) => (
                    <div key={n} className="rounded-2xl bg-white/[0.06] border border-white/10 p-3 text-center">
                      <p className="font-display font-black text-[#9DB9DD] text-xl">{n}</p>
                      <p className="text-white/85 text-[12px] font-semibold mt-1">{t}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="relative bg-white border border-[#D7E4F2] shadow-elevated p-6 sm:p-8 flex flex-col justify-center overflow-hidden clip-cut-lg">
              <span className="absolute top-0 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-[#0B2F5C] via-[#5B93D1] to-[#B9D6F2]" />
              <p className="text-[12px] font-black tracking-[0.22em] text-[#0B2F5C] uppercase">Find parts that fit</p>
              <p className="text-[13px] text-[#6B7280] mt-1">Set your truck once, we filter everything.</p>
              <div className="mt-4"><YMMWidget variant="hero" /></div>
            </Reveal>
          </div>
        </div>
      </section>

      <RangeShowcase />

      {/* Featured products tabs */}
      <section className="bg-[#F7F8FA] py-16 border-y border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
            <div>
              <p className="text-[12px] font-black tracking-[0.22em] text-[#0B2F5C] uppercase mb-2">Featured products</p>
              <h2 className="font-display font-bold text-[28px] sm:text-[38px] text-[#1A1A2E] leading-[1.05]">Most reordered lines</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-[13px] font-bold border transition ${tab === t ? "bg-[#0B2F5C] text-white border-[#0B2F5C]" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C] hover:text-[#0B2F5C]"}`}>{t}</button>
              ))}
              <Link to="/shop" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-black text-[#0B2F5C] hover:gap-3 transition-all">See all products <ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tabProducts.slice(0, tab === "Most Reordered" ? 8 : 4).map((p, i) => (
              <ProductRailCard key={p.sku} p={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <StatsBand />

      {/* Trusted brands wall */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHead kicker="Brands we stock" title="The names your workshop trusts" sub="Tail lifts, door hardware and trailer gear from our approved suppliers." center />
        <BrandWall />
        <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-3 justify-center">
          <span className="text-[11px] font-black tracking-[0.2em] text-[#9CA3AF] uppercase">Stockists include</span>
          {["Beauway", "Ganland", "Caiyuan", "Aurex"].map((b) => (
            <Link key={b} to="/brands" className="font-display font-bold tracking-wide text-[#1A1A2E]/70 hover:text-[#0B2F5C] transition text-[15px]">{b}</Link>
          ))}
        </div>
      </section>

      {/* Deal of the week */}
      {deal && deal.price != null && (
        <section className="relative overflow-hidden bg-[#1A1A2E] text-white">
          <div className="absolute inset-0 grid-scrim opacity-40" />
          <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-[#0B2F5C]/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
            <Reveal dir="left">
              <div className="relative overflow-hidden shine" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,32px 100%,0 calc(100% - 32px))" }}>
                <SafeImg src={deal.image} alt={deal.name} label={deal.sku} className="w-full h-[360px] object-cover" wrapClass="w-full h-[360px]" />
                {deal.oldPrice ? (
                  <span className="absolute top-4 left-4 bg-[#0B2F5C] text-white text-sm font-black px-3 py-1.5 shadow-primary">Save ${(deal.oldPrice - deal.price).toFixed(0)}</span>
                ) : null}
              </div>
            </Reveal>
            <Reveal dir="right">
              <p className="text-[12px] font-black tracking-[0.22em] text-[#8FB4E0] uppercase flex items-center gap-2"><Flame size={16} /> Deal of the week</p>
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
                <button onClick={() => add(deal.sku)} className="bg-[#0B2F5C] text-white px-7 py-4 text-sm font-black uppercase tracking-wide hover:bg-white hover:text-[#0B2F5C] transition flex items-center gap-2 shadow-primary" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))" }}>
                  Add to cart <ArrowRight size={15} />
                </button>
                <Link to={`/product/${deal.sku}`} className="border-2 border-white/25 hover:border-white/60 px-7 py-4 text-sm font-bold transition">View details</Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <TrustTabs />

      {/* Testimonials carousel */}
      <TestimonialCarousel items={TESTIMONIALS} />

      {/* Guides: magazine */}
      <section className="py-16 bg-[#F2F6FB] border-y border-[#D7E4F2]">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead kicker="Resources" title="Guides that save downtime" sub="Short reads from the workshop. The full library lives on Resources." link="/resources" linkLabel="All guides" />
          {(() => {
            const [lead, ...rest] = [...GUIDES, ...NEWS].slice(0, 4);
            return (
              <div className="grid lg:grid-cols-2 gap-5 items-stretch">
                <motion.div variants={staggerChild} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-40px" }}>
                  <Link to="/resources" className="group relative block h-full min-h-[380px] overflow-hidden clip-cut-lg">
                    <SafeImg src={lead.img} alt={lead.title} label={lead.tag} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" wrapClass="absolute inset-0 w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1526]/95 via-[#0d1526]/30 to-transparent" />
                    <span className="absolute top-5 left-5 text-[11px] font-black uppercase tracking-widest bg-white text-[#0B2F5C] px-3.5 py-2" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px))" }}>{lead.tag} · Featured</span>
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <p className="font-display font-bold text-white text-[26px] sm:text-[32px] leading-tight">{lead.title}</p>
                      <p className="text-white/80 text-[14px] mt-2 max-w-md">{lead.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-wide text-white">Read guide <span className="grid place-items-center w-8 h-8 rounded-full bg-white text-[#0B2F5C] group-hover:gap-3 transition-all"><ArrowRight size={15} /></span></span>
                    </div>
                  </Link>
                </motion.div>
                <div className="grid gap-4 content-start">
                  {rest.map((g, i) => (
                    <motion.div key={g.title} variants={staggerChild} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.07 }}>
                      <Link to="/resources" className="group flex gap-4 bg-white border border-[#E5E7EB] p-3 pr-5 hover:border-[#0B2F5C]/50 hover:shadow-card-hover transition items-center" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,14px 100%,0 calc(100% - 14px))" }}>
                        <span className="font-display font-black text-[15px] text-[#9CA3AF] group-hover:text-[#0B2F5C] transition pl-2">0{i + 2}</span>
                        <span className="w-24 h-20 shrink-0 overflow-hidden rounded-xl">
                          <SafeImg src={g.img} alt={g.title} label={g.tag} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" wrapClass="w-full h-full" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-black tracking-[0.18em] text-[#0B2F5C] uppercase">{g.tag}</span>
                          <span className="block font-display font-bold text-[16px] text-[#1A1A2E] leading-snug truncate">{g.title}</span>
                          <span className="block text-[12px] text-[#6B7280] truncate mt-0.5">{g.desc}</span>
                        </span>
                        <ChevronRight size={17} className="text-[#C7CBD1] group-hover:text-[#0B2F5C] group-hover:translate-x-1 transition shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                  <Link to="/resources" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#B9D0E8] text-[#0B2F5C] font-bold text-[14px] py-4 hover:bg-white hover:border-[#0B2F5C] transition">Open the full library <ArrowRight size={15} /></Link>
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
