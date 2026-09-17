import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Search } from "lucide-react";
import { useSite } from "../../store/site.jsx";
import { useShop } from "../../store/shop.jsx";
import { LogoFull } from "../logo.jsx";
import { FocusTrap } from "../ui.jsx";

const LINKS = [
  ["Home", "/"], ["Shop", "/shop"], ["Categories", "/categories"], ["Brands", "/brands"],
  ["Deals", "/deals"], ["Resources", "/resources"], ["Contact", "/contact"],
];

export default function MobileDrawer({ open, onClose }) {
  const { liveCategories: CATEGORIES } = useSite();
  const { setQuery } = useShop();
  const [q, setQ] = useState("");
  const nav = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/45" 
            onClick={onClose} 
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-white border-r border-[#E5E7EB] flex flex-col min-h-0"
          >
            <FocusTrap active={open} className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-between">
              <LogoFull />
              <button onClick={onClose} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]" aria-label="close">
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); setQuery(q); onClose(); nav("/shop"); }}
              className="mt-4 flex items-center gap-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-4 pr-1.5 py-1.5 focus-within:border-[#DE5718] transition"
            >
              <Search size={16} className="text-[#9CA3AF] shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search parts or SKU..."
                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-[#9CA3AF]"
              />
              <button type="submit" className="bg-gradient-to-r from-[#EE6724] to-[#DE5718] text-white rounded-lg px-4 py-2 text-[13px] font-bold shrink-0 shadow-sm">Go</button>
            </form>
            <div className="mt-5 grid gap-2 font-semibold">
              {LINKS.map(([t, h]) => (
                <Link
                  key={t}
                  to={h}
                  onClick={onClose}
                  className="rounded-xl px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] flex justify-between items-center text-[#12151C] hover:border-[#DE5718] transition"
                >
                  {t}
                  <ChevronRight size={16} className="text-[#9CA3AF]" />
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/login" onClick={onClose} className="text-center bg-gradient-to-r from-[#EE6724] to-[#DE5718] text-white rounded-xl py-2.5 text-sm font-bold shadow-sm">
                Login
              </Link>
              <Link to="/signup" onClick={onClose} className="text-center border border-[#E5E7EB] rounded-xl py-2.5 text-sm font-bold text-[#12151C]">
                Signup
              </Link>
            </div>
            <p className="mt-5 text-[11px] font-bold text-[#9CA3AF] tracking-widest uppercase">Top Categories</p>
            <div className="mt-2 grid gap-1.5">
              {CATEGORIES.slice(0, 8).map((c) => (
                <Link
                  key={c.name}
                  to={`/shop?cat=${encodeURIComponent(c.name)}`}
                  onClick={onClose}
                  className="text-sm rounded-xl px-4 py-2.5 bg-[#F7F8FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#DE5718] transition flex items-center gap-2.5"
                >
                  <c.icon size={16} className="text-[#DE5718]" /> {c.name}
                </Link>
              ))}
            </div>
            </FocusTrap>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}