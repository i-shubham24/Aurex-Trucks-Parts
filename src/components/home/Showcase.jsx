import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight, BadgeCheck } from "lucide-react";
import { SafeImg, staggerParent, staggerChild } from "../ui.jsx";
import { PANELS } from "../../data/catalog.js";
import { useProducts } from "../../store/products.jsx";

/* ---------------- Bento: shop the range ---------------- */

function BentoCell({ to, img, label, sub, count, tall = false }) {
  return (
    <motion.div variants={staggerChild} className={tall ? "sm:row-span-2" : ""}>
      <Link
        to={to}
        className={`group relative block overflow-hidden bg-[#1A1A2E] clip-cut-lg ${tall ? "h-72 sm:h-full sm:min-h-[540px]" : "h-60 sm:h-64"}`}
      >
        <SafeImg
          src={img}
          alt={label}
          label={label}
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-108 group-hover:opacity-100 transition-all duration-700"
          wrapClass="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1526]/95 via-[#0d1526]/25 to-transparent" />
        <span className="clip-cut-lg absolute inset-0 border-[3px] border-[#0B2F5C] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-[#9DB9DD] uppercase">{sub}</p>
            <p className="font-display font-bold text-white text-[22px] sm:text-[26px] leading-tight mt-1">{label}</p>
            <p className="text-[12px] font-semibold text-white/75 mt-0.5">{count}</p>
          </div>
          <span className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-white text-[#0B2F5C] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function RangeBento() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[12px] font-black tracking-[0.22em] text-[#0B2F5C] uppercase">Shop the range</p>
          <h2 className="font-display font-bold text-[28px] sm:text-[38px] text-[#1A1A2E] leading-[1.05] mt-1">Pick a bay, find your part.</h2>
        </div>
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0B2F5C] hover:gap-3 transition-all">Browse all 36 lines <ArrowRight size={15} /></Link>
      </div>
      <motion.div variants={staggerParent} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-60px" }} className="grid sm:grid-cols-3 gap-4">
        <BentoCell tall to="/shop?cat=Tail%20Lifts" img="/images/TAIL-LIFTS-CAT.jpg" label="Tail Lifts" sub="Hydraulic range" count="6 lines · 1.5T to 3T" />
        <BentoCell to="/shop?cat=Tool%20Boxes" img="/images/products/GL-25126.jpg" label="Tool Boxes" sub="Steel storage" count="3 lines" />
        <BentoCell to="/shop?cat=Accessories" img="/images/ACCESSORIES-CAT.jpg" label="Accessories" sub="Cargo control" count="6 lines" />
        <BentoCell to="/shop?cat=Trailer%20Parts" img="/images/TRAILER-PARTS-CAT.jpg" label="Trailer Parts" sub="Doors + tracks" count="13 lines" />
        <BentoCell to="/shop?cat=Replacement%20Parts" img="/images/REPLACEMENT-CAT.jpg" label="Replacement Parts" sub="Handles + caps" count="7 lines" />
      </motion.div>
    </section>
  );
}

/* ---------------- Dark trust tabs (interactive) ---------------- */

const TRUST = [
  { n: "01", t: "Fitment, checked twice", d: "Left and right gear, latch and stainless variants matched to your body before anything ships. The wrong side never leaves the dock.", stat: "L/R split", statSub: "on every door gear", img: "/images/products/GL-11113.jpg", link: "/shop?cat=Trailer%20Parts" },
  { n: "02", t: "VIC stock, moving daily", d: "Ticketed lines sit in Campbellfield and freight Australia wide in 1 to 2 days. Built-to-order lifts get a straight answer, fast.", stat: "1\u20132 days", statSub: "dispatch, priced lines", img: "/images/products/GL-25126.jpg", link: "/shop?cat=Tool%20Boxes" },
  { n: "03", t: "Bulk quotes, one invoice", d: "Door-gear sets, multi-trailer refreshes and blanket orders quoted in a single pass. One invoice, one freight run, zero paperwork sprawl.", stat: "1 order", statSub: "the whole job, one invoice", img: "/images/products/GL-19113H1.jpg", link: "/quote" },
  { n: "04", t: "A desk that picks up", d: "VIN matching, measuring help and bulk quotes from people who know door hardware. Replies within 4 business hours.", stat: "4hr", statSub: "quote response", img: "/images/TRAILER-PARTS-CAT.jpg", link: "/contact" },
];

export function TrustTabs() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % TRUST.length), 5200);
    return () => clearTimeout(t);
  }, [active, paused]);
  return (
    <section className="relative overflow-hidden bg-[#1A1A2E] py-20">
      <div className="absolute inset-0 grid-scrim opacity-25" />
      <div className="absolute -right-24 top-0 w-[420px] h-[420px] rounded-full bg-[#0B2F5C]/30 blur-[130px]" />
      <div className="absolute -left-24 bottom-0 w-[420px] h-[420px] rounded-full bg-[#2F5E93]/15 blur-[130px]" />
      <div
        className="relative mx-auto max-w-7xl px-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <p className="text-[12px] font-black tracking-[0.22em] text-[#9DB9DD] uppercase">( Why Aurex )</p>
        <h2 className="font-display font-bold text-white text-[30px] sm:text-[44px] leading-[1.03] mt-2 max-w-2xl">Trust you can open, not claims you must take.</h2>
        <div className="mt-10 grid lg:grid-cols-[1fr_1.1fr] gap-6 items-stretch">
          <div className="grid gap-2.5 content-start">
            {TRUST.map((x, i) => (
              <button
                key={x.n}
                onClick={() => setActive(i)}
                className={`text-left border p-5 transition-all duration-300 ${i === active ? "bg-white/[0.07] border-white/20" : "bg-transparent border-white/10 hover:border-white/30"}`}
                style={{ clipPath: "polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))" }}
              >
                <span className="flex items-center gap-4">
                  <span className={`font-display font-black text-[14px] ${i === active ? "text-white" : "text-white/40"}`}>{x.n}</span>
                  <span className={`font-display font-bold text-[19px] sm:text-[22px] ${i === active ? "text-white" : "text-white/55"}`}>{x.t}</span>
                </span>
                <span className={`grid transition-all duration-500 ${i === active ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}>
                  <span className="overflow-hidden">
                    <span className="block text-white/80 text-[14px] leading-relaxed">{x.d}</span>
                    <span className="mt-3 block h-1 rounded-full bg-white/10 overflow-hidden">
                      {!paused && i === active && (
                        <motion.span key={active} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5.2, ease: "linear" }} className="block h-full bg-[#8FB4E0]" />
                      )}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="relative overflow-hidden clip-cut-lg bg-black/30 min-h-[340px]">
            {TRUST.map((x, i) => (
              <div key={x.n} className={`absolute inset-0 transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <SafeImg src={x.img} alt={x.t} label={x.t} className="absolute inset-0 w-full h-full object-cover" wrapClass="absolute inset-0 w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1526]/95 via-[#0d1526]/25 to-transparent" />
                <div className="absolute left-5 bottom-5 right-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-display font-black text-white text-[34px] leading-none">{x.stat}</p>
                    <p className="text-white/80 text-[13px] font-semibold mt-1">{x.statSub}</p>
                  </div>
                  <Link to={x.link} className="inline-flex items-center gap-1.5 bg-white text-[#0B2F5C] px-4 py-2.5 text-[12px] font-black uppercase tracking-wide hover:gap-3 transition-all shrink-0" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px))" }}>
                    Open <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Counters band ---------------- */

function CountUp({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    const dur = 1400;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

const STATS = [
  ["36", "approved lines, zero filler"],
  ["6", "categories, one catalogue"],
  ["4hr", "quote response, business hours"],
  ["500+", "free freight threshold, AUD"],
];

export function StatsBand() {
  return (
    <section className="relative overflow-hidden bg-[#EAF2FA] border-y border-[#D7E4F2] py-12">
      <div className="relative mx-auto max-w-7xl px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map(([v, label], i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="text-center lg:text-left">
            <p className="font-display font-black text-[#0B2F5C] text-[38px] sm:text-[46px] leading-none">
              {v.endsWith("+") ? <><CountUp to={parseInt(v, 10)} suffix="+" /></> : v.match(/^\d+$/) ? <CountUp to={parseInt(v, 10)} /> : v}
            </p>
            <p className="text-[#1A1A2E]/70 text-[13px] font-semibold mt-2">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Interactive range showcase (3 panels) ---------------- */

export function RangeShowcase() {
  const { products } = useProducts();
  const findP = (sku) => products.find((p) => p.sku === sku);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % PANELS.length), 5600);
    return () => clearTimeout(t);
  }, [active, paused]);
  const item = PANELS[active];
  const prod = item.sku ? findP(item.sku) : null;
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5 items-stretch">
        <div className="relative overflow-hidden clip-cut-lg bg-[#1A1A2E] min-h-[380px]">
          {PANELS.map((p, i) => (
            <div key={p.kicker} className={`absolute inset-0 transition-all duration-700 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"}`}>
              <SafeImg src={p.img} alt={p.title} label={p.kicker} className="absolute inset-0 w-full h-full object-cover" wrapClass="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1526]/90 via-transparent to-transparent" />
              <span className="absolute top-5 left-5 bg-white/95 backdrop-blur px-4 py-2 text-[12px] font-bold text-[#1A1A2E]" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px))" }}>
                Australian owned. Fleet trusted.
              </span>
              <span className="absolute bottom-5 right-6 font-display font-black text-white/25 text-[56px] leading-none">0{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#F2F6FB] border border-[#D7E4F2] p-6 sm:p-9 flex flex-col justify-center relative overflow-hidden clip-cut-lg">
          <span className="absolute top-0 left-10 right-10 h-1 rounded-full bg-gradient-to-r from-[#0B2F5C] via-[#5B93D1] to-[#B9D6F2]" />
          <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-2.5">
            {PANELS.map((p, i) => (
              <button
                key={p.kicker}
                onClick={() => setActive(i)}
                className={`flex-1 border p-3.5 text-left transition-all duration-300 ${i === active ? "bg-[#1A1A2E] text-white border-[#1A1A2E] shadow-elevated" : "bg-white text-[#1A1A2E] border-[#E5E7EB] hover:border-[#0B2F5C]/50"}`}
                style={{ clipPath: "polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px))" }}
              >
                <span className={`block text-[10px] font-black tracking-[0.18em] uppercase ${i === active ? "text-[#9DB9DD]" : "text-[#0B2F5C]"}`}>0{i + 1}</span>
                <span className="block font-display font-bold text-[14px] mt-1 leading-snug">{p.kicker}</span>
                {!paused && i === active && (
                  <motion.span key={active} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 5.6, ease: "linear" }} className="mt-2.5 block h-1 rounded-full bg-[#5B93D1] origin-left" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 min-h-[220px]">
            <p className="text-[12px] font-black tracking-[0.2em] text-[#0B2F5C]">{item.kicker}</p>
            <h3 className="font-display font-bold text-[28px] sm:text-[36px] leading-[1.05] text-[#1A1A2E] mt-2">{item.title}</h3>
            <p className="text-[#4B5563] text-[15px] mt-3 leading-relaxed max-w-lg">{item.desc}</p>
            <ul className="mt-4 space-y-2">
              {item.points.map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-[14px] text-[#1A1A2E] font-medium">
                  <BadgeCheck size={17} className="text-[#10B981] shrink-0" />{pt}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-4">
              <Link to={item.link} className="inline-flex items-center gap-2 bg-[#0B2F5C] text-white px-6 py-3.5 text-sm font-black uppercase tracking-wide hover:bg-[#1A1A2E] hover:gap-3 transition-all" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px))" }}>
                View range <ArrowRight size={15} />
              </Link>
              {prod && prod.price != null && <span className="text-sm text-[#6B7280]">from <b className="font-display text-[#1A1A2E] text-lg">${prod.price.toFixed(2)}</b></span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Re-export a single shelf for Home */
export function HomeSections() {
  return null;
}
