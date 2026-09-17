import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowRight, ShieldCheck, Truck, Flame } from "lucide-react";
import { PRODUCTS, HERO } from "../../data/catalog.js";

const WORDS = ["QUALITY", "EXPERTISE", "SPEED", "TRUST"];
const IMAGES = [HERO.primary, HERO.secondary, HERO.dark];
const EASE = [0.16, 1, 0.3, 1];

export default function HeroFeature() {
  const [i, setI] = useState(0);
  const [img, setImg] = useState(0);
  const [open, setOpen] = useState(true);
  const { scrollY } = useScroll();
  const yImg = useTransform(scrollY, [0, 600], [0, 70]);
  const bestSellers = useMemo(() => [...PRODUCTS].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 6), []);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    const ti = setInterval(() => setImg((n) => (n + 1) % IMAGES.length), 5000);
    return () => { clearInterval(t); clearInterval(ti); };
  }, []);

  return (
    <section className="bg-[#1A1A2E]">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex gap-5 items-stretch">
          {/* Most-selling drawer (collapsible) */}
          <div className="hidden lg:block shrink-0">
            <motion.aside
              animate={{ width: open ? 288 : 52 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="h-full bg-white overflow-hidden flex flex-col"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
            >
              {open ? (
                <>
                  <button onClick={() => setOpen(false)} className="bg-[#0B2F5C] text-white px-4 py-3 flex items-center gap-2 transition">
                    <Flame size={17} />
                    <span className="font-display font-bold text-[15px] flex-1 text-left">Most selling</span>
                    <ChevronLeft size={17} />
                  </button>
                  <div className="flex-1 overflow-auto no-scrollbar">
                    {bestSellers.map((p, idx) => (
                      <Link key={p.sku} to={`/product/${p.sku}`} className="group flex items-center gap-3 px-4 py-[10px] border-b border-[#F1F2F4] hover:bg-[#E8EEF5] transition">
                        <span className="grid place-items-center w-6 h-6 rounded-full bg-[#0B2F5C] text-white text-[11px] font-black shrink-0">{idx + 1}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold text-[#1A1A2E] group-hover:text-[#0B2F5C] transition truncate">{p.name}</span>
                          <span className="block text-[11px] text-[#9CA3AF]">{p.sku} · {p.reviews} reviews</span>
                        </span>
                        <span className="text-[13px] font-black text-[#0B2F5C] shrink-0">{p.price == null ? "Enquire" : `$${p.price.toFixed(2)}`}</span>
                      </Link>
                    ))}
                    <Link to="/shop" className="flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] font-bold text-[#0B2F5C] hover:gap-2.5 transition-all">
                      Shop all parts <ArrowRight size={14} />
                    </Link>
                  </div>
                </>
              ) : (
                <button onClick={() => setOpen(true)} className="h-full w-full bg-[#0B2F5C] text-white flex flex-col items-center justify-between py-4">
                  <div className="flex flex-col items-center gap-3">
                    <ChevronRight size={16} />
                    <span className="font-display font-bold text-[13px] tracking-wide uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Most selling</span>
                  </div>
                  <Flame size={18} />
                </button>
              )}
            </motion.aside>
          </div>

          {/* Animated word hero */}
          <div className="relative overflow-hidden min-h-[460px] lg:min-h-[540px] flex-1 flex">
            <motion.div style={{ y: yImg }} className="absolute inset-0 -top-16 -bottom-16">
              <AnimatePresence>
                <motion.img
                  key={img}
                  src={IMAGES[img]}
                  alt=""
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E]/90 via-[#1A1A2E]/65 to-[#0B2F5C]/20" />
            <div className="absolute inset-0 grid-scrim opacity-35" />
            <div className="absolute -right-16 top-1/3 w-[420px] h-[420px] rounded-full bg-[#0B2F5C]/20 blur-[120px]" />

            <div className="relative z-10 p-8 sm:p-12 flex flex-col justify-center max-w-2xl">
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-[12px] sm:text-[13px] font-black tracking-[0.3em] text-[#9DB9DD] uppercase">
                Australian truck and trailer specialists
              </motion.p>

              <div className="mt-2 flex items-end gap-3 flex-wrap">
                <span className="font-display font-black text-white text-[42px] sm:text-[64px] lg:text-[74px] leading-[0.9] tracking-[-0.03em]">DRIVEN BY</span>
              </div>
              <div className="h-[58px] sm:h-[82px] lg:h-[94px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={WORDS[i]}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-110%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="block font-display font-black text-[46px] sm:text-[70px] lg:text-[82px] leading-none tracking-[-0.03em] text-gradient"
                  >
                    {WORDS[i]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-white/65 text-[15px] mt-4 max-w-md leading-relaxed">
                Heavy truck and trailer spares with OEM cross references, ADR compliance and VIC stock. Search once, quote once, fit once.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/shop" className="bg-[#0B2F5C] hover:bg-white hover:text-[#0B2F5C] text-white px-7 py-4 text-sm font-black uppercase tracking-wide flex items-center gap-2 shadow-primary hover:gap-3 transition-all" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
                  Shop parts <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="border-2 border-white/25 hover:border-white/70 text-white px-7 py-4 text-sm font-bold transition">Talk to the parts desk</Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-semibold text-white/85">
                <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#8FB4E0]" /> ADR compliant range</span>
                <span className="flex items-center gap-1.5"><Truck size={15} className="text-[#8FB4E0]" /> Same day dispatch from VIC</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
