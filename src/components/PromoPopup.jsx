import { useEffect, useState } from "react";
import { Gift, X } from "lucide-react";

export default function PromoPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("aurex-promo-seen") === "1"; } catch { /* private mode */ }
    if (seen) return;
    const id = setTimeout(() => {
      setShow(true);
      try { sessionStorage.setItem("aurex-promo-seen", "1"); } catch { /* private mode */ }
    }, 30000);
    return () => clearTimeout(id);
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={() => setShow(false)} />
      <div className="relative grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-md bg-white shadow-2xl sm:grid-cols-[300px_minmax(0,1fr)]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-5 text-white sm:flex">
          <img src="/images/web/hero-roadtrain.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <span className="relative grid h-11 w-11 place-items-center rounded-full bg-gold text-ink"><Gift size={20} /></span>
          <span className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Welcome offer</p>
            <p className="mt-1 text-xl font-extrabold leading-snug">Take 10% off your first order</p>
          </span>
        </div>
        <button onClick={() => setShow(false)} aria-label="Close" className="absolute right-3 top-3 text-faint hover:text-ink"><X size={18} /></button>
        <div className="p-5 sm:p-6">
          {done ? (
            <div className="py-2 text-center">
              <p className="text-sm text-steel">Your code is ready. Show it at checkout or mention it on the phone.</p>
              <p className="mx-auto mt-3 w-fit border-2 border-dashed border-gold bg-gold/15 px-6 py-2 font-mono text-xl font-extrabold tracking-[0.2em]">WELCOME10</p>
              <button onClick={() => setShow(false)} className="mt-4 w-full rounded bg-ink py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy">Start Shopping</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:hidden">Welcome offer</p>
              <h3 className="text-xl font-extrabold">Get 10% off your first order</h3>
              <p className="mt-1 text-sm text-steel">Join the trade list for restock alerts and specials.</p>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email address" className="mt-3 h-11 w-full rounded-md border border-line-dark px-3 text-sm outline-none placeholder:text-faint focus:border-gold" />
              <button className="mt-2.5 w-full rounded bg-gold py-2.5 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Claim 10% Off</button>
              <button type="button" onClick={() => setShow(false)} className="mt-2 w-full text-center text-xs font-semibold text-faint underline hover:text-ink">No thanks</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
