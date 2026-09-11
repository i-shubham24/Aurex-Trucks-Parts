import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, ShoppingCart, User, Phone, Mail, ChevronDown, ArrowRight } from "lucide-react";
import { useShop } from "../../store/shop.jsx";
import { useAuth } from "../../store/auth.jsx";
import { useSite } from "../../store/site.jsx";
import { useProducts } from "../../store/products.jsx";
import { LogoFull } from "../logo.jsx";
import YMMWidget from "../garage/YMMWidget.jsx";

const NAV = ["Braking", "Suspension", "Engine", "Air and Electrical", "Lighting", "Towing and Winches"];

// Inline social glyphs (brand icons are not exported by this lucide build).
const Social = ({ d }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="hover:text-[#FF6B35] transition cursor-pointer" aria-hidden="true"><path d={d} /></svg>
);
const IG = "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.22.6-.48 1-.9 1.4-.4.4-.8.7-1.4.9-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42-.6-.22-1-.48-1.4-.9-.4-.4-.7-.8-.9-1.4-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.6.48-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 3.5A6.3 6.3 0 1 0 18.3 12 6.3 6.3 0 0 0 12 5.7Zm0 10.4A4.1 4.1 0 1 1 16.1 12 4.1 4.1 0 0 1 12 16.1Zm6.5-10.6a1.47 1.47 0 1 1-1.47-1.47 1.47 1.47 0 0 1 1.47 1.47Z";
const FB = "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z";
const LI = "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.76 1.76 0 0 0 24 22.27V1.73A1.76 1.76 0 0 0 22.22 0Z";

export default function Header({ onOpenMobile }) {
  const { count, setDrawer, query, setQuery } = useShop();
  const { user } = useAuth();
  const { liveCategories: CATEGORIES, settings } = useSite();
  const { products: PRODUCTS } = useProducts();
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [sugOpen, setSugOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSugOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { prods: [], cats: [] };
    const prods = PRODUCTS.filter((p) => (p.name + " " + p.sku + " " + (p.oem || "") + " " + (p.brand || "")).toLowerCase().includes(q)).slice(0, 6);
    const cats = CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3);
    return { prods, cats };
  }, [query, PRODUCTS, CATEGORIES]);

  const go = (to) => { setSugOpen(false); nav(to); };
  const submitSearch = (e) => { e.preventDefault(); go("/shop"); };

  return (
    <header className="sticky top-0 z-50 shadow-[0_6px_20px_-12px_rgba(16,24,40,0.35)]">
      {/* Utility strip: dark, collapses on scroll */}
      <div className={`bg-[#1A1A2E] text-white overflow-hidden transition-all duration-300 ${scrolled ? "max-h-0" : "max-h-10"}`}>
        <div className="mx-auto max-w-7xl px-4 h-9 flex items-center justify-between text-[12px] font-semibold">
          <div className="flex items-center gap-5 text-white/80">
            <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:text-white transition"><Mail size={13} className="text-[#FF6B35]" /> <span className="hidden sm:inline">{settings.email}</span></a>
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:text-white transition"><Phone size={13} className="text-[#FF6B35]" /> {settings.phone}</a>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <span className="hidden md:inline">Australian owned. ADR compliant. Freight Australia wide.</span>
            <span className="flex items-center gap-2.5 pl-3 border-l border-white/20">
              <Social d={IG} /><Social d={FB} /><Social d={LI} />
            </span>
          </div>
        </div>
      </div>

      <div>
        {/* Main bar (white) */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className={`mx-auto max-w-7xl px-4 flex items-center gap-4 transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
            <button onClick={onOpenMobile} className="lg:hidden p-2 -ml-1 text-[#1A1A2E]" aria-label="menu"><Menu size={22} /></button>

            <Link to="/" aria-label="Aurex Truck Parts home" className="shrink-0">
              <LogoFull className={scrolled ? "scale-95 origin-left" : ""} />
            </Link>

            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xl mx-2">
              <form onSubmit={submitSearch}>
                <div className="flex items-center w-full bg-[#F5F6F8] border border-[#E5E7EB] rounded-full pl-5 pr-1.5 py-1.5 focus-within:border-[#E53E00] focus-within:bg-white transition">
                  <Search size={17} className="text-[#9CA3AF]" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSugOpen(true); }}
                    onFocus={() => setSugOpen(true)}
                    placeholder="Search part number, OEM, or keyword"
                    className="flex-1 bg-transparent outline-none px-3 text-[14px] text-[#1A1A2E] placeholder:text-[#9CA3AF]"
                  />
                  <button type="submit" className="bg-[#E53E00] hover:bg-[#1A1A2E] text-white rounded-full w-9 h-9 grid place-items-center transition" aria-label="search"><Search size={16} /></button>
                </div>
              </form>
              <AnimatePresence>
                {sugOpen && query.trim().length >= 2 && (suggestions.prods.length > 0 || suggestions.cats.length > 0) && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }} className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-[#1A1A2E] shadow-elevated z-[60] max-h-[440px] overflow-auto">
                    {suggestions.cats.length > 0 && (
                      <div className="p-2">
                        <p className="px-3 py-1 text-[10px] font-black tracking-widest text-[#9CA3AF] uppercase">Categories</p>
                        {suggestions.cats.map((c) => (
                          <button key={c.name} onClick={() => go(`/shop?cat=${encodeURIComponent(c.name)}`)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#FFF0EB] text-left transition">
                            <c.icon size={16} className="text-[#E53E00] shrink-0" />
                            <span className="text-sm font-semibold text-[#1A1A2E]">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {suggestions.prods.length > 0 && (
                      <div className="p-2 border-t border-[#F1F2F4]">
                        <p className="px-3 py-1 text-[10px] font-black tracking-widest text-[#9CA3AF] uppercase">Parts</p>
                        {suggestions.prods.map((p) => (
                          <button key={p.sku} onClick={() => { setQuery(""); go(`/product/${p.sku}`); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#FFF0EB] text-left transition">
                            <img src={p.image} alt="" className="w-10 h-10 object-cover rounded shrink-0 bg-[#F1F2F4]" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-semibold text-[#1A1A2E] truncate">{p.name}</span>
                              <span className="block text-[11px] text-[#9CA3AF]">{p.sku}</span>
                            </span>
                            <span className="text-[13px] font-black text-[#E53E00] shrink-0">${p.price.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link to={user ? "/account" : "/login"} className="hidden sm:flex items-center gap-2 text-[#1A1A2E] hover:text-[#E53E00] transition">
                <User size={20} />
                <span className="leading-tight text-left hidden lg:block">
                  <span className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{user ? "Account" : "Sign in"}</span>
                  <span className="block text-[13px] font-bold">{user ? user.name.split(" ")[0] : "Business account"}</span>
                </span>
              </Link>
              <div className="relative">
                <button onClick={() => setDrawer(true)} className="clip-cut flex items-center gap-2 bg-[#E53E00] text-white pl-3.5 pr-4 py-2.5 text-sm font-bold hover:bg-[#1A1A2E] transition">
                  <ShoppingCart size={17} />
                  <span className="hidden sm:inline">Cart</span>
                </button>
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-[#1A1A2E] text-white text-[11px] font-black border-2 border-white">{count}</span>
                )}
              </div>
              <div className="hidden xl:block"><YMMWidget variant="pill" /></div>
            </div>
          </div>
        </div>

        {/* Category nav (orange) */}
        <div className="bg-[#E53E00] text-white hidden lg:block relative" onMouseLeave={() => setMega(false)}>
          <div className="mx-auto max-w-7xl px-4 flex items-center gap-1 text-[13px] font-bold uppercase tracking-wide">
            <button
              onMouseEnter={() => setMega(true)}
              onClick={() => nav("/shop")}
              className={`flex items-center gap-2 px-4 py-3 transition ${mega ? "bg-white text-[#E53E00]" : "hover:bg-black/10"}`}
            >
              <Menu size={16} /> All categories <ChevronDown size={14} className={`transition ${mega ? "rotate-180" : ""}`} />
            </button>
            {NAV.map((c) => (
              <Link key={c} to={`/shop?cat=${encodeURIComponent(c)}`} onMouseEnter={() => setMega(false)} className="px-3.5 py-3 hover:bg-black/10 transition whitespace-nowrap">
                {c === "Air and Electrical" ? "Electrical" : c === "Towing and Winches" ? "Towing" : c}
              </Link>
            ))}
            <Link to="/deals" onMouseEnter={() => setMega(false)} className="px-3.5 py-3 hover:bg-black/10 transition">Deals</Link>
            <Link to="/contact" onMouseEnter={() => setMega(false)} className="px-3.5 py-3 hover:bg-black/10 transition">Contact</Link>
            <span className="ml-auto flex items-center gap-2 text-[12px] font-semibold normal-case tracking-normal text-white/85 pr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> 60,000+ lines ready to ship
            </span>
          </div>

          <AnimatePresence>
            {mega && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
                onMouseEnter={() => setMega(true)}
                className="absolute left-0 right-0 top-full bg-white text-[#1A1A2E] shadow-elevated border-b-4 border-[#E53E00] z-50"
              >
                <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-[1fr_320px] gap-6">
                  <div className="grid grid-cols-3 gap-1.5">
                    {CATEGORIES.map((c) => (
                      <Link key={c.name} to={`/shop?cat=${encodeURIComponent(c.name)}`} onClick={() => setMega(false)} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#FFF0EB] transition">
                        <span className="grid place-items-center w-10 h-10 rounded-lg bg-[#F5F6F8] text-[#E53E00] group-hover:bg-[#E53E00] group-hover:text-white transition shrink-0"><c.icon size={18} /></span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-bold truncate">{c.name}</span>
                          <span className="block text-[11px] text-[#9CA3AF]">{c.count} lines</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link to="/deals" onClick={() => setMega(false)} className="relative overflow-hidden group grid place-items-center p-6 text-white" style={{ background: "linear-gradient(135deg,#1A1A2E,#3a1c0c)" }}>
                    <div className="absolute inset-0 grid-scrim opacity-40" />
                    <div className="relative text-center">
                      <p className="text-[11px] font-black tracking-[0.2em] text-[#FF6B35]">THIS WEEK</p>
                      <p className="font-display font-bold text-2xl mt-1 leading-tight">Fleet deals up to 30% off</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 bg-[#E53E00] text-white rounded-lg px-4 py-2 text-[13px] font-bold group-hover:gap-2.5 transition-all">See deals <ArrowRight size={14} /></span>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
