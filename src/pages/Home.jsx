import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Zap, BadgeCheck, Truck, RotateCcw, Headphones,
  Quote, ChevronRight, Star, Flame,
} from "lucide-react";
import {
  BRANDS, PANELS, HERO, GUIDES, NEWS, TESTIMONIALS,
} from "../data/catalog.js";
import {
  SectionHead, ProductCard, AnimatedCounter, Reveal, ScrollRow, Countdown, SafeImg,
  staggerParent, staggerChild, EASE,
} from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useProducts } from "../store/products.jsx";
import { useSite } from "../store/site.jsx";
import YMMWidget from "../components/garage/YMMWidget.jsx";
import TrustBadges from "../components/trust/TrustBadges.jsx";
import Testimonials from "../components/trust/Testimonials.jsx";
import BrandShowcase from "../components/trust/BrandShowcase.jsx";

export default function Home() {
  const { add } = useShop();
  const { products: PRODUCTS } = useProducts();
  const { liveCategories: CATEGORIES } = useSite();
  const findP = (sku) => PRODUCTS.find((p) => p.sku === sku);
  const [heroIdx, setHeroIdx] = useState(0);
  const [tab, setTab] = useState("Most Reordered");

  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 700], [0, 90]);
  const yChip = useTransform(scrollY, [0, 700], [0, -40]);

  useEffect(() => {
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % PANELS.length), 4200);
    return () => clearInterval(id);
  }, []);

  const dealEnd = useMemo(() => Date.now() + 4 * 86400000 + 9 * 3600000, []);
  const deal = findP("EW3000R");

  const tabs = ["Most Reordered", "Braking", "Lighting", "Towing and Winches"];
  const tabProducts = useMemo(() => {
    if (tab === "Most Reordered") return PRODUCTS.slice(0, 10);
    return PRODUCTS.filter((p) => p.cat === tab).slice(0, 10);
  }, [tab, PRODUCTS]);

  const heroPanel = PANELS[heroIdx];
  const heroProduct = findP(heroPanel.sku);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[#1A1A2E] text-white">
        <motion.div style={{ y: yBg }} className="absolute inset-0 -top-24 -bottom-24">
          <img src={HERO.primary} alt="" className="w-full h-full object-cover opacity-25" />
        </motion.div>
        <div className="absolute inset-0 grid-scrim opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E]/85 to-[#1A1A2E]/40" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[#E53E00]/20 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 lg:pt-20 pb-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full pl-2 pr-4 py-1.5 text-[12px] font-bold backdrop-blur"
            >
              <span className="bg-[#E53E00] text-white rounded-full px-3 py-1 text-[11px] font-black">NEW</span>
              <span className="text-white/80">VIN matched catalogue for Aussie fleets</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.7, ease: EASE }}
              className="font-display font-bold tracking-[-0.03em] leading-[0.95] text-[44px] sm:text-[62px] lg:text-[72px] mt-6"
            >
              Australia's Specialists in <span className="text-gradient">Truck Parts</span> and Accessories
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28, duration: 0.6 }}
              className="mt-5 max-w-md text-white/65 text-[16px] leading-relaxed"
            >
              Heavy truck and trailer parts with OEM cross references, ADR compliance and VIC stock. Search once, quote once, fit once.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.6, ease: EASE }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/shop"
                className="bg-[#E53E00] hover:bg-[#C23400] transition rounded-lg px-7 py-4 text-sm font-bold flex items-center gap-2 shadow-primary hover:gap-3"
              >
                Browse Products <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="border border-white/25 hover:border-white/60 hover:bg-white/5 rounded-lg px-7 py-4 text-sm font-bold flex items-center gap-2 transition"
              >
                Make an Enquiry
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-9 flex flex-wrap gap-x-8 gap-y-3"
            >
              {[
                [60, "K+", "Product lines"],
                [20, "+", "Years experience"],
                [4, "hr", "Quote reply"],
              ].map(([n, s, l]) => (
                <div key={l} className="flex items-baseline gap-2">
                  <AnimatedCounter target={n} suffix={s} className="!text-white !text-[28px]" />
                  <span className="text-[13px] text-white/55 font-medium">{l}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Rotating featured-line showcase */}
          <motion.div
            style={{ y: yChip }}
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
            className="hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur shadow-elevated">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIdx}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="relative h-[300px]"
                >
                  <img src={heroPanel.img} alt={heroPanel.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/30 to-transparent" />
                </motion.div>
              </AnimatePresence>
              <div className="p-6">
                <p className="text-[11px] font-black tracking-[0.2em] text-[#FF6B35]">{heroPanel.kicker}</p>
                <p className="font-display font-bold text-xl mt-1.5">{heroPanel.title}</p>
                <div className="mt-4 flex items-center justify-between">
                  {heroProduct && (
                    <p className="text-sm text-white/70">
                      From <span className="font-display font-bold text-white text-lg">${heroProduct.price.toFixed(2)}</span>
                    </p>
                  )}
                  <Link to={heroPanel.link} className="flex items-center gap-1.5 bg-white text-[#1A1A2E] rounded-lg px-4 py-2 text-[13px] font-bold hover:gap-2.5 transition-all">
                    View range <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="mt-4 flex gap-1.5">
                  {PANELS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${i === heroIdx ? "w-7 bg-[#E53E00]" : "w-3 bg-white/30"}`}
                      aria-label={`slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Category quick row ===== */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-40px" }}
          className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          {CATEGORIES.slice(0, 6).map((c) => (
            <motion.div key={c.name} variants={staggerChild}>
              <Link
                to={`/shop?cat=${encodeURIComponent(c.name)}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-[#E5E7EB] p-4 hover:border-[#E53E00] hover:-translate-y-1 hover:shadow-card-hover transition-all text-center"
              >
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#F5F6F8] text-[#E53E00] group-hover:bg-[#E53E00] group-hover:text-white transition">
                  <c.icon size={22} />
                </span>
                <span className="text-[12px] font-bold text-[#1A1A2E] leading-tight">{c.name}</span>
                <span className="text-[10px] text-[#9CA3AF]">{c.count} lines</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Trust strip ===== */}
      <section className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-40px" }}
          className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            [Truck, "Quick Dispatch", "Shipped Australia wide in 1 to 2 business days"],
            [Headphones, "Expert Support", "Over 20 years of heavy vehicle knowledge"],
            [ShieldCheck, "ADR Compliant", "Tested to Australian Design Rules"],
            [RotateCcw, "Simple Returns", "Hassle free change of mind returns"],
          ].map(([Icon, title, desc]) => (
            <motion.div key={title} variants={staggerChild} className="flex items-start gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-white border border-[#E5E7EB] text-[#E53E00] shrink-0 shadow-sm">
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

      {/* ===== Featured 3-panel highlights ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 space-y-14">
        {PANELS.map((item, i) => {
          const prod = findP(item.sku);
          const reverse = i % 2 === 1;
          return (
            <div key={item.kicker} className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? "lg:grid-flow-dense" : ""}`}>
              <Reveal dir={reverse ? "right" : "left"} className={reverse ? "lg:col-start-2" : ""}>
                <p className="text-[12px] font-black tracking-[0.2em] text-[#E53E00] flex items-center gap-2">
                  <span className="w-6 h-[2px] bg-[#E53E00]" />{item.kicker}
                </p>
                <h3 className="font-display font-bold text-[30px] sm:text-[40px] leading-[1.05] text-[#1A1A2E] mt-3">{item.title}</h3>
                <p className="text-[#6B7280] text-[15px] mt-3 leading-relaxed max-w-lg">{item.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2.5 text-[14px] text-[#1A1A2E] font-medium">
                      <BadgeCheck size={18} className="text-[#10B981] shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-4">
                  <Link to={item.link} className="inline-flex items-center gap-2 bg-[#E53E00] text-white rounded-lg px-6 py-3.5 text-sm font-bold hover:bg-[#C23400] hover:gap-3 transition-all">
                    View Now <ArrowRight size={15} />
                  </Link>
                  {prod && <span className="text-sm text-[#6B7280]">from <b className="font-display text-[#1A1A2E] text-lg">${prod.price.toFixed(2)}</b></span>}
                </div>
              </Reveal>

              <Reveal dir={reverse ? "left" : "right"} className={reverse ? "lg:col-start-1 lg:row-start-1" : ""}>
                <div className="relative rounded-3xl overflow-hidden border border-[#E5E7EB] shine group">
                  <SafeImg src={item.img} alt={item.title} label={item.kicker} className="w-full h-[340px] object-cover group-hover:scale-105 transition-transform duration-700" wrapClass="w-full h-[340px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg px-4 py-2 text-[12px] font-bold text-[#1A1A2E]">
                    Australian owned · Fleet trusted
                  </span>
                </div>
              </Reveal>
            </div>
          );
        })}
      </section>

      {/* ===== Vehicle finder ===== */}
      <section className="relative overflow-hidden bg-[#1A1A2E]">
        <div className="absolute inset-0 grid-scrim opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-12">
          <Reveal className="text-center mb-6">
            <p className="text-[12px] font-black tracking-[0.22em] text-[#FF6B35] uppercase">Find the right part faster</p>
            <h2 className="font-display font-bold text-[26px] sm:text-[34px] text-white mt-2">Tell us your truck</h2>
          </Reveal>
          <Reveal className="max-w-3xl mx-auto">
            <YMMWidget variant="hero" />
          </Reveal>
        </div>
      </section>

      {/* ===== Browse categories (image cards) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHead kicker="Products" title="Browse product categories" sub="Six core systems cover most jobs. The full twelve live on Categories." link="/categories" linkLabel="Browse all" />
        <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.slice(0, 6).map((c) => (
            <motion.div key={c.name} variants={staggerChild}>
              <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group relative block rounded-2xl overflow-hidden border border-[#E5E7EB] h-56 shine">
                <SafeImg src={c.image} alt={c.name} label={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" wrapClass="absolute inset-0 w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/95 via-[#1A1A2E]/40 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#E53E00] text-white mb-3 group-hover:scale-110 transition"><c.icon size={20} /></span>
                  <p className="font-display font-bold text-xl">{c.name}</p>
                  <p className="text-white/70 text-[13px] mt-0.5">{c.count} lines · {c.blurb}</p>
                  <span className="mt-3 text-[13px] font-bold text-[#FF6B35] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                    Shop now <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Featured products with tabs + drag carousel ===== */}
      <section className="bg-[#F7F8FA] py-16 border-y border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
            <div>
              <p className="text-[12px] font-black tracking-[0.22em] text-[#E53E00] uppercase mb-2 flex items-center gap-2"><span className="w-6 h-[2px] bg-[#E53E00]" />Featured products</p>
              <h2 className="font-display font-bold text-[28px] sm:text-[38px] text-[#1A1A2E] leading-[1.05]">Most reordered lines</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 rounded-full text-[13px] font-bold border transition ${
                    tab === t ? "bg-[#E53E00] text-white border-[#E53E00]" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#E53E00] hover:text-[#E53E00]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ScrollRow>
            {tabProducts.map((p, i) => (
              <div key={p.sku} className="min-w-[270px] max-w-[270px] snap-start">
                <ProductCard p={p} index={i} />
              </div>
            ))}
          </ScrollRow>
        </div>
      </section>

      {/* ===== Deal of the week ===== */}
      {deal && (
        <section className="relative overflow-hidden bg-[#1A1A2E] text-white">
          <div className="absolute inset-0 grid-scrim opacity-40" />
          <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-[#E53E00]/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
            <Reveal dir="left">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shine">
                <SafeImg src={deal.image} alt={deal.name} label={deal.sku} className="w-full h-[360px] object-cover" wrapClass="w-full h-[360px]" />
                <span className="absolute top-4 left-4 bg-[#E53E00] text-white text-sm font-black px-3 py-1.5 rounded-lg shadow-primary">
                  Save ${(deal.oldPrice - deal.price).toFixed(0)}
                </span>
              </div>
            </Reveal>
            <Reveal dir="right">
              <p className="text-[12px] font-black tracking-[0.22em] text-[#FF6B35] uppercase flex items-center gap-2">
                <Flame size={16} /> Deal of the week
              </p>
              <h2 className="font-display font-bold text-[32px] sm:text-[42px] leading-[1.05] mt-3">{deal.name}</h2>
              <p className="text-white/60 text-[15px] mt-3 max-w-md leading-relaxed">{deal.desc}</p>
              <div className="mt-5 flex items-end gap-4">
                <span className="font-display font-bold text-[44px] text-white">${deal.price.toFixed(2)}</span>
                <span className="line-through text-white/40 text-lg mb-2">${deal.oldPrice.toFixed(2)}</span>
              </div>
              <div className="mt-6"><Countdown end={dealEnd} /></div>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => add(deal.sku)} className="bg-[#E53E00] text-white rounded-lg px-7 py-4 text-sm font-bold hover:bg-[#C23400] transition flex items-center gap-2 shadow-primary">
                  Add to cart <ArrowRight size={15} />
                </button>
                <Link to={`/product/${deal.sku}`} className="border border-white/25 hover:border-white/60 rounded-lg px-7 py-4 text-sm font-bold transition">
                  View details
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ===== Fleet deals + trusted makes ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-2 gap-5 items-stretch">
        <Reveal dir="left" className="h-full">
          <div className="relative rounded-3xl overflow-hidden p-9 sm:p-11 flex flex-col justify-center min-h-[300px] h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E53E00] via-[#C23400] to-[#7a1500]" />
            <div className="absolute inset-0 grid-scrim opacity-30" />
            <div className="relative text-white">
              <p className="text-[12px] font-black tracking-[0.25em] text-white/70">FLEET DEALS</p>
              <p className="font-display font-bold text-[32px] sm:text-[42px] mt-2 leading-[1.05]">One quote.<br />Whole truck sorted.</p>
              <p className="text-white/80 text-[14px] mt-3 max-w-sm">Brakes, filters, lamps and fasteners in one cart. Fitment checked before dispatch.</p>
              <Link to="/deals" className="mt-6 bg-white text-[#1A1A2E] rounded-lg px-7 py-3.5 text-sm font-bold w-fit flex items-center gap-2 hover:gap-3 transition-all">
                See live deals <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal dir="right" className="h-full">
          <div className="rounded-3xl bg-[#1A1A2E] p-9 sm:p-11 h-full">
            <p className="text-[12px] font-black tracking-[0.25em] text-[#FF6B35]">TRUSTED MAKES</p>
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {BRANDS.slice(0, 9).map((b) => (
                <Link key={b} to="/brands" className="bg-white/8 border border-white/12 hover:border-[#E53E00] hover:bg-[#E53E00]/15 rounded-xl py-4 text-center text-[11px] font-bold tracking-wider text-white/80 transition">
                  {b}
                </Link>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-[13px]">
              {[[ShieldCheck, "ADR range"], [Zap, "Fast dispatch"], [BadgeCheck, "OEM cross"]].map(([Icon, t]) => (
                <span key={t} className="flex items-center gap-2 text-white/60 font-semibold">
                  <Icon size={16} className="text-[#FF6B35]" />{t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Brand marquee ===== */}
      <section className="border-y border-[#E5E7EB] bg-white overflow-hidden py-5">
        <div className="mask-fade-x">
          <div className="flex whitespace-nowrap animate-marquee marquee-track gap-12 w-max items-center">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className="font-display font-semibold tracking-[0.2em] text-[#C7CBD1] text-[15px] flex items-center gap-12 hover:text-[#E53E00] transition">
                {b}<span className="w-1.5 h-1.5 rounded-full bg-[#E53E00]" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHead kicker="Customer reviews" title="What the trade says" sub="Trusted by fleets, workshops and owner operators across Australia." center />
        <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={staggerChild} className="rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-sm hover:shadow-card-hover transition relative">
              <Quote size={40} className="text-[#FFE7DE] absolute top-5 right-5" />
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={15} className="fill-[#FFBB00] text-[#FFBB00]" />)}
              </div>
              <p className="mt-4 text-[15px] text-[#1A1A2E] leading-relaxed relative">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[#F3F4F6]">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-[#1A1A2E] text-white font-bold text-sm">{t.name.charAt(0)}</span>
                <div>
                  <p className="font-bold text-[14px] text-[#1A1A2E]">{t.name}</p>
                  <p className="text-[12px] text-[#9CA3AF]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Latest news / guides ===== */}
      <section className="bg-[#F7F8FA] border-t border-[#E5E7EB] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead kicker="Resources" title="Guides that save downtime" sub="Short reads from the workshop. The full library lives on Resources." link="/resources" linkLabel="All guides" />
          <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-3 gap-5">
            {[...GUIDES, ...NEWS].slice(0, 3).map((g) => (
              <motion.div key={g.title} variants={staggerChild}>
                <Link to="/resources" className="group block rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] hover:border-[#E53E00]/40 hover:shadow-card-hover transition h-full">
                  <div className="h-48 overflow-hidden relative shine">
                    <SafeImg src={g.img} alt={g.title} label={g.tag} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" wrapClass="w-full h-full" />
                    <span className="absolute top-3 left-3 text-[11px] font-bold bg-white/95 rounded-lg px-3 py-1.5 text-[#1A1A2E]">{g.tag}</span>
                  </div>
                  <div className="p-5">
                    <p className="font-display font-semibold text-[16px] text-[#1A1A2E] group-hover:text-[#E53E00] transition leading-snug">{g.title}</p>
                    <p className="text-[13px] text-[#6B7280] mt-1.5">{g.desc || "Read the full workshop guide and fitment tips."}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#E53E00]">Read more <ChevronRight size={14} className="group-hover:translate-x-1 transition" /></span>
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
