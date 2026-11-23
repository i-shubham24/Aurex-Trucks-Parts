import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, ClipboardCheck, MapPin, Phone, Truck } from "lucide-react";
import { useCompany, useSite } from "../store/site";
import { formatAUD } from "../data/products";
import { HOME_CONTENT } from "../data/seoContent";

import { PHOTO } from "../data/images";
import { useCategories } from "../hooks/api/useCategories";

export default function About() {
  const COMPANY = useCompany();
  const { settings } = useSite();
  const { data: categories = [] } = useCategories();
  const totalLines = categories.reduce((sum, c) => sum + (c.count ?? c.productCount ?? 0), 0) || 136;
  const numCats = categories.length || 3;

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">About Us</span></p>
        <div className="mt-3 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">About Aurex . Campbellfield VIC</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">The Counter Behind the Catalogue.</h1>
            <p className="mt-4 max-w-lg text-[15px] leading-6 text-steel">Aurex started at a Campbellfield trade counter serving workshops tired of wrong parts and slow freight. We catalogue every line by make, model and OEM cross, VIN check critical jobs, and answer the phone with a specialist.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact" className="rounded bg-gold px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Talk to the Counter <ArrowRight size={15} className="ml-1 inline" /></Link>
              <a href={COMPANY.phoneHref} className="flex items-center gap-2 rounded border border-ink px-6 py-3 text-sm font-bold transition-colors hover:bg-navy hover:border-navy hover:text-white"><Phone size={15} /> {COMPANY.phone}</a>
            </div>
          </div>
          <div className="card-zoom relative overflow-hidden rounded-md border border-line">
            <img src={PHOTO.tradeCounter} alt="Aurex trade counter and warehouse racking in Campbellfield" fetchPriority="high" decoding="async" className="aspect-[16/10] w-full object-cover" />
            <span className="block px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary">Campbellfield VIC</span>
          </div>
        </div>
      </section>

      <section className="mt-10 bg-ink py-8 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {[[`${totalLines}+`, "Approved lines"], [String(numCats), "Categories"], ["1", "VIC counter"], ["4hr", "Quote turnaround"]].map(([n, l]) => (
            <div key={l} className="border-l-2 border-gold pl-4">
              <p className="tabular text-3xl font-extrabold md:text-4xl">{n}</p>
              <p className="mt-1 text-[13px] text-gray-300">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">How we work</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">Three Steps, Zero Guesswork</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[["01", "Send specs", "VIN, photos and measurements through the counter, phone or email."], ["02", "We match it", "Profile, hand, finish and OEM cross checked before a price leaves."], ["03", "Freighted fast", "Daily tracked runs ex Campbellfield. Flat $18 road freight nationwide."]].map(([n, t, d]) => (
            <div key={n} className="group rounded-md border border-line bg-white p-6 transition-colors hover:border-gold">
              <p className="font-mono text-sm font-bold text-gold">{n}</p>
              <p className="mt-2 text-lg font-extrabold">{t}</p>
              <p className="mt-1.5 text-sm leading-6 text-steel">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid grid-cols-1 max-w-7xl gap-8 px-4 pt-10 md:grid-cols-2 md:items-center">
        <div className="card-zoom overflow-hidden rounded-md border border-line">
          <img src={PHOTO.trailerBuild} alt="Trailer body under build with door gear being fitted" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Why workshops stay</p>
          <ul className="mt-3 space-y-3">
            {[[BadgeCheck, "Source once", "Every line approved against supplier drawings. No filler brands."], [ClipboardCheck, "Match twice", "OEM crosses plus VIN checks before dispatch."], [Truck, "Freight fast", "Order by 2pm for same day dispatch."]].map(([Icon, t, d]) => (
              <li key={t} className="flex gap-3 rounded-md border border-line bg-white p-4 transition-colors hover:border-gold">
                <Icon size={20} className="mt-0.5 shrink-0 text-primary" />
                <span><span className="block text-[15px] font-bold">{t}</span><span className="mt-0.5 block text-sm text-steel">{d}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Technical Spares Capabilities & Melbourne Trade Counter */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Technical Spares & Distribution</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">Australian Truck &amp; Trailer Parts, Tail Lifts &amp; Heavy Vehicle Spares</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Engineered for transport fleets, commercial body builders, and repair workshops across Australia. Every line is sourced and verified to meet Australian Design Rules (ADR) and heavy freight standards.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {HOME_CONTENT.subsections?.map((sub) => (
            <div key={sub.title} className="rounded-md border border-line bg-white p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-ink">{sub.title}</h3>
              <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-steel">{sub.content}</p>
            </div>
          ))}
        </div>

        {/* Campbellfield Trade Counter & Google Maps Directions Block */}
        <div className="mt-6 rounded-md border border-gold/50 bg-white p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-bold text-ink">Melbourne Trade Counter &amp; Click &amp; Collect</span>
              <h3 className="mt-1 text-lg font-extrabold text-ink">Campbellfield Warehouse &amp; Trade Counter</h3>
              <p className="mt-1 text-xs text-steel">77 Capital Link Drive, Campbellfield VIC 3061 (Melbourne Northern Transport Corridor)</p>
              <p className="mt-1 text-xs font-semibold text-primary">Open Monday – Friday: 9:00 AM – 5:00 PM AEST | Free 4-Hour Urgent Click &amp; Collect</p>
            </div>
            <div className="flex flex-col lg:flex-row shrink-0 gap-2.5 w-full lg:w-auto">
              <a
                href="https://maps.google.com/?q=77+Capital+Link+Drive,+Campbellfield+VIC+3061"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded bg-navy px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-gold hover:text-ink text-center w-full lg:w-auto shadow-xs"
              >
                <MapPin size={14} className="text-gold shrink-0" />
                Get Directions
              </a>
              <a
                href={COMPANY.phoneHref}
                className="inline-flex items-center justify-center gap-1.5 rounded border border-ink px-4 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-ink hover:text-white text-center w-full lg:w-auto"
              >
                <Phone size={14} className="shrink-0" />
                Call {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid grid-cols-1 items-center gap-5 rounded-md bg-ink p-6 text-white md:grid-cols-2 md:p-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Visit the counter</p>
            <p className="mt-2 text-xl font-extrabold md:text-2xl">{COMPANY.address}</p>
            <p className="mt-1 text-sm text-gray-300">{COMPANY.hours}</p>
          </div>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center md:justify-end">
            <Link to="/contact" className="inline-flex h-[52px] items-center justify-center rounded bg-gold px-6 text-sm font-bold text-ink transition-colors hover:bg-white">Send an Enquiry</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
