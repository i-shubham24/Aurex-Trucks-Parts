import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useSite } from "../../store/site.jsx";

const LINKS = [
  ["Home", "/"], ["Shop", "/shop"], ["Categories", "/categories"], ["Brands", "/brands"],
  ["Deals", "/deals"], ["Resources", "/resources"], ["Contact", "/contact"],
];

export default function MegaMenu() {
  const { liveCategories: CATEGORIES } = useSite();
  const [mega, setMega] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="hidden lg:block border-t border-[#F3F4F6] bg-[#FAFAFB] relative" onMouseLeave={() => setMega(false)}>
      <nav className="mx-auto max-w-7xl px-4 flex items-center gap-1 text-[13.5px] font-semibold">
        {LINKS.map(([t, h]) =>
          t === "Categories" ? (
            <button
              key={t}
              onMouseEnter={() => setMega(true)}
              onClick={() => nav(h)}
              className={`px-4 py-3.5 border-b-2 flex items-center gap-1 transition ${
                mega || pathname === h ? "border-[#0B2F5C] text-[#0B2F5C]" : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"
              }`}
            >
              {t} <ChevronDown size={14} className={`transition ${mega ? "rotate-180" : ""}`} />
            </button>
          ) : (
            <NavLink
              key={t}
              to={h}
              onMouseEnter={() => setMega(false)}
              className={({ isActive }) =>
                `px-4 py-3.5 border-b-2 transition ${
                  isActive ? "border-[#0B2F5C] text-[#0B2F5C]" : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"
                }`
              }
            >
              {t}
            </NavLink>
          )
        )}
        <span className="ml-auto text-[12px] text-[#9CA3AF] font-medium flex items-center gap-2 pr-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> 60,000+ lines ready to ship
        </span>
      </nav>

      <AnimatePresence>
        {mega && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22 }}
            className="absolute left-0 right-0 top-full bg-white border-b border-[#E5E7EB] shadow-elevated z-50"
            onMouseEnter={() => setMega(true)}
          >
            <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-[1fr_300px] gap-6">
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.name}
                    to={`/shop?cat=${encodeURIComponent(c.name)}`}
                    onClick={() => setMega(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#E8EEF5] transition"
                  >
                    <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#F5F6F8] text-[#0B2F5C] group-hover:bg-[#0B2F5C] group-hover:text-white transition shrink-0">
                      <c.icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-[#1A1A2E] truncate">{c.name}</span>
                      <span className="block text-[11px] text-[#9CA3AF]">{c.count} lines</span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                to="/deals"
                onClick={() => setMega(false)}
                className="relative rounded-xl overflow-hidden group grid place-items-center p-6 text-white"
                style={{ background: "linear-gradient(135deg,#0B2F5C,#7a1500)" }}
              >
                <div className="relative text-center">
                  <p className="text-[11px] font-black tracking-[0.2em] text-white/70">THIS WEEK</p>
                  <p className="font-display font-bold text-2xl mt-1 leading-tight">Fleet deals up to 30% off</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 bg-white text-[#1A1A2E] rounded-lg px-4 py-2 text-[13px] font-bold group-hover:gap-2.5 transition-all">
                    See deals <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}