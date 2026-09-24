import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useCompany } from "../store/site";

export default function Footer() {
  const COMPANY = useCompany();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <footer className="mt-12 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <img src="/logo.jpeg" alt="Aurex Truck Parts" className="h-12 w-auto" />
          <p className="mt-3 max-w-xs text-[13px] leading-5 text-steel">VIN matched catalogue for Aussie fleets. Tail lifts, trailer parts and accessories, stocked in Campbellfield and freighted Australia wide.</p>
          <a href={COMPANY.phoneHref} className="mt-3 flex items-center gap-2 text-[15px] font-extrabold transition-colors hover:text-navy"><Phone size={18} className="text-gold" />{COMPANY.phone}</a>
          <div className="mt-3 flex gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[11px] font-bold text-white transition-colors hover:bg-navy" aria-label="Facebook">f</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[11px] font-bold text-white transition-colors hover:bg-navy" aria-label="Instagram">ig</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Subscribe Newsletter To Get Updated</p>
          <form className="mt-3 flex" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" maxLength={120} placeholder="Enter your email address" className="h-10 w-full rounded-l-md border border-line-dark px-3 text-sm outline-none placeholder:text-faint focus:border-gold" />
            <button className="h-10 shrink-0 rounded-r-md bg-gold px-4 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Subscribe</button>
          </form>
          {done ? <p className="mt-2 text-[13px] font-semibold">Thanks. You are subscribed.</p> : <p className="mt-2 text-xs text-faint">We never share your email with third parties.</p>}
          <ul className="mt-4 space-y-1.5 text-[13px] text-steel">
            <li className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gold" />{COMPANY.address}</li>
            <li className="flex gap-2"><Clock size={14} className="mt-0.5 shrink-0 text-gold" />{COMPANY.hours}</li>
            <li className="flex gap-2"><Mail size={14} className="mt-0.5 shrink-0 text-gold" /><a href={`mailto:${COMPANY.email}`} className="hover:text-navy hover:underline">{COMPANY.email}</a></li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold">Shop</p>
            <ul className="mt-3 space-y-2 text-[13px] text-steel">
              <li><Link to={{ pathname: "/", hash: "#cat-tail-lifts" }} className="transition-colors hover:text-navy hover:underline">Tail Lifts</Link></li>
              <li><Link to={{ pathname: "/", hash: "#cat-trailer-parts" }} className="transition-colors hover:text-navy hover:underline">Trailer Parts</Link></li>
              <li><Link to={{ pathname: "/", hash: "#cat-accessories" }} className="transition-colors hover:text-navy hover:underline">Accessories</Link></li>
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
              <li><Link to="/policies" className="transition-colors hover:text-navy hover:underline">Shipping &amp; Returns</Link></li>
              <li><Link to="/policies" className="transition-colors hover:text-navy hover:underline">Terms &amp; Conditions</Link></li>
              <li><Link to="/policies" className="transition-colors hover:text-navy hover:underline">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-gold text-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs font-medium sm:flex-row">
          <p>Copyright © 2026 Aurex Truck Parts Australia. All Rights Reserved.</p>
          <p>Visa . Mastercard . PayPal . Afterpay . Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
