import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Minus, Plus, Send, ArrowRight, MapPin, ArrowUp, Mail, Phone, X, CheckCircle2 } from "lucide-react";
import { useShop } from "../store/shop.jsx";
import { useSite } from "../store/site.jsx";
import { useGarage } from "./garage/GarageContext.jsx";
import { LogoFull } from "./logo.jsx";
import { ScrollProgress, FocusTrap } from "./ui.jsx";
import { ShopWidgets } from "./shopwise.jsx";
import EmailPopup from "./EmailPopup.jsx";
import Header from "./layout/Header.jsx";
import MobileDrawer from "./navigation/MobileDrawer.jsx";

function ScrollManager() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }, [pathname, search]);
  return null;
}

function NewsBox() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#134E8D] via-[#1D2B4E] to-[#134E8D] text-white px-6 sm:px-12 py-10">
      {/* Background overlay graphic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-6 h-[3px] bg-[#9AC1EE] rounded-full inline-block" />
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#9AC1EE]">Our Newsletter</span>
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-[34px] leading-tight text-white">
            Get Regular Update Please <br className="hidden sm:inline" />
            Subscribe Newsletter
          </h3>
        </div>

        <div className="w-full lg:w-auto flex-1 max-w-xl">
          {done ? (
            <div className="bg-white/15 border border-white/30 rounded-xl px-6 py-4 text-white text-center font-bold text-sm">
              ✓ Thank you! You are now subscribed to regular updates.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setDone(true);
              }}
              className="flex items-center bg-white rounded-xl p-1.5 shadow-2xl w-full"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                className="flex-1 px-4 py-3 text-sm text-[#222538] placeholder-[#9CA3AF] bg-transparent outline-none min-w-0 font-medium"
              />
              <button
                type="submit"
                className="bg-[#134E8D] hover:bg-[#0E3B6C] text-white font-bold text-sm px-6 sm:px-8 py-3.5 rounded-lg flex items-center gap-2 transition shrink-0 shadow-md"
              >
                <span>Subscribe</span>
                <Send size={14} className="-rotate-12" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const GALLERY_IMAGES = [
  { url: "/images/products/TL-20-2450-2400.jpg", title: "Hydraulic Tail Lift 2000kg", to: "/shop?cat=Tail%20Lifts" },
  { url: "/images/products/PU-12V-22KW.jpg", title: "12V 2.2kW Power Unit", to: "/shop?cat=Tail%20Lifts" },
  { url: "/images/products/GL-25126.jpg", title: "Steel Tool Box & Latches", to: "/shop?cat=Tool%20Boxes" },
  { url: "/images/products/GL-11113.jpg", title: "Rear Door Locking Gear", to: "/shop?cat=Trailer%20Parts" },
  { url: "/images/products/GL-13112.jpg", title: "Heavy Duty Door Hinges", to: "/shop?cat=Trailer%20Parts" },
  { url: "/images/products/GL-19120.jpg", title: "Spring Bolt Hardware", to: "/shop?cat=Accessories" }
];

function Footer() {
  return (
    <footer className="bg-[#181C2E] text-white">
      {/* Top Newsletter Bar */}
      <NewsBox />

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-12 pb-14">
        {/* Brand & Social Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div className="max-w-xl">
            <LogoFull light />
            <p className="mt-3 text-[#9CA3AF] text-[13.5px] leading-relaxed">
              Australian owned truck hardware & heavy vehicle parts: tail lifts, toolboxes, trailer hardware and ADR-compliant spares. Engineered for heavy haulage and fleet reliability across Australia.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {[
              { name: "Facebook", href: "#", icon: "f" },
              { name: "Twitter", href: "#", icon: "𝕏" },
              { name: "LinkedIn", href: "#", icon: "in" },
              { name: "YouTube", href: "#", icon: "▶" },
              { name: "Instagram", href: "#", icon: "📷" }
            ].map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                className="w-10 h-10 rounded-full bg-[#134E8D] text-white flex items-center justify-center font-bold text-sm hover:bg-white hover:text-[#134E8D] transition shadow-md hover:scale-105"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Useful Links */}
          <div>
            <h4 className="font-display font-bold text-[17px] text-white tracking-wide">Useful Links</h4>
            <div className="flex items-center gap-1.5 mt-2 mb-5">
              <span className="w-3 h-[3px] bg-[#134E8D] rounded-full" />
              <span className="w-7 h-[3px] bg-[#3B82F6] rounded-full" />
            </div>
            <ul className="space-y-3 text-[14px]">
              {[
                { label: "Home", to: "/" },
                { label: "About Us", to: "/about" },
                { label: "Fleet & Trade", to: "/trade" },
                { label: "All Products", to: "/shop" },
                { label: "Fitting Guides", to: "/resources" },
                { label: "Contact Us", to: "/contact" }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition"
                  >
                    <span className="text-[#3B82F6] font-bold group-hover:translate-x-1 transition-transform">»</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h4 className="font-display font-bold text-[17px] text-white tracking-wide">Popular Categories</h4>
            <div className="flex items-center gap-1.5 mt-2 mb-5">
              <span className="w-3 h-[3px] bg-[#134E8D] rounded-full" />
              <span className="w-7 h-[3px] bg-[#3B82F6] rounded-full" />
            </div>
            <ul className="space-y-3 text-[14px]">
              {[
                { label: "Hydraulic Tail Lifts", to: "/shop?cat=Tail%20Lifts" },
                { label: "Truck Tool Boxes", to: "/shop?cat=Tool%20Boxes" },
                { label: "Trailer Hardware", to: "/shop?cat=Trailer%20Parts" },
                { label: "Replacement Parts", to: "/shop?cat=Replacement%20Parts" },
                { label: "Cargo & Accessories", to: "/shop?cat=Accessories" },
                { label: "Locks & Fasteners", to: "/shop?cat=Trailer%20Parts" }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition"
                  >
                    <span className="text-[#3B82F6] font-bold group-hover:translate-x-1 transition-transform">»</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="font-display font-bold text-[17px] text-white tracking-wide">Contact Info</h4>
            <div className="flex items-center gap-1.5 mt-2 mb-5">
              <span className="w-3 h-[3px] bg-[#134E8D] rounded-full" />
              <span className="w-7 h-[3px] bg-[#3B82F6] rounded-full" />
            </div>
            <div className="space-y-4 text-[13.5px]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#134E8D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Phone size={15} />
                </div>
                <div>
                  <p className="text-white font-bold text-[14px]">1300 0 AUREX</p>
                  <p className="text-[#9CA3AF] text-xs mt-0.5">+61 3 9000 0000</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#134E8D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Mail size={15} />
                </div>
                <div>
                  <a href="mailto:sales@aurextruckparts.com.au" className="text-slate-300 hover:text-white transition break-all">
                    sales@aurextruckparts.com.au
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#134E8D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <MapPin size={15} />
                </div>
                <div>
                  <p className="text-slate-300 leading-snug">
                    41 Halley Court, Campbellfield VIC 3061, Melbourne
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Parts Gallery */}
          <div>
            <h4 className="font-display font-bold text-[17px] text-white tracking-wide">Parts Gallery</h4>
            <div className="flex items-center gap-1.5 mt-2 mb-5">
              <span className="w-3 h-[3px] bg-[#134E8D] rounded-full" />
              <span className="w-7 h-[3px] bg-[#3B82F6] rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GALLERY_IMAGES.map((img, idx) => (
                <Link
                  key={idx}
                  to={img.to}
                  title={img.title}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-white p-1 border border-white/20 hover:border-[#3B82F6] transition shadow-sm block"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#134E8D]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                    <span className="text-white text-[10px] font-bold leading-tight line-clamp-2">{img.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#134E8D] py-4 px-6 text-center text-[13px] text-white/95 font-medium border-t border-white/10">
        <p>&copy; Copyright 2026 Aurex Truck Parts AU. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { cart, setCart, count, total, drawer, setDrawer } = useShop();
  const { selectedVehicle, hasValidVehicle } = useGarage();
  const rigLabel = hasValidVehicle
    ? `${selectedVehicle.year ? selectedVehicle.year + " " : ""}${selectedVehicle.make} ${selectedVehicle.model}`.trim()
    : "";
  const { settings } = useSite();
  const freeOver = settings.freeFreightOver;
  const [mobile, setMobile] = useState(false);
  const [top, setTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobile || drawer) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobile, drawer]);

  return (
    <div className="min-h-screen bg-white text-[#222538] antialiased overflow-x-clip flex flex-col" style={{ fontFamily: "Inter" }}>
      <ScrollProgress />
      <ScrollManager />

      <div className="print:hidden">
        <Header onOpenMobile={() => setMobile(true)} />
      </div>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 min-h-[calc(100vh-6rem)]"
      >
        {children}
      </motion.main>

      {/* Footer component */}
      <div className="print:hidden">
        <Footer />
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {top && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-[60] w-12 h-12 grid place-items-center bg-[#222538] text-white shadow-elevated hover:bg-[#134E8D] transition rounded-full"
            aria-label="back to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <MobileDrawer open={mobile} onClose={() => setMobile(false)} />

      {/* Cart drawer */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[70]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/45" onClick={() => setDrawer(false)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-white border-l border-[#E5E7EB] flex flex-col"
            >
              <FocusTrap active={drawer} className="flex-1 flex flex-col min-h-0">
                <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB]">
                  <p className="font-bold text-lg text-[#222538] flex items-center gap-2"><ShoppingCart size={18} className="text-[#134E8D]" /> Cart ({count})</p>
                  <button onClick={() => setDrawer(false)} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]" aria-label="close">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-5 space-y-3">
                  {hasValidVehicle && cart.length > 0 && (
                    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-3.5 py-3">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <p className="text-[12.5px] font-semibold text-emerald-800 leading-snug">
                        Fit checked for your <b>{rigLabel}</b> — every line in this cart suits your rig.
                      </p>
                    </div>
                  )}
                  {cart.length === 0 && (
                    <div className="text-center py-16">
                      <ShoppingCart size={40} className="mx-auto text-[#E5E7EB]" />
                      <p className="text-[#9CA3AF] text-sm mt-3">Cart is empty. Add parts from Shop.</p>
                      <Link to="/shop" onClick={() => setDrawer(false)} className="rounded-xl mt-4 inline-block bg-[#134E8D] text-white px-6 py-2.5 text-sm font-bold">Browse shop</Link>
                    </div>
                  )}
                  {cart.map((i) => (
                    <div key={i.sku} className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3 flex gap-3">
                      <img src={i.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-white shrink-0" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#9CA3AF]">{i.sku}</p>
                        <p className="font-semibold text-[13px] leading-snug text-[#222538] line-clamp-2">{i.name}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setCart((c) => c.map((x) => (x.sku === i.sku ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
                              className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#134E8D] transition"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="font-bold text-sm w-6 text-center text-[#222538]">{i.qty}</span>
                            <button
                              onClick={() => setCart((c) => c.map((x) => (x.sku === i.sku ? { ...x, qty: x.qty + 1 } : x)))}
                              className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#134E8D] transition"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <p className="font-bold text-[#222538] text-sm">${((i.price || 0) * i.qty).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t border-[#E5E7EB]">
                  <div className="flex justify-between font-bold text-lg text-[#222538]">
                    <span>Subtotal</span>
                    <span className="text-[#134E8D]">${total.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#9CA3AF]">Free freight over ${freeOver}. Login saves order history.</p>
                  <div className="mt-2.5">
                    <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#134E8D] to-[#FFBB00] transition-all" style={{ width: `${Math.min(100, (total / freeOver) * 100)}%` }} />
                    </div>
                    <p className="mt-1.5 text-[12px] font-semibold text-[#6B7280]">{total >= freeOver ? "Free freight unlocked." : `$${(freeOver - total).toFixed(2)} away from free freight.`}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Link
                      to="/quote"
                      onClick={() => setDrawer(false)}
                      className="rounded-xl py-3 text-sm font-bold border-2 border-[#E5E7EB] text-center text-[#222538] hover:border-[#134E8D] transition"
                    >
                      Quote
                    </Link>
                    <Link
                      to="/checkout"
                      onClick={() => setDrawer(false)}
                      className="rounded-xl col-span-2 py-3 text-sm font-bold bg-[#134E8D] text-white text-center flex items-center justify-center gap-2 hover:bg-[#222538] transition"
                    >
                      <Send size={14} /> Checkout
                    </Link>
                  </div>
                </div>
              </FocusTrap>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <ShopWidgets />
      <EmailPopup />
    </div>
  );
}

