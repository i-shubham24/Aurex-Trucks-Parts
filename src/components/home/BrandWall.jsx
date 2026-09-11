import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Distinct typographic lockups so the wall reads as logos, not a text list.
// These are stylised wordmarks, not reproductions of any registered logo.
const BRANDS = [
  { name: "BENDIX", ff: "var(--font-display)", w: 900, it: true, ls: "-0.04em", color: "#C2181B" },
  { name: "narva", ff: "var(--font-display)", w: 800, ls: "-0.02em", color: "#0A3D91", lower: true },
  { name: "BOSCH", ff: "var(--font-body)", w: 700, ls: "0.14em", color: "#E2001A" },
  { name: "KOYO", ff: "var(--font-display)", w: 800, ls: "0.02em", color: "#0057A8" },
  { name: "DONALDSON", ff: "var(--font-body)", w: 800, ls: "-0.01em", color: "#0F5AA5" },
  { name: "WABCO", ff: "var(--font-display)", w: 900, ls: "0.04em", color: "#1A1A2E" },
  { name: "KYB", ff: "var(--font-display)", w: 900, it: true, ls: "0em", color: "#E0001B" },
  { name: "Exedy", ff: "var(--font-display)", w: 800, it: true, ls: "-0.02em", color: "#C8102E" },
  { name: "FLEETGUARD", ff: "var(--font-body)", w: 800, ls: "-0.02em", color: "#D4380D" },
  { name: "Century", ff: "var(--font-display)", w: 700, ls: "0.02em", color: "#0A7D34" },
  { name: "HENDRICKSON", ff: "var(--font-body)", w: 800, ls: "-0.02em", color: "#00529B" },
  { name: "GATES", ff: "var(--font-display)", w: 900, ls: "0.06em", color: "#111827" },
  { name: "SAKURA", ff: "var(--font-display)", w: 800, ls: "0.08em", color: "#C2181B" },
  { name: "MERITOR", ff: "var(--font-body)", w: 800, ls: "0.02em", color: "#004A98" },
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-px bg-[#E5E7EB] border border-[#E5E7EB]">
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
