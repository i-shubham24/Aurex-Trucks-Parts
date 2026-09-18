import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Minus, Plus, Send, ArrowRight, MapPin, ArrowUp, Mail, Phone, X } from "lucide-react";
import { useShop } from "../store/shop.jsx";
import { useSite } from "../store/site.jsx";
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
    <div className="px-6 sm:px-10 pt-10 flex flex-wrap items-center gap-6 justify-between">
      <div className="flex items-center gap-4">
        <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#0B2F5C] text-white shrink-0"><Mail size={22} /></span>
        <div>
          <p className="font-display font-bold text-xl text-white">Get fleet pricing and new arrivals</p>
          <p className="text-white/80 text-[13px] mt-0.5">Join the trade list. No spam, unsubscribe anytime.</p>
        </div>
      </div>
      {done ? (
        <p className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-sm font-semibold px-5 py-3.5">Thanks. You are on the trade list.</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setDone(true); }} className="flex flex-col sm:flex-row gap-2 flex-1 min-w-[200px] w-full sm:w-auto sm:max-w-md">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" className="flex-1 rounded-xl px-4 py-3.5 bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-[#8FB4E0] transition text-sm min-w-0" />
          <button className="clip-cut bg-[#0B2F5C] text-white px-6 py-3.5 text-sm font-bold hover:bg-white hover:text-[#0B2F5C] transition whitespace-nowrap">Subscribe</button>
        </form>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { cart, setCart, count, total, drawer, setDrawer } = useShop();
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
    <div className="min-h-screen bg-white text-[#1A1A2E] antialiased overflow-x-hidden flex flex-col" style={{ fontFamily: "Inter" }}>
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

      {/* Footer: floating modular card (square corners, bottom-left cut) */}
      <div className="bg-[#EAF2FA] print:hidden px-3 sm:px-5 pb-8 pt-4 [filter:drop-shadow(0_30px_45px_rgba(11,47,92,0.22))]">
        <footer className="mx-auto max-w-7xl bg-[#1A1A2E] text-white overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 34px 100%, 0 calc(100% - 34px))" }}>
          <NewsBox />
          <div aria-hidden className="mx-6 sm:mx-10 mt-10 border-t border-white/10" />
          <div className="px-6 sm:px-10 pt-10 grid sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr] gap-10 text-sm lg:divide-x lg:divide-white/10">
          <div className="lg:pr-8">
            <LogoFull light />
            <p className="text-white/75 text-[13px] mt-4 leading-relaxed">
              Australian owned truck hardware: tail lifts, tool boxes, trailer parts and accessories. Honest advice plus fast freight to every state.
            </p>
            <div className="mt-4 space-y-2 text-[12px] text-white/70">
              <p className="flex items-center gap-2"><MapPin size={13} className="text-[#8FB4E0]" /> 41 Halley Court, Campbellfield VIC 3061</p>
              <p className="flex items-center gap-2"><Phone size={13} className="text-[#8FB4E0]" /> 03 9000 0000</p>
              <p className="flex items-center gap-2"><Mail size={13} className="text-[#8FB4E0]" /> sales@aurextruckparts.com.au</p>
            </div>
            <div className="mt-5 flex gap-2">
              {[["Instagram", "IG"], ["Facebook", "FB"], ["LinkedIn", "IN"]].map(([label, short]) => (
                <a key={label} href="/contact" aria-label={label} className="grid place-items-center w-9 h-9 border border-white/20 text-white/70 text-[11px] font-black hover:bg-white hover:text-[#0B2F5C] hover:border-white transition" style={{ clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)" }}>
                  {short}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/45 uppercase">Shop</p>
            <div className="mt-4 grid gap-2.5 text-white/75">
              <Link to="/shop" className="hover:text-white hover:translate-x-1 transition-all w-fit">All parts</Link>
              <Link to="/shop?cat=Tail%20Lifts" className="hover:text-white hover:translate-x-1 transition-all w-fit">Tail Lifts</Link>
              <Link to="/shop?cat=Tool%20Boxes" className="hover:text-white hover:translate-x-1 transition-all w-fit">Tool Boxes</Link>
              <Link to="/shop?cat=Trailer%20Parts" className="hover:text-white hover:translate-x-1 transition-all w-fit">Trailer Parts</Link>
              <Link to="/shop?cat=Accessories" className="hover:text-white hover:translate-x-1 transition-all w-fit">Accessories</Link>
              <Link to="/shop?cat=Replacement%20Parts" className="hover:text-white hover:translate-x-1 transition-all w-fit">Replacement Parts</Link>
              <Link to="/shop?cat=Tools%20and%20Others" className="hover:text-white hover:translate-x-1 transition-all w-fit">Tools and Others</Link>
              <Link to="/brands" className="hover:text-white hover:translate-x-1 transition-all w-fit">Brands</Link>
              <Link to="/deals" className="hover:text-white hover:translate-x-1 transition-all w-fit">Deals</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/45 uppercase">Support</p>
            <div className="mt-4 grid gap-2.5 text-white/75">
              <Link to="/resources" className="hover:text-white hover:translate-x-1 transition-all w-fit">Resources</Link>
              <Link to="/compliance" className="hover:text-white hover:translate-x-1 transition-all w-fit">ADR Compliance</Link>
              <Link to="/track" className="hover:text-white hover:translate-x-1 transition-all w-fit">Track order</Link>
              <Link to="/quote" className="hover:text-white hover:translate-x-1 transition-all w-fit">Quote cart</Link>
              <Link to="/checkout" className="hover:text-white hover:translate-x-1 transition-all w-fit">Checkout</Link>
              <Link to="/contact" className="hover:text-white hover:translate-x-1 transition-all w-fit">Contact</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/45 uppercase">Company</p>
            <div className="mt-4 grid gap-2.5 text-white/75">
              <Link to="/about" className="hover:text-white hover:translate-x-1 transition-all w-fit">About us</Link>
              <Link to="/partners" className="hover:text-white hover:translate-x-1 transition-all w-fit">Our Partners</Link>
              <Link to="/catalogue" className="hover:text-white hover:translate-x-1 transition-all w-fit">Catalogue</Link>
              <Link to="/locations" className="hover:text-white hover:translate-x-1 transition-all w-fit">Locations</Link>
              <Link to="/trade" className="hover:text-white hover:translate-x-1 transition-all w-fit">Trade accounts</Link>
              <Link to="/policies/shipping" className="hover:text-white hover:translate-x-1 transition-all w-fit">Shipping</Link>
              <Link to="/policies/returns" className="hover:text-white hover:translate-x-1 transition-all w-fit">Returns</Link>
              <Link to="/policies/warranty" className="hover:text-white hover:translate-x-1 transition-all w-fit">Warranty</Link>
            </div>
          </div>
          <div className="bg-white/[0.04] border border-white/10 p-6 h-fit" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,14px 100%,0 calc(100% - 14px))" }}>
            <p className="font-display font-bold text-[16px]">Fleet Desk</p>
            <p className="mt-1 text-white/75 text-[13px]">Mon to Fri, 8am to 5pm AEST</p>
            <p className="text-white/75 text-[13px] mt-1">Priority quotes for trade and fleet accounts.</p>
            <Link
              to="/contact"
              className="clip-cut mt-4 inline-flex items-center gap-1.5 bg-[#0B2F5C] text-white px-5 py-2.5 font-bold hover:bg-white hover:text-[#0B2F5C] text-[13px] transition"
            >
              Get a quote <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div aria-hidden className="mx-6 sm:mx-10 mt-10 border-t border-white/10" />
        <div className="px-6 sm:px-10 relative">
          <p className="py-4 text-[12px] text-white/50 flex flex-wrap justify-between gap-2">
            <span>&copy; 2026 Aurex Truck Parts Australia. All rights reserved.</span>
            <span>Visa, Mastercard, Afterpay, Bank transfer · Category imagery via Wikimedia Commons contributors (CC BY-SA)</span>
          </p>
        </div>
        </footer>
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {top && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-[60] w-12 h-12 grid place-items-center bg-[#1A1A2E] text-white shadow-elevated hover:bg-[#0B2F5C] transition" style={{ clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)" }}
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
                <p className="font-bold text-lg text-[#1A1A2E] flex items-center gap-2"><ShoppingCart size={18} className="text-[#0B2F5C]" /> Cart ({count})</p>
                <button onClick={() => setDrawer(false)} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]" aria-label="close">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-5 space-y-3">
                {cart.length === 0 && (
                  <div className="text-center py-16">
                    <ShoppingCart size={40} className="mx-auto text-[#E5E7EB]" />
                    <p className="text-[#9CA3AF] text-sm mt-3">Cart is empty. Add parts from Shop.</p>
                    <Link to="/shop" onClick={() => setDrawer(false)} className="clip-cut mt-4 inline-block bg-[#0B2F5C] text-white px-6 py-2.5 text-sm font-bold">Browse shop</Link>
                  </div>
                )}
                {cart.map((i) => (
                  <div key={i.sku} className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3 flex gap-3">
                    <img src={i.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-white shrink-0" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#9CA3AF]">{i.sku}</p>
                      <p className="font-semibold text-[13px] leading-snug text-[#1A1A2E] line-clamp-2">{i.name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCart((c) => c.map((x) => (x.sku === i.sku ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
                            className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C] transition"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="font-bold text-sm w-6 text-center text-[#1A1A2E]">{i.qty}</span>
                          <button
                            onClick={() => setCart((c) => c.map((x) => (x.sku === i.sku ? { ...x, qty: x.qty + 1 } : x)))}
                            className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C] transition"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <p className="font-bold text-[#1A1A2E] text-sm">${((i.price || 0) * i.qty).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-[#E5E7EB]">
                <div className="flex justify-between font-bold text-lg text-[#1A1A2E]">
                  <span>Subtotal</span>
                  <span className="text-[#0B2F5C]">${total.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-[12px] text-[#9CA3AF]">Free freight over ${freeOver}. Login saves order history.</p>
                <div className="mt-2.5">
                  <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0B2F5C] to-[#FFBB00] transition-all" style={{ width: `${Math.min(100, (total / freeOver) * 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold text-[#6B7280]">{total >= freeOver ? "Free freight unlocked." : `$${(freeOver - total).toFixed(2)} away from free freight.`}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link
                    to="/quote"
                    onClick={() => setDrawer(false)}
                    className="clip-cut-sm py-3 text-sm font-bold border-2 border-[#E5E7EB] text-center text-[#1A1A2E] hover:border-[#0B2F5C] transition"
                  >
                    Quote
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setDrawer(false)}
                    className="clip-cut-sm col-span-2 py-3 text-sm font-bold bg-[#0B2F5C] text-white text-center flex items-center justify-center gap-2 hover:bg-[#1A1A2E] transition"
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

