import { useEffect, useState } from "react";
import { Check, Gift, X } from "lucide-react";
import { useSite } from "../store/site";
import useLockBody from "../utils/useLockBody";

const KEY = "aurex_popup_seen_v2";

export default function PromoPopup() {
  const { promos } = useSite();
  const active = [...promos].filter((p) => p.active).sort((a, b) => b.pct - a.pct)[0] || { code: "WELCOME10", pct: 10 };
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  useLockBody(show);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(KEY) === "1"; } catch { /* private mode */ }
    if (seen) return;
    const id = setTimeout(() => setShow(true), 5500);
    return () => clearTimeout(id);
  }, []);

  const close = () => {
    setShow(false);
    try { localStorage.setItem(KEY, "1"); } catch { /* private mode */ }
  };
  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    try { localStorage.setItem(KEY, "1"); } catch { /* private mode */ }
    setTimeout(() => setShow(false), 1600);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={close} />
      <div className="popup-in relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-md bg-white shadow-2xl sm:grid-cols-[340px_minmax(0,1fr)]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-7 text-white sm:flex">
          <img src="/images/web/hero-roadtrain.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <span className="relative grid h-13 w-13 place-items-center rounded-full bg-gold text-ink"><Gift size={22} /></span>
          <span className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Join the trade list</p>
            <p className="mt-2 text-2xl font-extrabold leading-tight md:text-[28px]">Get fleet deals first.</p>
          </span>
        </div>
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 text-faint hover:text-ink"><X size={22} /></button>
        <div className="p-6 sm:p-9">
          {done ? (
            <div className="py-6 text-center">
              <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-700"><Check size={26} /></p>
              <h3 className="mt-4 text-2xl font-extrabold">You are on the list</h3>
              <p className="mt-2 text-[15px] text-steel">Watch your inbox. Your code is ready — show it at checkout or mention it on the phone.</p>
              <p className="mx-auto mt-4 w-fit border-2 border-dashed border-gold bg-gold/15 px-8 py-2.5 font-mono text-2xl font-extrabold tracking-[0.2em]">{active.code}</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary sm:hidden">Join the trade list</p>
              <h3 className="text-2xl font-extrabold md:text-[28px]">Take {active.pct}% off your first order</h3>
              <p className="mt-2 text-[15px] leading-6 text-steel">New stock, weekly specials and fitment tips for Australian truck and trailer fleets. No spam, unsubscribe anytime.</p>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} placeholder="Your work email"
                className="mt-4 h-14 w-full rounded-md border border-line-dark bg-white px-4 text-[15px] outline-none placeholder:text-faint focus:border-gold" />
              <button className="mt-3 w-full rounded bg-gold py-3.5 text-base font-bold text-ink transition-colors hover:bg-navy hover:text-white">Sign me up →</button>
              <button type="button" onClick={close} className="mt-3 w-full text-center text-[13px] font-semibold text-faint underline hover:text-ink">No thanks, I will pay full price</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
