import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, BadgeCheck, Truck, RotateCcw, Headphones,
  ChevronRight, Star, Flame,
} from "lucide-react";
import { PANELS, GUIDES, NEWS, TESTIMONIALS } from "../data/catalog.js";
import {
  SectionHead, ProductCard, Reveal, ScrollRow, Countdown, SafeImg,
  staggerParent, staggerChild,
} from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import YMMWidget from "../components/garage/YMMWidget.jsx";
import HeroFeature from "../components/home/HeroFeature.jsx";
import CategoryBoxes from "../components/home/CategoryBoxes.jsx";
import CategoryCircles from "../components/home/CategoryCircles.jsx";
import BrandWall from "../components/home/BrandWall.jsx";

export default function Home() {
  const { add } = useShop();
  const { products: PRODUCTS } = useProducts();
  const findP = (sku) => PRODUCTS.find((p) => p.sku === sku);
  const [tab, setTab] = useState("Most Reordered");

  const dealEnd = useMemo(() => Date.now() + 4 * 86400000 + 9 * 3600000, []);
  const deal = findP("EW3000R");

  const tabs = ["Most Reordered", "Braking", "Lighting", "Towing and Winches"];
  const tabProducts = useMemo(() => {
    if (tab === "Most Reordered") return PRODUCTS.slice(0, 10);
    return PRODUCTS.filter((p) => p.cat === tab).slice(0, 10);
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
              <span className="grid place-items-center w-11 h-11 bg-[#FFF5F0] border border-[#DE5718]/15 text-[#DE5718] shrink-0" style={{ clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)" }}>
                <Icon size={20} />
              </span>
              <div>
                <p className="font-bold text-[14px] text-[#12151C]">{title}</p>
                <p className="text-[12px] text-[#6B7280] mt-0.5 leading-snug">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CarParts style category boxes */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <CategoryBoxes />
      </section>

      {/* Shop by category medallions */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <SectionHead kicker="Shop by category" title="Every system on the truck" sub="From backing plates to beacons. Twelve core systems, one catalogue." link="/categories" linkLabel="All categories" center />
        <CategoryCircles />
      </section>

      {/* Vehicle selector prompt banner */}
      <section className="bg-[#12151C] relative overflow-hidden text-white">
        <div className="absolute inset-0 grid-scrim opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center">
          <Reveal>
            <p className="text-[12px] font-black tracking-[0.22em] text-[#F57429] uppercase">Stop scrolling parts that will not fit</p>
            <h2 className="font-display font-black text-white text-[30px] sm:text-[40px] leading-[1.03] mt-2">
              Tell us your truck once.<br />We filter the whole store.
            </h2>
            <p className="text-white/55 text-[15px] mt-3 max-w-md leading-relaxed">
              Pick your make, model and year. Every part gets a clear fits, universal, or not a match flag so you order right the first time.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <YMMWidget variant="hero" />
          </Reveal>
        </div>
      </section>

      {/* Featured 3 panels */}
      <section className="mx-auto max-w-7xl px-4 py-16 space-y-14">
        {PANELS.map((item, i) => {
          const prod = findP(item.sku);
          const reverse = i % 2 === 1;
          return (
            <div key={item.kicker} className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? "lg:grid-flow-dense" : ""}`}>
              <Reveal dir={reverse ? "right" : "left"} className={reverse ? "lg:col-start-2" : ""}>
                <p className="text-[12px] font-black tracking-[0.2em] text-[#DE5718] flex items-center gap-2">
{item.kicker}
                </p>
                <h3 className="font-display font-bold text-[30px] sm:text-[40px] leading-[1.05] text-[#12151C] mt-3">{item.title}</h3>
                <p className="text-[#6B7280] text-[15px] mt-3 leading-relaxed max-w-lg">{item.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2.5 text-[14px] text-[#12151C] font-medium">
                      <BadgeCheck size={18} className="text-[#10B981] shrink-0" />{pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-4">
                  <Link to={item.link} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EE6724] to-[#DE5718] hover:from-[#DE5718] hover:to-[#B43808] text-white px-6 py-3.5 text-sm font-black uppercase tracking-wide hover:gap-3 shadow-sm transition-all" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px))" }}>
                    View range <ArrowRight size={15} />
                  </Link>
                  {prod && <span className="text-sm text-[#6B7280]">from <b className="font-display text-[#12151C] text-lg">${prod.price.toFixed(2)}</b></span>}
                </div>
              </Reveal>
              <Reveal dir={reverse ? "left" : "right"} className={reverse ? "lg:col-start-1 lg:row-start-1" : ""}>
                <div className="relative overflow-hidden shine group" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,32px 100%,0 calc(100% - 32px))" }}>
                  <SafeImg src={item.img} alt={item.title} label={item.kicker} className="w-full h-[340px] object-cover group-hover:scale-105 transition-transform duration-700" wrapClass="w-full h-[340px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className="clip-cut-sm absolute bottom-5 left-6 bg-white/95 backdrop-blur px-4 py-2 text-[12px] font-bold text-[#12151C]">Australian owned. Fleet trusted.</span>
                </div>
              </Reveal>
            </div>
          );
        })}
      </section>

      {/* Featured products tabs */}
      <section className="bg-[#F7F8FA] py-16 border-y border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
            <div>
              <p className="text-[12px] font-black tracking-[0.22em] text-[#DE5718] uppercase mb-2">Featured products</p>
              <h2 className="font-display font-bold text-[28px] sm:text-[38px] text-[#12151C] leading-[1.05]">Most reordered lines</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-[13px] font-bold border transition ${tab === t ? "bg-[#DE5718] text-white border-[#DE5718]" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#DE5718] hover:text-[#DE5718]"}`}>{t}</button>
              ))}
            </div>
          </div>
          <ScrollRow>
            {tabProducts.map((p, i) => (
              <div key={p.sku} className="min-w-[270px] max-w-[270px]">
                <ProductCard p={p} index={i} />
              </div>
            ))}
          </ScrollRow>
        </div>
      </section>

      {/* Deal of the week */}
      {deal && (
        <section className="relative overflow-hidden bg-[#12151C] text-white">
          <div className="absolute inset-0 grid-scrim opacity-40" />
          <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-[#DE5718]/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
            <Reveal dir="left">
              <div className="relative overflow-hidden shine" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,32px 100%,0 calc(100% - 32px))" }}>
                <SafeImg src={deal.image} alt={deal.name} label={deal.sku} className="w-full h-[360px] object-cover" wrapClass="w-full h-[360px]" />
                <span className="absolute top-4 left-4 bg-gradient-to-r from-[#EE6724] to-[#DE5718] text-white text-sm font-black px-3 py-1.5 shadow-copper">Save ${(deal.oldPrice - deal.price).toFixed(0)}</span>
              </div>
            </Reveal>
            <Reveal dir="right">
              <p className="text-[12px] font-black tracking-[0.22em] text-[#F57429] uppercase flex items-center gap-2"><Flame size={16} /> Deal of the week</p>
              <h2 className="font-display font-bold text-[32px] sm:text-[42px] leading-[1.05] mt-3">{deal.name}</h2>
              <p className="text-white/60 text-[15px] mt-3 max-w-md leading-relaxed">{deal.desc}</p>
              <div className="mt-5 flex items-end gap-4">
                <span className="font-display font-bold text-[44px] text-white">${deal.price.toFixed(2)}</span>
                <span className="line-through text-white/40 text-lg mb-2">${deal.oldPrice.toFixed(2)}</span>
              </div>
              <div className="mt-6"><Countdown end={dealEnd} /></div>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => add(deal.sku)} className="bg-gradient-to-r from-[#EE6724] to-[#DE5718] hover:from-[#DE5718] hover:to-[#B43808] text-white px-7 py-4 text-sm font-black uppercase tracking-wide transition flex items-center gap-2 shadow-primary" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))" }}>
                  Add to cart <ArrowRight size={15} />
                </button>
                <Link to={`/product/${deal.sku}`} className="border-2 border-white/25 hover:border-white/60 px-7 py-4 text-sm font-bold transition">View details</Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Trusted brands wall */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHead kicker="Brands we stock" title="The names your workshop trusts" sub="Genuine and OE match parts from the brands built for Australian heavy transport." center />
        <BrandWall />
        <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-3 justify-center">
          <span className="text-[11px] font-black tracking-[0.2em] text-[#9CA3AF] uppercase">Stockists include</span>
          {["Narva", "Donaldson", "KYB", "Koyo", "Wabco", "Bendix", "Century", "Exedy"].map((b) => (
            <Link key={b} to="/brands" className="font-display font-bold tracking-wide text-[#12151C]/70 hover:text-[#DE5718] transition text-[15px]">{b}</Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F7F8FA] border-y border-[#E5E7EB] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead kicker="Customer reviews" title="What the trade says" sub="Trusted by fleets, workshops and owner operators across Australia." center />
          <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={staggerChild} className="bg-white border border-[#E5E7EB] p-7 shadow-sm hover:shadow-card-hover transition relative">
                <Quote size={40} className="text-[#FFEDE5] absolute top-5 right-5" />
                <div className="flex gap-0.5">{[...Array(t.rating)].map((_, i) => <Star key={i} size={15} className="fill-[#FFBB00] text-[#FFBB00]" />)}</div>
                <p className="mt-4 text-[15px] text-[#12151C] leading-relaxed relative">{t.quote}</p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[#F3F4F6]">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-[#12151C] text-white font-bold text-sm">{t.name.charAt(0)}</span>
                  <div>
                    <p className="font-bold text-[14px] text-[#12151C]">{t.name}</p>
                    <p className="text-[12px] text-[#9CA3AF]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead kicker="Resources" title="Guides that save downtime" sub="Short reads from the workshop. The full library lives on Resources." link="/resources" linkLabel="All guides" />
          <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-3 gap-5">
            {[...GUIDES, ...NEWS].slice(0, 3).map((g) => (
              <motion.div key={g.title} variants={staggerChild}>
                <Link to="/resources" className="group block overflow-hidden bg-white border border-[#E5E7EB] hover:border-[#DE5718]/40 hover:shadow-card-hover transition h-full">
                  <div className="h-48 overflow-hidden relative shine">
                    <SafeImg src={g.img} alt={g.title} label={g.tag} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" wrapClass="w-full h-full" />
                    <span className="absolute top-3 left-3 text-[11px] font-bold bg-white/95 px-3 py-1.5 text-[#12151C]">{g.tag}</span>
                  </div>
                  <div className="p-5">
                    <p className="font-display font-semibold text-[16px] text-[#12151C] group-hover:text-[#DE5718] transition leading-snug">{g.title}</p>
                    <p className="text-[13px] text-[#6B7280] mt-1.5">{g.desc || "Read the full workshop guide and fitment tips."}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#DE5718]">Read more <ChevronRight size={14} className="group-hover:translate-x-1 transition" /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
