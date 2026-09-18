import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowRight, ShieldCheck, Truck, Flame } from "lucide-react";
import { PRODUCTS, HERO } from "../../data/catalog.js";

const WORDS = ["QUALITY", "EXPERTISE", "SPEED", "TRUST"];
const EASE = [0.16, 1, 0.3, 1];

export default function HeroFeature() {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(true);
  const { scrollY } = useScroll();
  const yImg = useTransform(scrollY, [0, 600], [0, 70]);
  const bestSellers = useMemo(() => [...PRODUCTS].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 6), []);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="bg-gradient-to-b from-[#141724] via-[#11131F] to-[#0D0F18]">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex gap-5 items-stretch">
          {/* Most-selling drawer (collapsible) */}
          <div className="hidden lg:block shrink-0">
            <motion.aside
              animate={{ width: open ? 288 : 52 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="h-full bg-white overflow-hidden flex flex-col rounded-2xl border border-white/20 shadow-xl"
            >
              {open ? (
                <>
                  <button onClick={() => setOpen(false)} className="bg-[#134E8D] hover:bg-[#0C345F] text-white px-4 py-3 flex items-center gap-2 transition border-b border-white/15 shadow-sm">
                    <Flame size={17} className="text-[#FFBB00]" />
                    <span className="font-display font-bold text-[15px] flex-1 text-left">Most selling</span>
                    <ChevronLeft size={17} />
                  </button>
                  <div className="flex-1 overflow-auto no-scrollbar">
                    {bestSellers.map((p, idx) => (
                      <Link key={p.sku} to={`/product/${p.sku}`} className="group flex items-center gap-3 px-4 py-[10px] border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition">
                        <span className="grid place-items-center w-6 h-6 rounded-lg bg-[#134E8D] text-white text-[11px] font-mono font-bold shrink-0 shadow-sm">{idx + 1}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold text-[#0F172A] group-hover:text-[#134E8D] transition truncate">{p.name}</span>
                          <span className="block text-[11px] font-mono text-[#64748B]">{p.sku} · {p.reviews} reviews</span>
                        </span>
                        <span className="text-[13px] font-black text-[#134E8D] shrink-0">{p.price == null ? "Enquire" : `$${p.price.toFixed(2)}`}</span>
                      </Link>
                    ))}
                    <Link to="/shop" className="flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] font-bold text-[#134E8D] hover:gap-2.5 transition-all">
                      Shop all parts <ArrowRight size={14} />
                    </Link>
                  </div>
                </>
              ) : (
                <button onClick={() => setOpen(true)} className="h-full w-full bg-[#134E8D] hover:bg-[#0C345F] text-white flex flex-col items-center justify-between py-4 shadow-lg transition">
                  <div className="flex flex-col items-center gap-3">
                    <ChevronRight size={16} />
                    <span className="font-display font-bold text-[13px] tracking-wide uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Most selling</span>
                  </div>
                  <Flame size={18} className="text-[#FFBB00]" />
                </button>
              )}
            </motion.aside>
          </div>

          {/* Animated word hero over background video */}
          <div className="relative overflow-hidden min-h-[460px] lg:min-h-[540px] flex-1 flex rounded-2xl border border-white/15 shadow-2xl">
            {/* Background video */}
            <motion.div style={{ y: yImg }} className="absolute inset-0 -top-16 -bottom-16">
              <video
                src="/hero-video.mp4"
                autoPlay={!reduced}
                muted
                loop
                playsInline
                preload="auto"
                poster={HERO.primary}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#141724]/90 via-[#141724]/65 to-transparent" />
            <div className="absolute inset-0 grid-scrim opacity-35" />
            <div className="absolute -right-16 top-1/3 w-[420px] h-[420px] rounded-full bg-[#134E8D]/25 blur-[120px]" />

            <div className="relative z-10 p-8 sm:p-14 flex flex-col justify-center max-w-2xl">

              <div className="mt-1 flex items-end gap-3 flex-wrap">
                <span className="font-display font-black text-white text-[38px] sm:text-[58px] lg:text-[68px] leading-[0.92] tracking-[-0.03em] drop-shadow-md">DRIVEN BY</span>
              </div>
              <div className="h-[52px] sm:h-[72px] lg:h-[84px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={WORDS[i]}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-110%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="block font-display font-black text-[40px] sm:text-[62px] lg:text-[74px] leading-none tracking-[-0.03em] text-[#9AC1EE] drop-shadow-[0_4px_16px_rgba(154,193,238,0.35)]"
                  >
                    {WORDS[i]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-white/80 text-[15px] sm:text-[16px] mt-4 max-w-lg leading-relaxed">
                Direct-fit truck & trailer hardware with OEM cross-referencing, ADR compliance, and fast Australia-wide freight from Melbourne.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="mt-7 flex flex-wrap items-center gap-3.5">
                <Link to="/shop" className="bg-[#134E8D] hover:bg-[#0C345F] text-white px-7 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2.5 shadow-md border border-[#0C345F] rounded-xl hover:gap-3.5 transition-all duration-300 active:scale-95 group">
                  <span>Shop All Parts</span> <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="border border-white/30 hover:border-white/80 bg-white/5 hover:bg-white/15 text-white px-6 py-4 text-sm font-bold transition-all duration-300 flex items-center gap-2 rounded-xl backdrop-blur-md shadow-sm">
                  Trade Quote Desk
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-semibold text-white/85">
                <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-[#9AC1EE]" /> ADR Certified</span>
                <span className="flex items-center gap-1.5"><Truck size={16} className="text-[#9AC1EE]" /> Same-Day Melbourne Dispatch</span>
                <span className="flex items-center gap-1.5">✓ 30-Day Fleet Accounts</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
