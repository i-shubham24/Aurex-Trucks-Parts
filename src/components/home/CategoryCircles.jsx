import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSite } from "../../store/site.jsx";
import { SafeImg } from "../ui.jsx";
import { ArrowRight } from "lucide-react";

// Compact category browse tiles in the house angular shape. Label sits under the tile.
// Below desktop only three rows are shown so the section never sprawls;
// the rest live on the All categories page, reached from the trailing tile.
export default function CategoryCircles() {
  const { liveCategories } = useSite();
  // "Tools and Others" lives under All categories only, not on the home grid.
  // Laptop shows 2 rows of 3; smaller screens reflow naturally.
  const visible = liveCategories.filter((c) => c.name !== "Tools and Others");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10">
      {visible.map((c, i) => (
        <motion.div
          key={c.name}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: (i % 3) * 0.09, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group flex flex-col items-center text-center">
            <div className="relative w-full aspect-[4/3] group-hover:-translate-y-1.5 transition-transform duration-500">
              <div className="clip-cut-lg w-full h-full overflow-hidden bg-[#1A1A2E]">
                <SafeImg
                  src={c.image}
                  alt={c.name}
                  label={c.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  wrapClass="w-full h-full"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#0B2F5C]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="clip-cut-lg absolute inset-0 border-[3px] border-[#0B2F5C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="clip-notch absolute -bottom-2 left-1/2 -translate-x-1/2 grid place-items-center w-10 h-10 bg-[#0B2F5C] text-white shadow-primary group-hover:scale-110 group-hover:rotate-6 transition duration-300">
                <c.icon size={17} />
              </span>
              <span className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-white/95 text-[#0B2F5C] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                <ArrowRight size={15} />
              </span>
            </div>
            <p className="mt-5 text-[15px] font-bold text-[#1A1A2E] leading-tight group-hover:text-[#0B2F5C] transition">{c.name}</p>
            <p className="text-[12px] text-[#9CA3AF]">{c.count} lines · <span className="text-[#0B2F5C] font-semibold">Shop now</span></p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
