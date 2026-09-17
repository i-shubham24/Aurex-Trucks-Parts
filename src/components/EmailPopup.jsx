import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";
import { HERO } from "../data/catalog.js";

const KEY = "aurex_popup_seen_v2";
const EASE = [0.16, 1, 0.3, 1];

export default function EmailPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(KEY) === "1"; } catch { /* noop */ }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 5500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(KEY, "1"); } catch { /* noop */ }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    try { localStorage.setItem(KEY, "1"); } catch { /* noop */ }
    setTimeout(() => setOpen(false), 1600);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative w-full max-w-3xl grid sm:grid-cols-2 overflow-hidden bg-[#12121B] shadow-elevated"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}
          >
            <button onClick={close} className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-black/40 text-white hover:bg-black/70 transition" aria-label="close">
              <X size={17} />
            </button>

            {/* Image side */}
            <div className="relative hidden sm:block">
              <img src={HERO.secondary} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12121B] via-[#12121B]/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#12121B]" />
            </div>

            {/* Copy side */}
            <div className="relative p-7 sm:p-9">
              <p className="text-[11px] font-black tracking-[0.25em] text-[#2F5E93] uppercase">Join the trade list</p>
              <h2 className="font-display font-black text-white text-[30px] sm:text-[36px] leading-[0.98] mt-2">
                GET FLEET<br />DEALS FIRST
              </h2>
              {done ? (
                <div className="mt-5 flex items-center gap-2 text-[#10B981] font-bold">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-[#10B981]/15"><Check size={18} /></span>
                  You are on the list. Watch your inbox.
                </div>
              ) : (
                <>
                  <p className="text-white/55 text-[14px] mt-3 leading-relaxed">
                    New stock, weekly specials and fitment tips for Australian truck and trailer fleets. No spam, unsubscribe anytime.
                  </p>
                  <form onSubmit={submit} className="mt-6 space-y-2.5">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your work email"
                      className="w-full bg-white/[0.06] border-2 border-white/12 rounded-md px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#2F5E93] transition"
                    />
                    <button className="w-full bg-[#0B2F5C] hover:bg-white hover:text-[#0B2F5C] text-white py-3.5 text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 transition" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
                      Sign me up <ArrowRight size={16} />
                    </button>
                  </form>
                  <button onClick={close} className="mt-3 text-white/40 hover:text-white/70 text-[12px] font-semibold transition">No thanks, I will pay full price</button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
