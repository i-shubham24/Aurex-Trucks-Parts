import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ShoppingCart, Phone, Minus, Plus, Send, ArrowRight, User, MapPin, ArrowUp, Mail, X } from "lucide-react";
import { useShop } from "../store/shop.jsx";
import { useAuth } from "../store/auth.jsx";
import { useSite } from "../store/site.jsx";
import { LogoFull } from "./logo.jsx";
import { ScrollProgress } from "./ui.jsx";
import { ShopWidgets } from "./shopwise.jsx";
import YMMWidget from "./garage/YMMWidget.jsx";
import MegaMenu from "./navigation/MegaMenu.jsx";
import MobileDrawer from "./navigation/MobileDrawer.jsx";
import SearchBar from "./navigation/SearchBar.jsx";

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }, [pathname]);
  return null;
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { cart, setCart, count, total, drawer, setDrawer } = useShop();
  const { user } = useAuth();
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [top, setTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setTop(window.scrollY > 700);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1A1A2E] antialiased overflow-x-hidden flex flex-col" style={{ fontFamily: "Inter" }}>
      <ScrollProgress />
      <ScrollManager />

      {/* Top utility bar */}
      <div className="bg-[#E53E00] text-white text-[12px] font-semibold relative z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-4">
          <p className="truncate text-white/90 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Free freight over $500. Dispatch in 1 to 2 days Australia wide.
          </p>
          <div className="ml-auto hidden md:flex gap-5 shrink-0 text-white/80">
            <Link to="/track" className="hover:text-white transition">Track My Order</Link>
            <Link to="/quote" className="hover:text-white transition">Quote Cart</Link>
            <Link to={user ? "/account" : "/login"} className="hover:text-white transition">
              {user ? user.name.split(" ")[0] + " Account" : "Login / Signup"}
            </Link>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5 text-white"><Phone size={12} /> 03 9000 0000</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E5E7EB] shadow-sm">
        <div className={`mx-auto max-w-7xl px-4 flex items-center gap-4 transition-all duration-300 ${scrolled ? "py-2" : "py-3.5"}`}>
          <button onClick={() => setMobile(true)} className="lg:hidden p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#1A1A2E] transition" aria-label="menu">
            <Menu size={20} />
          </button>
          <Link to="/" aria-label="Aurex Truck Parts home">
            <LogoFull />
          </Link>

          <div className="hidden md:flex flex-1 max-w-lg ml-6">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:block"><YMMWidget variant="pill" /></div>
            <a href="tel:0390000000" className="hidden xl:flex items-center gap-2 text-[13px] font-semibold text-[#6B7280] hover:text-[#E53E00] transition">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-[#FFF0EB] text-[#E53E00]"><Phone size={15} /></span>
              <span className="leading-tight"><span className="block text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wide">Parts desk</span>03 9000 0000</span>
            </a>
            <Link
              to={user ? "/account" : "/login"}
              className="p-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#E53E00] hover:border-[#E53E00] transition"
              title="Account"
            >
              <User size={17} />
            </Link>
            <button
              onClick={() => setDrawer(true)}
              className="relative flex items-center gap-2 bg-[#E53E00] text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#C23400] active:scale-95 transition"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-[#1A1A2E] text-white text-[11px] font-black">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation + mega menu */}
        <MegaMenu />
      </header>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1"
      >
        {children}
      </motion.main>

      {/* Newsletter strip */}
      <section className="bg-[#16213E]">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-wrap items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#E53E00] text-white shrink-0"><Mail size={22} /></span>
            <div>
              <p className="font-display font-bold text-xl text-white">Get fleet pricing and new arrivals</p>
              <p className="text-white/55 text-[13px] mt-0.5">Join the trade list. No spam, unsubscribe anytime.</p>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert("Thanks. You are on the trade list."); }} className="flex gap-2 flex-1 min-w-[280px] max-w-md">
            <input required type="email" placeholder="Work email" className="flex-1 rounded-xl px-4 py-3.5 bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-[#FF6B35] transition text-sm" />
            <button className="bg-[#E53E00] text-white rounded-xl px-6 py-3.5 text-sm font-bold hover:bg-[#C23400] transition">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A2E] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <LogoFull light />
            <p className="text-white/60 text-[13px] mt-4 leading-relaxed">
              Australian owned heavy truck and trailer parts. Honest advice plus fast freight to every state.
            </p>
            <div className="mt-4 space-y-1.5 text-[12px] text-white/50">
              <p className="flex items-center gap-2"><MapPin size={13} className="text-[#FF6B35]" /> 41 Halley Court, Campbellfield VIC 3061</p>
              <p className="flex items-center gap-2"><Phone size={13} className="text-[#FF6B35]" /> 03 9000 0000</p>
              <p className="flex items-center gap-2"><Mail size={13} className="text-[#FF6B35]" /> sales@aurextruckparts.com.au</p>
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/40 uppercase">Shop</p>
            <div className="mt-3 grid gap-2 text-white/65">
              <Link to="/shop" className="hover:text-[#FF6B35] transition w-fit">All parts</Link>
              <Link to="/categories" className="hover:text-[#FF6B35] transition w-fit">Categories</Link>
              <Link to="/brands" className="hover:text-[#FF6B35] transition w-fit">Brands</Link>
              <Link to="/deals" className="hover:text-[#FF6B35] transition w-fit">Deals</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/40 uppercase">Support</p>
            <div className="mt-3 grid gap-2 text-white/65">
              <Link to="/resources" className="hover:text-[#FF6B35] transition w-fit">Guides</Link>
              <Link to="/compliance" className="hover:text-[#FF6B35] transition w-fit">ADR Compliance</Link>
              <Link to="/track" className="hover:text-[#FF6B35] transition w-fit">Track order</Link>
              <Link to="/quote" className="hover:text-[#FF6B35] transition w-fit">Quote cart</Link>
              <Link to="/checkout" className="hover:text-[#FF6B35] transition w-fit">Checkout</Link>
              <Link to="/contact" className="hover:text-[#FF6B35] transition w-fit">Contact</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/40 uppercase">Fleet Desk</p>
            <p className="mt-3 text-white/65">Mon to Fri, 8am to 5pm AEST</p>
            <p className="text-white/45 text-[13px] mt-1">Priority quotes for trade and fleet accounts.</p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-1.5 bg-[#E53E00] text-white rounded-lg px-5 py-2.5 font-bold hover:bg-[#C23400] text-[13px] transition"
            >
              Get a quote <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-4 py-4 text-[12px] text-white/35 flex flex-wrap justify-between gap-2">
            <span>&copy; 2026 Aurex Truck Parts Australia. All rights reserved.</span>
            <span>Visa · Mastercard · Afterpay · Bank transfer</span>
          </p>
        </div>
      </footer>

      {/* Back to top */}
      <AnimatePresence>
        {top && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-[60] w-12 h-12 grid place-items-center rounded-full bg-[#1A1A2E] text-white shadow-elevated hover:bg-[#E53E00] transition"
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
              <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB]">
                <p className="font-bold text-lg text-[#1A1A2E] flex items-center gap-2"><ShoppingCart size={18} className="text-[#E53E00]" /> Cart ({count})</p>
                <button onClick={() => setDrawer(false)} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]" aria-label="close">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-5 space-y-3">
                {cart.length === 0 && (
                  <div className="text-center py-16">
                    <ShoppingCart size={40} className="mx-auto text-[#E5E7EB]" />
                    <p className="text-[#9CA3AF] text-sm mt-3">Cart is empty. Add parts from Shop.</p>
                    <Link to="/shop" onClick={() => setDrawer(false)} className="mt-4 inline-block bg-[#E53E00] text-white rounded-lg px-6 py-2.5 text-sm font-bold">Browse shop</Link>
                  </div>
                )}
                {cart.map((i) => (
                  <div key={i.sku} className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3 flex gap-3">
                    <img src={i.product?.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-white shrink-0" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#9CA3AF]">{i.sku}</p>
                      <p className="font-semibold text-[13px] leading-snug text-[#1A1A2E] line-clamp-2">{i.product?.name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCart((c) => c.map((x) => (x.sku === i.sku ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
                            className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#E53E00] transition"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="font-bold text-sm w-6 text-center text-[#1A1A2E]">{i.qty}</span>
                          <button
                            onClick={() => setCart((c) => c.map((x) => (x.sku === i.sku ? { ...x, qty: x.qty + 1 } : x)))}
                            className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#E53E00] transition"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <p className="font-bold text-[#1A1A2E] text-sm">${((i.product?.price || 0) * i.qty).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-[#E5E7EB]">
                <div className="flex justify-between font-bold text-lg text-[#1A1A2E]">
                  <span>Subtotal</span>
                  <span className="text-[#E53E00]">${total.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-[12px] text-[#9CA3AF]">Free freight over $500. Login saves order history.</p>
                <div className="mt-2.5">
                  <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#E53E00] to-[#FFBB00] transition-all" style={{ width: `${Math.min(100, (total / 500) * 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold text-[#6B7280]">{total >= 500 ? "Free freight unlocked." : `$${(500 - total).toFixed(2)} away from free freight.`}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link
                    to="/quote"
                    onClick={() => setDrawer(false)}
                    className="rounded-lg py-3 text-sm font-bold border border-[#E5E7EB] text-center text-[#1A1A2E] hover:border-[#E53E00] transition"
                  >
                    Quote
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setDrawer(false)}
                    className="col-span-2 rounded-lg py-3 text-sm font-bold bg-[#E53E00] text-white text-center flex items-center justify-center gap-2 hover:bg-[#C23400] transition"
                  >
                    <Send size={14} /> Checkout
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <ShopWidgets />
    </div>
  );
}

