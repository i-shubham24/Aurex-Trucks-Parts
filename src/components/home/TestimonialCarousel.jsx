import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { SafeImg } from "../ui.jsx";
import { useProducts } from "../../store/products.jsx";

const EASE = [0.16, 1, 0.3, 1];
const DWELL = 6500;

export default function TestimonialCarousel({ items }) {
  const { products } = useProducts();
  const findP = (sku) => products.find((p) => p.sku === sku);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const n = items.length;

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => { setDir(1); setIdx((i) => (i + 1) % n); }, DWELL);
    return () => clearTimeout(t);
  }, [idx, paused, n]);

  const go = (d) => { setDir(d); setIdx((i) => (i + d + n) % n); };
  const t = items[idx];
  const bought = t.sku ? findP(t.sku) : null;

  return (
    <section className="relative overflow-hidden bg-[#1A1A2E] py-20">
      <div className="absolute inset-0 grid-scrim opacity-25" />
      <div className="absolute -left-24 top-0 w-[380px] h-[380px] rounded-full bg-[#0B2F5C]/25 blur-[130px]" />
      <div className="absolute -right-24 bottom-0 w-[380px] h-[380px] rounded-full bg-[#2F5E93]/15 blur-[130px]" />
      <div
        className="relative mx-auto max-w-5xl px-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="max-w-2xl">
          <p className="text-[12px] font-black tracking-[0.22em] text-[#9DB9DD] uppercase">Customer reviews</p>
          <h2 className="font-display font-bold text-white text-[30px] sm:text-[42px] leading-[1.03] mt-2">Word from the workshop floor.</h2>
        </div>

        <div className="relative mt-8 min-h-[340px] sm:min-h-[300px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={t.name}
              custom={dir}
              initial={{ opacity: 0, x: 56 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -56 * dir }}
              transition={{ duration: 0.45, ease: EASE }}
              className="bg-white rounded-[22px] p-7 sm:p-9 overflow-hidden"
            >
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={17} className="fill-[#E8A90C] text-[#E8A90C]" />)}
                <span className="ml-auto font-display font-black text-[13px] text-[#9CA3AF] tracking-widest">0{idx + 1} / 0{n}</span>
              </div>
              <blockquote className="mt-4 text-[20px] sm:text-[24px] font-medium text-[#1A1A2E] leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-3">
                  <span className="grid place-items-center w-12 h-12 rounded-full bg-[#0B2F5C] text-white font-bold text-lg">{t.name.charAt(0)}</span>
                  <span>
                    <span className="block font-bold text-[15px] text-[#1A1A2E]">{t.name}</span>
                    <span className="block text-[12px] text-[#6B7280]">{t.role}</span>
                  </span>
                </span>
                {bought && (
                  <Link to={`/product/${bought.sku}`} className="ml-auto flex items-center gap-3 rounded-2xl bg-[#F2F5F9] border border-[#E5E7EB] p-2 pr-4 hover:border-[#0B2F5C]/50 transition group">
                    <SafeImg src={bought.image} alt={bought.name} label={bought.sku} className="w-11 h-11 rounded-xl object-cover shrink-0" wrapClass="w-11 h-11 rounded-xl shrink-0" />
                    <span>
                      <span className="block text-[10px] font-black tracking-widest text-[#9CA3AF] uppercase">Verified purchase</span>
                      <span className="block text-[13px] font-bold text-[#1A1A2E] group-hover:text-[#0B2F5C] transition">{bought.name}</span>
                    </span>
                  </Link>
                )}
              </div>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous review" className="grid place-items-center w-11 h-11 rounded-full border border-white/25 text-white hover:bg-white hover:text-[#0B2F5C] transition">
              <ArrowLeft size={17} />
            </button>
            <button onClick={() => go(1)} aria-label="Next review" className="grid place-items-center w-11 h-11 rounded-full bg-white text-[#0B2F5C] hover:bg-[#8FB4E0] transition">
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="flex gap-2">
            {items.map((x, i) => (
              <button
                key={x.name}
                onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                aria-label={`Go to review ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>
          <div className="ml-auto hidden sm:block h-1 w-40 rounded-full bg-white/15 overflow-hidden">
            <motion.div
              key={idx}
              initial={{ width: paused ? undefined : "0%" }}
              animate={{ width: paused ? undefined : "100%" }}
              transition={{ duration: DWELL / 1000, ease: "linear" }}
              className="h-full bg-white/70"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
