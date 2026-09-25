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
          <img src="/logo.jpeg" alt="Aurex Truck Parts" className="h-20 w-auto" />
          <p className="mt-3 max-w-xs text-[13px] leading-5 text-steel">VIN matched catalogue for Aussie fleets. Tail lifts, trailer parts and accessories, stocked in Campbellfield and freighted Australia wide.</p>
          <a href={COMPANY.phoneHref} className="mt-3 flex items-center gap-2 text-[15px] font-extrabold transition-colors hover:text-navy"><Phone size={18} className="text-gold" />{COMPANY.phone}</a>
          <div className="mt-3 flex gap-2">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-navy">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-navy">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
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
          <p>Copyright © 2026 {COMPANY.name}. All Rights Reserved.</p>
          <p>Visa . Mastercard . PayPal . Afterpay . Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
