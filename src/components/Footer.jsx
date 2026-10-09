import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useCompany, useSite } from "../store/site";
import EmailLink from "./EmailLink";
import { useNotification } from "../store/notification";

export default function Footer() {
  const COMPANY = useCompany();
  const { notify } = useNotification();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const { addEnquiry } = useSite();
  return (
    <footer className="mt-12 bg-white">
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <img src="/logo.jpeg" alt="Aurex Truck Parts" className="h-20 w-auto" />
          <p className="mt-3 max-w-xs text-[13px] leading-5 text-steel">VIN matched catalogue for Aussie fleets. Tail lifts, trailer parts and accessories, stocked in Campbellfield and freighted Australia wide.</p>
          <a href={COMPANY.phoneHref} className="mt-3 flex items-center gap-2 text-[15px] font-extrabold transition-colors hover:text-navy"><Phone size={18} className="text-gold" />{COMPANY.phone}</a>
        </div>
        <div>
          <p className="text-sm font-bold">Subscribe Newsletter To Get Updated</p>
          <form className="mt-3 flex" onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setFailed(false);
            try {
              await addEnquiry({ name: "Newsletter subscriber", email: email.trim().toLowerCase(), topic: "Newsletter sign-up", message: "Please add me to stock and price updates." });
            } catch {
              setBusy(false);
              setFailed(true);
              return;
            }
            setBusy(false);
            setDone(true);
            setEmail("");
            notify.success({
              kicker: "NEWSLETTER SUBSCRIBED",
              title: "Subscribed Successfully!",
              message: "You're now on the list for stock updates and specials.",
              icon: "mail",
              sound: true,
            });
          }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" maxLength={120} placeholder="Enter your email address" className="h-10 w-full rounded-l-md border border-line-dark px-3 text-sm outline-none placeholder:text-faint focus:border-gold" />
            <button disabled={busy} className="h-10 shrink-0 rounded-r-md bg-gold px-4 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white disabled:opacity-60">{busy ? "Sending…" : "Subscribe"}</button>
          </form>
          {failed ? <p role="alert" className="mt-2 text-[13px] font-semibold text-red-600">That didn't go through. Please try again.</p> : done ? <p className="mt-2 text-[13px] font-semibold">Thanks. You are subscribed.</p> : <p className="mt-2 text-xs text-faint">We never share your email with third parties.</p>}
          <ul className="mt-4 space-y-1.5 text-[13px] text-steel">
            <li className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gold" />{COMPANY.address}</li>
            <li className="flex gap-2"><Clock size={14} className="mt-0.5 shrink-0 text-gold" />{COMPANY.hours}</li>
            <li className="flex gap-2"><Mail size={14} className="mt-0.5 shrink-0 text-gold" /><EmailLink email={COMPANY.email} className="hover:text-navy hover:underline" /></li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold">Shop</p>
            <ul className="mt-3 space-y-2 text-[13px] text-steel">
              <li><Link to="/shop/tail-lifts" className="transition-colors hover:text-navy hover:underline">Tail Lifts</Link></li>
              <li><Link to="/shop/trailer-parts" className="transition-colors hover:text-navy hover:underline">Trailer Parts</Link></li>
              <li><Link to="/shop/accessories" className="transition-colors hover:text-navy hover:underline">Accessories</Link></li>
              <li><Link to={{ pathname: "/", hash: "#bestsellers" }} className="transition-colors hover:text-navy hover:underline">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold">Information</p>
            <ul className="mt-3 space-y-2 text-[13px] text-steel">
              <li><Link to="/about" className="transition-colors hover:text-navy hover:underline">About Us</Link></li>
              <li><Link to={{ pathname: "/", hash: "#reviews" }} className="transition-colors hover:text-navy hover:underline">Reviews</Link></li>
              <li><Link to={{ pathname: "/", hash: "#faq" }} className="transition-colors hover:text-navy hover:underline">FAQ</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-navy hover:underline">Contact</Link></li>
              <li><Link to="/policies?tab=shipping" className="transition-colors hover:text-navy hover:underline">Shipping &amp; Returns</Link></li>
              <li><Link to="/policies?tab=terms" className="transition-colors hover:text-navy hover:underline">Terms &amp; Conditions</Link></li>
              <li><Link to="/policies?tab=privacy" className="transition-colors hover:text-navy hover:underline">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-gold text-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs font-medium sm:flex-row">
          <p>Copyright © 2026 {COMPANY.name}. All Rights Reserved.</p>
          <p>Visa . Mastercard . PayPal . Afterpay . Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
