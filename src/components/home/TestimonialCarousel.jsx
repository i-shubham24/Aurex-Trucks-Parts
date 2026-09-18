import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

// Brisk auto-run interval: 2.8 seconds per slide
const DWELL = 2800;

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TestimonialCarousel({ items = [] }) {
  const [idx, setIdx] = useState(0);
  const n = items.length;

  // Continuous loop timer
  useEffect(() => {
    if (n < 2) return;
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % n);
    }, DWELL);
    return () => clearInterval(timer);
  }, [idx, n]);

  const go = (d) => {
    setIdx((i) => (i + d + n) % n);
  };

  // Calculate shortest cyclic distance
  const getOffset = (itemIndex) => {
    let diff = itemIndex - idx;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    return diff;
  };

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-20 border-t border-[#E5E7EB] select-none">
      {/* Aurex Brand Ambient Glow behind center card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[360px] rounded-full bg-[#134E8D]/16 blur-[110px] pointer-events-none" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[260px] rounded-full bg-[#3873B3]/10 blur-[90px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[12px] font-black tracking-[0.22em] text-[#134E8D] uppercase">
            Customer Reviews
          </p>
          <h2 className="font-display font-bold text-[#222538] text-[30px] sm:text-[42px] leading-tight mt-2">
            Word from the workshop floor.
          </h2>
          <p className="text-[#6B7280] text-[14px] mt-2">
            Verified feedback from Australian commercial fleets, transport operators, and bodybuilders.
          </p>
        </div>

        {/* 3D Coverflow Stage with ample vertical space for drop shadow */}
        <div className="relative h-[430px] sm:h-[460px] flex items-center justify-center py-8">
          {items.map((item, i) => {
            const offset = getOffset(i);
            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            // 3D perspective translations and scales
            let x = "0%";
            let scale = 1;
            let opacity = 1;
            let zIndex = 30;
            let blur = "blur(0px)";

            if (offset === 1) {
              x = "52%";
              scale = 0.88;
              opacity = 0.72;
              zIndex = 20;
              blur = "blur(0.4px)";
            } else if (offset === -1) {
              x = "-52%";
              scale = 0.88;
              opacity = 0.72;
              zIndex = 20;
              blur = "blur(0.4px)";
            } else if (offset === 2) {
              x = "94%";
              scale = 0.76;
              opacity = 0.38;
              zIndex = 10;
              blur = "blur(1.2px)";
            } else if (offset === -2) {
              x = "-94%";
              scale = 0.76;
              opacity = 0.38;
              zIndex = 10;
              blur = "blur(1.2px)";
            }

            const initials = getInitials(item.name);

            return (
              <motion.div
                key={item.name}
                onClick={() => {
                  if (!isCenter) setIdx(i);
                }}
                animate={{
                  x,
                  scale,
                  opacity,
                  filter: blur,
                  zIndex,
                }}
                transition={{
                  duration: 0.42,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`absolute w-[310px] sm:w-[370px] md:w-[410px] h-[330px] sm:h-[360px] rounded-[28px] p-7 sm:p-8 flex flex-col justify-between transition-shadow duration-500 select-none ${
                  isCenter
                    ? "bg-gradient-to-b from-[#242938] via-[#1D2230] to-[#151824] text-white shadow-[0_24px_60px_rgba(0,0,0,0.35),0_0_40px_rgba(19,78,141,0.28)] border border-[#134E8D]/45 cursor-default"
                    : "bg-[#222634] text-white/85 border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.2)] cursor-pointer hover:opacity-90"
                }`}
                style={{
                  transformOrigin: "center center",
                }}
              >
                {/* Aurex Blue Ambient highlight inside center card */}
                {isCenter && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-28 bg-[#134E8D]/25 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Decorative Quotation Mark in Top-Right */}
                <span className="absolute top-6 right-7 text-4xl sm:text-5xl font-serif text-white/20 select-none leading-none pointer-events-none">
                  &rdquo;
                </span>

                {/* Top Center: Aurex Gold Stars + Centered Quote */}
                <div className="flex flex-col items-center text-center mt-1">
                  <div className="flex items-center justify-center gap-1.5 mb-4">
                    {[...Array(item.rating || 5)].map((_, s) => (
                      <Star
                        key={s}
                        size={15}
                        className="fill-[#F59E0B] text-[#F59E0B]"
                      />
                    ))}
                  </div>

                  {/* Centered quote text */}
                  <blockquote className="text-[14.5px] sm:text-[16px] font-normal leading-relaxed text-white/95 max-w-[340px]">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Bottom Row: Aurex Blue Avatar + Name + Subtitle */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center gap-3.5">
                  <span
                    className={`grid place-items-center w-11 h-11 rounded-full font-bold text-[13px] shrink-0 ${
                      isCenter
                        ? "bg-[#134E8D]/30 text-[#9AC1EE] border border-[#134E8D]/50"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {initials}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="font-display font-bold text-[15px] text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[10.5px] text-white/50 tracking-[0.14em] uppercase truncate mt-0.5 font-medium">
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Controls: Left Arrow | Aurex Blue Dots Capsule | Right Arrow */}
        <div className="mt-8 flex flex-col items-center gap-3.5">
          <div className="flex items-center gap-5">
            <button
              onClick={() => go(-1)}
              aria-label="Previous review"
              className="grid place-items-center w-11 h-11 rounded-full bg-white border border-[#E5E7EB] text-[#222538] hover:bg-[#EDF3FA] hover:text-[#134E8D] hover:border-[#134E8D] transition shadow-xs active:scale-95"
            >
              <ArrowLeft size={17} />
            </button>

            {/* Pagination Dots with Active Aurex Blue Pill */}
            <div className="flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    i === idx
                      ? "w-7 h-2 bg-[#134E8D]"
                      : "w-2 h-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              aria-label="Next review"
              className="grid place-items-center w-11 h-11 rounded-full bg-white border border-[#E5E7EB] text-[#222538] hover:bg-[#EDF3FA] hover:text-[#134E8D] hover:border-[#134E8D] transition shadow-xs active:scale-95"
            >
              <ArrowRight size={17} />
            </button>
          </div>

          {/* Numerical Page Indicator: '1 / 5' */}
          <p className="text-[12.5px] font-semibold tracking-widest text-[#6B7280]">
            {idx + 1} / {n}
          </p>
        </div>
      </div>
    </section>
  );
}
