import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, ShoppingCart, User, Phone, Mail, ChevronDown, ArrowRight, X } from "lucide-react";
import { useShop } from "../../store/shop.jsx";
import { useAuth } from "../../store/auth.jsx";
import { useSite } from "../../store/site.jsx";
import { useProducts } from "../../store/products.jsx";
import { LogoFull } from "../logo.jsx";

// Inline social glyphs
const Social = ({ d }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="hover:text-[#9AC1EE] transition cursor-pointer" aria-hidden="true">
    <path d={d} />
  </svg>
);
const IG = "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.22.6-.48 1-.9 1.4-.4.4-.8.7-1.4.9-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42-.6-.22-1-.48-1.4-.9-.4-.4-.7-.8-.9-1.4-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.6.48-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 3.5A6.3 6.3 0 1 0 18.3 12 6.3 6.3 0 0 0 12 5.7Zm0 10.4A4.1 4.1 0 1 1 16.1 12 4.1 4.1 0 0 1 12 16.1Zm6.5-10.6a1.47 1.47 0 1 1-1.47-1.47 1.47 1.47 0 0 1 1.47 1.47Z";
const FB = "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z";
const LI = "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.76 1.76 0 0 0 24 22.27V1.73A1.76 1.76 0 0 0 22.22 0Z";
const TW = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";

export default function Header({ onOpenMobile }) {
  const { count, setDrawer, query, setQuery } = useShop();
  const { user } = useAuth();
  const { liveCategories: CATEGORIES, settings } = useSite();
  const { products: PRODUCTS } = useProducts();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const [mega, setMega] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [sugOpen, setSugOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSugOpen(false);
        setSearchActive(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { prods: [], cats: [] };
    const prods = PRODUCTS.filter((p) =>
      (p.name + " " + p.sku + " " + (p.oem || "") + " " + (p.brand || "")).toLowerCase().includes(q)
    ).slice(0, 6);
    const cats = CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3);
    return { prods, cats };
  }, [query, PRODUCTS, CATEGORIES]);

  const go = (to) => {
    setSugOpen(false);
    setSearchActive(false);
    nav(to);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    go("/shop");
  };

  const navLinks = [
    { label: "HOME", to: "/" },
    { label: "ABOUT US", to: "/about" },
    { label: "SHOP", to: "/shop" },
    { label: "CATEGORIES", to: "/catalogue", isMega: true },
    { label: "CONTACT US", to: "/contact" }
  ];

  const isLinkActive = (to) => {
    if (to === "/" && pathname === "/") return true;
    if (to !== "/" && pathname.startsWith(to)) return true;
    return false;
  };

  return (
    <header className="relative z-50 bg-[#222538] text-white">
      {/* Top Utility Info Bar (scrolls away naturally) */}
      <div className="border-b border-white/10 bg-[#1D2030]/90">
        <div className="mx-auto max-w-[1560px] px-4 sm:px-8 h-9 flex items-center justify-between text-[12px] font-medium text-white/80">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${settings.phone || "1300 0 AUREX"}`}
              className="flex items-center gap-1.5 hover:text-white transition font-semibold text-white/90"
            >
              <Phone size={13} className="text-[#9AC1EE]" />
              <span>Call Us {settings.phone || "1300 0 AUREX"}</span>
            </a>
            <a
              href={`mailto:${settings.email || "sales@aurextruckparts.com.au"}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition text-white/70"
            >
              <Mail size={13} className="text-[#9AC1EE]" />
              <span>{settings.email || "sales@aurextruckparts.com.au"}</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-[11px] text-[#9AC1EE] font-bold tracking-wide">
              🚚 Melbourne Warehouse Direct · ADR Compliant
            </span>
            <div className="flex items-center gap-3 pl-3 border-l border-white/15 text-white/70">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Social d={FB} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Social d={IG} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Social d={TW} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Social d={LI} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Floating Slanted Navigation Bar (Sticky Floating Element) */}
      <div className="sticky top-2 sm:top-3 z-50 mx-auto max-w-[1560px] px-3 sm:px-6 py-2.5 sm:py-3 transition-all duration-300">
        <div className="relative flex items-stretch shadow-[0_15px_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-visible">
          {/* Left: White Angled Logo Support Box */}
          <div
            className="bg-white px-6 sm:px-8 py-3 rounded-l-2xl flex items-center shrink-0 relative z-20 shadow-lg"
            style={{
              clipPath: "polygon(0 0, 100% 0, calc(100% - 32px) 100%, 0 100%)",
              paddingRight: "48px"
            }}
          >
            <button onClick={onOpenMobile} className="lg:hidden p-1.5 -ml-2 mr-2 text-[#222538]" aria-label="menu">
              <Menu size={22} />
            </button>
            <Link to="/" aria-label="Aurex Truck Parts" className="shrink-0 block">
              <LogoFull />
            </Link>
          </div>

          {/* Right: Primary Blue (#134E8D) Navigation Strip */}
          <div
            className="flex-1 bg-[#134E8D] text-white flex items-center justify-between -ml-8 pl-10 sm:pl-12 pr-4 sm:pr-8 rounded-r-2xl shadow-xl relative z-10"
            style={{
              clipPath: "polygon(28px 0, 100% 0, 100% 100%, 0 100%)"
            }}
          >
            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-3 2xl:gap-5 text-[13.5px] font-black uppercase tracking-wider">
              {navLinks.map((item) => {
                const active = isLinkActive(item.to);
                if (item.isMega) {
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setMega(true)}
                    >
                      <button
                        onClick={() => nav(item.to)}
                        className={`flex items-center gap-1 px-3.5 py-2 transition relative ${active ? "text-white font-black" : "text-white/90 hover:text-white"
                          }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown size={13} className={`transition-transform ${mega ? "rotate-180" : ""}`} />
                        {active && (
                          <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-white rounded-full" />
                        )}
                      </button>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onMouseEnter={() => setMega(false)}
                    className={`px-3 py-2 transition relative ${active ? "text-white font-black" : "text-white/90 hover:text-white"
                      }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-white rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Controls */}
            <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
              {/* Direct Inline Search Bar */}
              <div ref={searchRef} className="relative hidden md:block">
                <form
                  onSubmit={submitSearch}
                  className="flex items-center w-52 lg:w-60 xl:w-72 bg-white/15 border border-white/25 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-white transition-all shadow-inner"
                >
                  <Search size={15} className="text-white/70 group-focus-within:text-[#134E8D] shrink-0 mr-2" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSugOpen(true);
                    }}
                    onFocus={() => setSugOpen(true)}
                    placeholder="Search Part #, OEM..."
                    className="w-full bg-transparent text-xs text-white focus:text-[#222538] placeholder-white/60 focus:placeholder-[#9CA3AF] outline-none font-medium"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="text-white/70 hover:text-[#222538] p-0.5 ml-1"
                      aria-label="Clear query"
                    >
                      <X size={13} />
                    </button>
                  )}
                </form>

                {/* Instant Suggestions Dropdown */}
                <AnimatePresence>
                  {sugOpen && query.trim().length >= 2 && (suggestions.prods.length > 0 || suggestions.cats.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-3 text-[#222538] z-50 max-h-[440px] overflow-auto"
                    >
                      {suggestions.cats.length > 0 && (
                        <div className="py-1">
                          <p className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">Categories</p>
                          {suggestions.cats.map((c) => (
                            <button
                              key={c.name}
                              onClick={() => go(`/shop?cat=${encodeURIComponent(c.name)}`)}
                              className="w-full flex items-center gap-2.5 px-2 py-1.5 hover:bg-[#EDF3FA] text-left text-xs font-semibold rounded-lg text-[#222538]"
                            >
                              <c.icon size={14} className="text-[#134E8D]" />
                              <span>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {suggestions.prods.length > 0 && (
                        <div className="py-1 border-t border-gray-100">
                          <p className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">Parts</p>
                          {suggestions.prods.map((p) => (
                            <button
                              key={p.sku}
                              onClick={() => {
                                setQuery("");
                                go(`/product/${p.sku}`);
                              }}
                              className="w-full flex items-center gap-2.5 px-2 py-1.5 hover:bg-[#EDF3FA] text-left rounded-lg transition"
                            >
                              <img src={p.image} alt="" className="w-8 h-8 rounded object-cover bg-gray-100 shrink-0" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#222538] truncate">{p.name}</p>
                                <p className="text-[10px] text-[#9CA3AF]">{p.sku}</p>
                              </div>
                              <span className="text-xs font-black text-[#134E8D]">${p.price?.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Account */}
              <Link
                to={user ? "/account" : "/login"}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white hover:text-[#134E8D] text-white grid place-items-center transition shadow-sm"
                aria-label="Account"
                title={user ? user.name : "Sign In"}
              >
                <User size={16} />
              </Link>

              {/* Cart Button */}
              <div className="relative">
                <button
                  onClick={() => setDrawer(true)}
                  className="flex items-center gap-1.5 bg-white text-[#134E8D] hover:bg-[#222538] hover:text-white px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md"
                >
                  <ShoppingCart size={15} />
                  <span className="hidden sm:inline">Cart</span>
                </button>
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-[#222538] text-white text-[10px] font-black border-2 border-white">
                    {count}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {mega && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setMega(true)}
            onMouseLeave={() => setMega(false)}
            className="absolute left-0 right-0 top-full bg-white text-[#222538] shadow-2xl border-b-4 border-[#134E8D] z-50"
          >
            <div className="mx-auto max-w-[1560px] px-4 sm:px-8 py-6 grid grid-cols-[1fr_320px] gap-6">
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.name}
                    to={`/shop?cat=${encodeURIComponent(c.name)}`}
                    onClick={() => setMega(false)}
                    className="group flex items-center gap-3 rounded-xl p-3 hover:bg-[#EDF3FA] transition"
                  >
                    <span className="grid place-items-center w-10 h-10 rounded-lg bg-[#F5F6F8] text-[#134E8D] group-hover:bg-[#134E8D] group-hover:text-white transition shrink-0">
                      <c.icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold truncate">{c.name}</span>
                      <span className="block text-[11px] text-[#9CA3AF]">{c.count} lines</span>
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                to="/deals"
                onClick={() => setMega(false)}
                className="relative overflow-hidden group rounded-xl p-6 text-white flex flex-col justify-center text-center bg-gradient-to-br from-[#222538] to-[#134E8D]"
              >
                <p className="text-[11px] font-black tracking-[0.2em] text-[#9AC1EE] uppercase">Special Trade Offer</p>
                <p className="font-display font-bold text-2xl mt-1 leading-tight">Fleet Deals Up To 30% Off</p>
                <span className="mt-4 inline-flex items-center justify-center gap-1.5 bg-white text-[#134E8D] rounded-xl px-4 py-2.5 text-[13px] font-bold group-hover:bg-[#9AC1EE] group-hover:text-[#222538] transition-all">
                  Browse Deals <ArrowRight size={14} />
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
