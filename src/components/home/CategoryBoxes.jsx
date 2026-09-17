import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SafeImg } from "../ui.jsx";

// Promo boxes for the approved range: tail lifts, tool boxes, trailer parts.
const BOXES = [
  { label: "TAIL LIFTS", cat: "Tail Lifts", img: "/images/TAIL-LIFTS-CAT.jpg" },
  { label: "TOOL BOXES", cat: "Tool Boxes", img: "/images/products/GL-25126.jpg" },
  { label: "TRAILER PARTS", cat: "Trailer Parts", img: "/images/TRAILER-PARTS-CAT.jpg" },
];

export default function CategoryBoxes() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {BOXES.map((b, i) => (
        <motion.div
          key={b.label}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
        >
          <Link
            to={`/shop?cat=${encodeURIComponent(b.cat)}`}
            className="group relative block h-44 overflow-hidden"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 26px 100%, 0 calc(100% - 26px))" }}
          >
<<<<<<< HEAD
            <div className="absolute inset-0 bg-gradient-to-r from-[#B43808] via-[#DE5718] to-[#992D05]" />
=======
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B2F5C] via-[#0B2F5C] to-[#071E3C]" />
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
            <div className="absolute inset-0 grid-scrim opacity-20" />
            <SafeImg
              src={b.img}
              alt={b.label}
              label={b.label}
              className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-90 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"
              wrapClass="absolute right-0 top-0 h-full w-2/3"
            />
<<<<<<< HEAD
            <div className="absolute inset-0 bg-gradient-to-r from-[#B43808] via-[#DE5718]/80 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-between text-white">
              <p className="font-display font-black text-[30px] leading-[0.95] tracking-[-0.02em] drop-shadow max-w-[60%]">{b.label}</p>
              <span className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-wide bg-white text-[#DE5718] px-4 py-2 w-fit group-hover:gap-3 shadow-sm transition-all"
=======
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B2F5C] via-[#0B2F5C]/70 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-between text-white">
              <p className="font-display font-black text-[30px] leading-[0.95] tracking-[-0.02em] drop-shadow max-w-[60%]">{b.label}</p>
              <span className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-wide bg-white text-[#0B2F5C] px-4 py-2 w-fit group-hover:gap-3 transition-all"
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
                Shop now <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
