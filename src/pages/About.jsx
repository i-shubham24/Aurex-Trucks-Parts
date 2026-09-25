import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, ClipboardCheck, Phone, Truck } from "lucide-react";
import { useCompany, useSite } from "../store/site";
import { formatAUD } from "../data/products";

const WEB = (n) => `/images/web/${n}.jpg`;

export default function About() {
  const COMPANY = useCompany();
  const { settings } = useSite();
  const freeOver = formatAUD(settings.freeFreightOver || 500);
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">About Us</span></p>
        <div className="mt-3 grid items-center gap-8 md:grid-cols-2">
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
            <img src={WEB("hero-semi")} alt="Heavy rigid on the road" loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <span className="absolute bottom-3 left-3 rounded bg-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink">Campbellfield VIC</span>
          </div>
        </div>
      </section>

      <section className="mt-10 bg-ink py-8 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {[["36", "Approved lines"], ["3", "Categories"], ["1", "VIC counter"], ["4hr", "Quote turnaround"]].map(([n, l]) => (
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
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[["01", "Send specs", "VIN, photos and measurements through the counter, phone or email."], ["02", "We match it", "Profile, hand, finish and OEM cross checked before a price leaves."], ["03", "Freighted fast", `Daily tracked runs ex Campbellfield. Free road freight over ${freeOver}.`]].map(([n, t, d]) => (
            <div key={n} className="group rounded-md border border-line bg-white p-6 transition-colors hover:border-gold">
              <p className="font-mono text-sm font-bold text-gold">{n}</p>
              <p className="mt-2 text-lg font-extrabold">{t}</p>
              <p className="mt-1.5 text-sm leading-6 text-steel">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 md:grid-cols-2 md:items-center">
        <div className="card-zoom overflow-hidden rounded-md border border-line">
          <img src={WEB("service")} alt="Workshop fitment support" loading="lazy" className="aspect-[16/10] w-full object-cover" />
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

      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid items-center gap-5 rounded-md bg-ink p-6 text-white md:grid-cols-2 md:p-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Visit the counter</p>
            <p className="mt-2 text-xl font-extrabold md:text-2xl">{COMPANY.address}</p>
            <p className="mt-1 text-sm text-gray-300">{COMPANY.hours}</p>
          </div>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center md:justify-end">
            <a href={COMPANY.phoneHref} className="inline-flex h-[52px] items-center justify-center rounded bg-gold px-6 text-sm font-bold text-ink transition-colors hover:bg-white">Call {COMPANY.phone}</a>
            <Link to="/contact" className="inline-flex h-[52px] items-center justify-center rounded border border-gray-500 px-6 text-sm font-bold text-white transition-colors hover:border-gold hover:text-gold">Send an Enquiry</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
