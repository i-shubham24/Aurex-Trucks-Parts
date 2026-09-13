import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SafeImg } from "../ui.jsx";

// CarParts style promo boxes: bold word on an orange field with a part cutout.
const BOXES = [
  { label: "BRAKE KITS", cat: "Braking", img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=560&h=420&fit=crop&auto=format" },
  { label: "TIPPER KITS", cat: "Tipper and Hydraulic", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=560&h=420&fit=crop&auto=format" },
  { label: "WINCHES", cat: "Towing and Winches", img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=560&h=420&fit=crop&auto=format" },
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#B43808] via-[#DE5718] to-[#992D05]" />
            <div className="absolute inset-0 grid-scrim opacity-20" />
            <SafeImg
              src={b.img}
              alt={b.label}
              label={b.label}
              className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-90 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"
              wrapClass="absolute right-0 top-0 h-full w-2/3"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#B43808] via-[#DE5718]/80 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-between text-white">
              <p className="font-display font-black text-[30px] leading-[0.95] tracking-[-0.02em] drop-shadow max-w-[60%]">{b.label}</p>
              <span className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-wide bg-white text-[#DE5718] px-4 py-2 w-fit group-hover:gap-3 shadow-sm transition-all"
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
