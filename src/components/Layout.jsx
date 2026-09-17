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
import { GearsOverlay } from "./GearsLoader.jsx";

const ROUTE_GEAR_MS = 2000;

// Transparent centred gears on top of the page for every route change.
function RouteGears() {
  const { pathname, search } = useLocation();
  const first = useRef(true);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (pathname.startsWith("/admin")) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), ROUTE_GEAR_MS);
    return () => clearTimeout(t);
  }, [pathname, search]);
  if (!show) return null;
  return <GearsOverlay />;
}

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
    <div className="min-h-screen bg-white text-[#12151C] antialiased overflow-x-clip flex flex-col" style={{ fontFamily: "Inter" }}>
      <ScrollProgress />
      <ScrollManager />
      <RouteGears />

      <Header onOpenMobile={() => setMobile(true)} />

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 min-h-[calc(100vh-6rem)]"
      >
        {children}
      </motion.main>

      {/* Newsletter strip */}
      <section className="bg-[#181C26] border-y border-white/10 print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-wrap items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
<<<<<<< HEAD
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-r from-[#EE6724] to-[#DE5718] text-white shrink-0 shadow-copper"><Mail size={22} /></span>
=======
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#0B2F5C] text-white shrink-0"><Mail size={22} /></span>
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
            <div>
              <p className="font-display font-bold text-xl text-white">Get fleet pricing and new arrivals</p>
              <p className="text-white/55 text-[13px] mt-0.5">Join the trade list. No spam, unsubscribe anytime.</p>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert("Thanks. You are on the trade list."); }} className="flex gap-2 flex-1 min-w-[280px] max-w-md">
<<<<<<< HEAD
            <input required type="email" placeholder="Work email" className="flex-1 rounded-xl px-4 py-3.5 bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-[#F57429] transition text-sm" />
            <button className="clip-cut bg-gradient-to-r from-[#EE6724] to-[#DE5718] text-white px-6 py-3.5 text-sm font-bold hover:from-[#DE5718] hover:to-[#B43808] transition shadow-sm">Subscribe</button>
=======
            <input required type="email" placeholder="Work email" className="flex-1 rounded-xl px-4 py-3.5 bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-[#2F5E93] transition text-sm" />
            <button className="clip-cut bg-[#0B2F5C] text-white px-6 py-3.5 text-sm font-bold hover:bg-white hover:text-[#0B2F5C] transition">Subscribe</button>
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#12151C] text-white print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-14 grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-sm">
          <div>
            <LogoFull imgClassName="h-14 sm:h-16 w-auto select-none object-contain" />
            <p className="text-white/60 text-[13px] mt-4 leading-relaxed">
              Australian owned truck hardware: tail lifts, tool boxes, trailer parts and accessories. Honest advice plus fast freight to every state.
            </p>
            <div className="mt-4 space-y-1.5 text-[12px] text-white/50">
<<<<<<< HEAD
              <p className="flex items-center gap-2"><MapPin size={13} className="text-[#F57429]" /> 41 Halley Court, Campbellfield VIC 3061</p>
              <p className="flex items-center gap-2"><Phone size={13} className="text-[#F57429]" /> 03 9000 0000</p>
              <p className="flex items-center gap-2"><Mail size={13} className="text-[#F57429]" /> sales@aurextruckparts.com.au</p>
=======
              <p className="flex items-center gap-2"><MapPin size={13} className="text-[#2F5E93]" /> 41 Halley Court, Campbellfield VIC 3061</p>
              <p className="flex items-center gap-2"><Phone size={13} className="text-[#2F5E93]" /> 03 9000 0000</p>
              <p className="flex items-center gap-2"><Mail size={13} className="text-[#2F5E93]" /> sales@aurextruckparts.com.au</p>
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/40 uppercase">Shop</p>
            <div className="mt-3 grid gap-2 text-white/65">
              <Link to="/shop" className="hover:text-white transition w-fit">All parts</Link>
              <Link to="/shop?cat=Tail%20Lifts" className="hover:text-white transition w-fit">Tail Lifts</Link>
              <Link to="/shop?cat=Tool%20Boxes" className="hover:text-white transition w-fit">Tool Boxes</Link>
              <Link to="/shop?cat=Trailer%20Parts" className="hover:text-white transition w-fit">Trailer Parts</Link>
              <Link to="/shop?cat=Accessories" className="hover:text-white transition w-fit">Accessories</Link>
              <Link to="/shop?cat=Replacement%20Parts" className="hover:text-white transition w-fit">Replacement Parts</Link>
              <Link to="/shop?cat=Tools%20and%20Others" className="hover:text-white transition w-fit">Tools and Others</Link>
              <Link to="/brands" className="hover:text-white transition w-fit">Brands</Link>
              <Link to="/deals" className="hover:text-white transition w-fit">Deals</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/40 uppercase">Support</p>
            <div className="mt-3 grid gap-2 text-white/65">
              <Link to="/resources" className="hover:text-white transition w-fit">Resources</Link>
              <Link to="/compliance" className="hover:text-white transition w-fit">ADR Compliance</Link>
              <Link to="/track" className="hover:text-white transition w-fit">Track order</Link>
              <Link to="/quote" className="hover:text-white transition w-fit">Quote cart</Link>
              <Link to="/checkout" className="hover:text-white transition w-fit">Checkout</Link>
              <Link to="/contact" className="hover:text-white transition w-fit">Contact</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/40 uppercase">Company</p>
            <div className="mt-3 grid gap-2 text-white/65">
              <Link to="/about" className="hover:text-white transition w-fit">About us</Link>
              <Link to="/partners" className="hover:text-white transition w-fit">Our Partners</Link>
              <Link to="/catalogue" className="hover:text-white transition w-fit">Catalogue</Link>
              <Link to="/locations" className="hover:text-white transition w-fit">Locations</Link>
              <Link to="/trade" className="hover:text-white transition w-fit">Trade accounts</Link>
              <Link to="/policies/shipping" className="hover:text-white transition w-fit">Shipping</Link>
              <Link to="/policies/returns" className="hover:text-white transition w-fit">Returns</Link>
              <Link to="/policies/warranty" className="hover:text-white transition w-fit">Warranty</Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-[12px] tracking-widest text-white/40 uppercase">Fleet Desk</p>
            <p className="mt-3 text-white/65">Mon to Fri, 8am to 5pm AEST</p>
            <p className="text-white/45 text-[13px] mt-1">Priority quotes for trade and fleet accounts.</p>
            <Link
              to="/contact"
<<<<<<< HEAD
              className="clip-cut mt-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#EE6724] to-[#DE5718] hover:from-[#DE5718] hover:to-[#B43808] text-white px-5 py-2.5 font-bold text-[13px] transition shadow-sm"
=======
              className="clip-cut mt-4 inline-flex items-center gap-1.5 bg-[#0B2F5C] text-white px-5 py-2.5 font-bold hover:bg-white hover:text-[#0B2F5C] text-[13px] transition"
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
            >
              Get a quote <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-4 py-4 text-[12px] text-white/35 flex flex-wrap justify-between gap-2">
            <span>&copy; 2026 Aurex Truck Parts Australia. All rights reserved.</span>
            <span>Visa, Mastercard, Afterpay, Bank transfer · Category imagery via Wikimedia Commons contributors (CC BY-SA)</span>
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
<<<<<<< HEAD
            className="fixed bottom-6 right-6 z-[60] w-12 h-12 grid place-items-center rounded-full bg-[#12151C] text-white shadow-elevated hover:bg-[#DE5718] transition"
=======
            className="fixed bottom-6 right-6 z-[60] w-12 h-12 grid place-items-center rounded-full bg-[#1A1A2E] text-white shadow-elevated hover:bg-[#0B2F5C] transition"
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
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
<<<<<<< HEAD
                <p className="font-bold text-lg text-[#12151C] flex items-center gap-2"><ShoppingCart size={18} className="text-[#DE5718]" /> Cart ({count})</p>
=======
                <p className="font-bold text-lg text-[#1A1A2E] flex items-center gap-2"><ShoppingCart size={18} className="text-[#0B2F5C]" /> Cart ({count})</p>
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
                <button onClick={() => setDrawer(false)} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]" aria-label="close">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-5 space-y-3">
                {cart.length === 0 && (
                  <div className="text-center py-16">
                    <ShoppingCart size={40} className="mx-auto text-[#E5E7EB]" />
                    <p className="text-[#9CA3AF] text-sm mt-3">Cart is empty. Add parts from Shop.</p>
<<<<<<< HEAD
                    <Link to="/shop" onClick={() => setDrawer(false)} className="clip-cut mt-4 inline-block bg-gradient-to-r from-[#EE6724] to-[#DE5718] text-white px-6 py-2.5 text-sm font-bold shadow-sm">Browse shop</Link>
=======
                    <Link to="/shop" onClick={() => setDrawer(false)} className="clip-cut mt-4 inline-block bg-[#0B2F5C] text-white px-6 py-2.5 text-sm font-bold">Browse shop</Link>
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
                  </div>
                )}
                {cart.map((i) => (
                  <div key={i.sku} className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3 flex gap-3">
                    <img src={i.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-white shrink-0" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#9CA3AF]">{i.sku}</p>
                      <p className="font-semibold text-[13px] leading-snug text-[#12151C] line-clamp-2">{i.name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCart((c) => c.map((x) => (x.sku === i.sku ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
<<<<<<< HEAD
                            className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#DE5718] transition"
=======
                            className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C] transition"
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
                          >
                            <Minus size={13} />
                          </button>
                          <span className="font-bold text-sm w-6 text-center text-[#12151C]">{i.qty}</span>
                          <button
                            onClick={() => setCart((c) => c.map((x) => (x.sku === i.sku ? { ...x, qty: x.qty + 1 } : x)))}
<<<<<<< HEAD
                            className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#DE5718] transition"
=======
                            className="w-7 h-7 grid place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C] transition"
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <p className="font-bold text-[#12151C] text-sm">${((i.price || 0) * i.qty).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-[#E5E7EB]">
                <div className="flex justify-between font-bold text-lg text-[#12151C]">
                  <span>Subtotal</span>
<<<<<<< HEAD
                  <span className="text-[#DE5718]">${total.toFixed(2)}</span>
=======
                  <span className="text-[#0B2F5C]">${total.toFixed(2)}</span>
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
                </div>
                <p className="mt-1 text-[12px] text-[#9CA3AF]">Free freight over ${freeOver}. Login saves order history.</p>
                <div className="mt-2.5">
                  <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
<<<<<<< HEAD
                    <div className="h-full bg-gradient-to-r from-[#DE5718] to-[#F59E0B] transition-all" style={{ width: `${Math.min(100, (total / freeOver) * 100)}%` }} />
=======
                    <div className="h-full bg-gradient-to-r from-[#0B2F5C] to-[#FFBB00] transition-all" style={{ width: `${Math.min(100, (total / freeOver) * 100)}%` }} />
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold text-[#6B7280]">{total >= freeOver ? "Free freight unlocked." : `$${(freeOver - total).toFixed(2)} away from free freight.`}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link
                    to="/quote"
                    onClick={() => setDrawer(false)}
<<<<<<< HEAD
                    className="clip-cut-sm py-3 text-sm font-bold border-2 border-[#E5E7EB] text-center text-[#12151C] hover:border-[#DE5718] transition"
=======
                    className="clip-cut-sm py-3 text-sm font-bold border-2 border-[#E5E7EB] text-center text-[#1A1A2E] hover:border-[#0B2F5C] transition"
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
                  >
                    Quote
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setDrawer(false)}
<<<<<<< HEAD
                    className="clip-cut-sm col-span-2 py-3 text-sm font-bold bg-gradient-to-r from-[#EE6724] to-[#DE5718] hover:from-[#DE5718] hover:to-[#B43808] text-white text-center flex items-center justify-center gap-2 shadow-sm transition"
=======
                    className="clip-cut-sm col-span-2 py-3 text-sm font-bold bg-[#0B2F5C] text-white text-center flex items-center justify-center gap-2 hover:bg-[#1A1A2E] transition"
>>>>>>> b1fa46e (feat: rebuild to 36-line approved catalogue with navy theme, Sunrise pricing and gears loader)
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

