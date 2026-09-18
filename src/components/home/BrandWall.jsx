import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Distinct typographic lockups so the wall reads as logos, not a text list.
// These are stylised wordmarks, not reproductions of any registered logo.
const BRANDS = [
  { name: "BEAUWAY", ff: "var(--font-display)", w: 900, ls: "0.02em", color: "#134E8D" },
  { name: "GANLAND", ff: "var(--font-display)", w: 900, ls: "0.02em", color: "#222538" },
  { name: "CAIYUAN", ff: "var(--font-display)", w: 800, ls: "0.04em", color: "#3873B3" },
  { name: "AUREX", ff: "var(--font-display)", w: 900, it: true, ls: "-0.02em", color: "#134E8D" },
];

function Mark({ b }) {
  return (
    <span
      className="transition-all duration-300 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100"
      style={{
        fontFamily: b.ff,
        fontWeight: b.w,
        fontStyle: b.it ? "italic" : "normal",
        letterSpacing: b.ls,
        color: b.color,
        fontSize: "20px",
        textTransform: b.lower ? "none" : undefined,
        lineHeight: 1,
      }}
    >
      {b.name}
    </span>
  );
}

export default function BrandWall() {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E5E7EB] border border-[#E5E7EB]">
        {BRANDS.map((b, i) => (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: (i % 7) * 0.04 }}
          >
            <Link to="/brands" className="group grid place-items-center h-24 bg-white hover:bg-[#FFF8F5] transition-colors">
              <Mark b={b} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Marquee variant using the same lockups.
export function BrandMarquee() {
  const row = [...BRANDS, ...BRANDS];
  return (
    <div className="mask-fade-x overflow-hidden py-2">
      <div className="flex whitespace-nowrap animate-marquee marquee-track gap-14 w-max items-center">
        {row.map((b, i) => (
          <span key={i} className="grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition"
            style={{ fontFamily: b.ff, fontWeight: b.w, fontStyle: b.it ? "italic" : "normal", letterSpacing: b.ls, color: b.color, fontSize: "22px" }}>
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}
