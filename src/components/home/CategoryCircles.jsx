import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSite } from "../../store/site.jsx";
import { SafeImg } from "../ui.jsx";

function useBreakpoint() {
  const get = () => (typeof window === "undefined" ? "lg" : window.innerWidth >= 1024 ? "lg" : window.innerWidth >= 640 ? "sm" : "base");
  const [bp, setBp] = useState(get);
  useEffect(() => {
    const onResize = () => setBp(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return bp;
}

// Compact category browse tiles in the house angular shape. Label sits under the tile.
// Below desktop only three rows are shown so the section never sprawls;
// the rest live on the All categories page, reached from the trailing tile.
export default function CategoryCircles() {
  const { liveCategories } = useSite();
  const bp = useBreakpoint();
  const cols = bp === "lg" ? 5 : bp === "sm" ? 3 : 2;
  const maxSlots = cols * 2;
  const visible = liveCategories.slice(0, maxSlots);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-8">
      {visible.map((c, i) => (
        <motion.div
          key={c.name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: (i % 5) * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group flex flex-col items-center text-center">
            <div className="relative w-full aspect-square max-w-[200px] group-hover:-translate-y-1 transition-transform duration-500">
              <div className="clip-cut-lg w-full h-full overflow-hidden bg-[#12151C]">
                <SafeImg
                  src={c.image}
                  alt={c.name}
                  label={c.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  wrapClass="w-full h-full"
                />
                <span className="clip-cut-lg absolute inset-0 border-[3px] border-[#DE5718] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="clip-notch absolute -bottom-2 left-1/2 -translate-x-1/2 grid place-items-center w-9 h-9 bg-gradient-to-r from-[#EE6724] to-[#DE5718] text-white shadow-copper group-hover:scale-110 transition">
                <c.icon size={16} />
              </span>
            </div>
            <p className="mt-5 text-[13px] font-bold text-[#12151C] leading-tight group-hover:text-[#DE5718] transition">{c.name}</p>
            <p className="text-[11px] text-[#9CA3AF]">{c.count} lines</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
