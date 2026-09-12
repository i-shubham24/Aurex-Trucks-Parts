import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Mail, Clock, ShieldCheck, Truck, BadgeCheck, Building2, FileText } from "lucide-react";
import { Reveal } from "../components/ui.jsx";
import { useSite } from "../store/site.jsx";

function PageHero({ crumb, title, accent, sub }) {
  return (
    <div className="relative overflow-hidden bg-[#1A1A2E] text-white">
      <div className="absolute inset-0 grid-scrim opacity-40" />
      <div className="absolute -right-20 top-0 w-[420px] h-[420px] rounded-full bg-[#E53E00]/15 blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <p className="text-[12px] font-semibold text-white/40">Home <span className="mx-1">/</span> {crumb}</p>
        <h1 className="font-display font-bold tracking-[-0.02em] text-[36px] sm:text-[52px] leading-[0.98] mt-2">{title} <span className="text-[#FF6B35]">{accent}</span></h1>
        {sub && <p className="text-white/55 text-[15px] mt-3 max-w-xl">{sub}</p>}
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="bg-white">
      <PageHero crumb="About" title="Australian owned." accent="Fleet trusted." sub="Heavy truck and trailer parts with honest advice and fast freight to every state." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-2 gap-10 items-center">
        <Reveal>
          <p className="text-[12px] font-black tracking-[0.22em] text-[#E53E00] uppercase">Our story</p>
          <h2 className="font-display font-bold text-[30px] sm:text-[40px] text-[#1A1A2E] leading-[1.03] mt-2">Built by parts people, not box movers</h2>
          <p className="text-[#6B7280] text-[15px] mt-4 leading-relaxed">Aurex started at a Campbellfield trade counter serving workshops that were tired of wrong parts and slow freight. We catalogue every line by make, model and OEM cross, check VINs before dispatch on critical jobs, and answer the phone with a specialist, not a queue.</p>
          <p className="text-[#6B7280] text-[15px] mt-3 leading-relaxed">Today we stock 140 plus lines across braking, suspension, electrical, filtration and trailer hardware, with stockists ranging from Narva and Donaldson to KYB, Koyo, Wabco and Bendix.</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[["140+", "lines stocked"], ["16", "stockist brands"], ["4hr", "quote response"]].map(([a, b]) => (
              <div key={b} className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 text-center"><p className="font-display font-bold text-2xl text-[#1A1A2E]">{a}</p><p className="text-[12px] text-[#6B7280] font-semibold">{b}</p></div>
            ))}
          </div>
        </Reveal>
        <Reveal dir="right" className="grid gap-4">
          {[["Quality", "OEM and aftermarket stock tested for heat, dust and long haul loads.", ShieldCheck], ["Expertise", "VIN matching and fitment checks by people who know trucks.", BadgeCheck], ["Service", "1 to 2 day dispatch Australia wide plus VIC Click and Collect.", Truck]].map(([t, d, Icon]) => (
            <div key={t} className="rounded-2xl bg-[#1A1A2E] text-white p-6 flex gap-4"><span className="grid place-items-center w-11 h-11 rounded-xl bg-[#E53E00] shrink-0"><Icon size={20} /></span><span><b className="font-display text-lg">{t}</b><p className="text-white/60 text-sm mt-1">{d}</p></span></div>
          ))}
        </Reveal>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-14 grid sm:grid-cols-2 gap-4">
        {[["Aurex Heavy", "Our house range for trailer hardware, braking consumables and workshop gear."], ["Aurex Electrical", "24V lighting, wiring and power gear matched to Aussie trucks."]].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-[#E5E7EB] p-6"><p className="font-display font-bold text-xl text-[#1A1A2E]">{t}</p><p className="text-sm text-[#6B7280] mt-1.5">{d}</p></div>
        ))}
      </div>
    </div>
  );
}

export function LocationsPage() {
  return (
    <div className="bg-[#F7F8FA]">
      <PageHero crumb="Locations" title="Pickup in VIC." accent="Freight everywhere." sub="Click and Collect from Campbellfield, or tracked freight to every state." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-sm">
          <p className="inline-block text-[11px] font-black bg-[#10B981] text-white rounded-lg px-2.5 py-1">OPEN NOW</p>
          <p className="font-display font-bold text-xl text-[#1A1A2E] mt-3 flex items-center gap-2"><MapPin size={18} className="text-[#E53E00]" /> Campbellfield VIC</p>
          <p className="text-sm text-[#6B7280] mt-1.5">41 Halley Court, Campbellfield VIC 3061</p>
          <div className="mt-3 space-y-1.5 text-[13px] text-[#4B5563]">
            <p className="flex items-center gap-2"><Clock size={14} /> Mon to Fri 9am to 5pm, Sat 9am to 12pm</p>
            <p className="flex items-center gap-2"><Phone size={14} /> 03 9000 0000</p>
            <p className="flex items-center gap-2"><Mail size={14} /> sales@aurextruckparts.com.au</p>
          </div>
          <p className="mt-3 text-[13px] font-semibold text-[#1A1A2E]">Order by 2pm for same day dispatch. Ready in 4 hours for pickup.</p>
        </div>
        {[["Brisbane QLD", "Ending 2026", "Northside trade counter with Click and Collect for SEQ fleets."], ["Sydney NSW", "Ending 2026", "Western Sydney pickup point for overnight metro orders."]].map(([t, tag, d]) => (
          <div key={t} className="rounded-2xl bg-white border border-dashed border-[#E5E7EB] p-6">
            <p className="inline-block text-[11px] font-black bg-[#F3F4F6] text-[#6B7280] rounded-lg px-2.5 py-1">{tag.toUpperCase()}</p>
            <p className="font-display font-bold text-xl text-[#1A1A2E] mt-3 flex items-center gap-2"><Building2 size={18} className="text-[#9CA3AF]" /> {t}</p>
            <p className="text-sm text-[#6B7280] mt-1.5">{d}</p>
            <p className="mt-3 text-[13px] text-[#6B7280]">Until opening day this region ships tracked from VIC in 1 to 3 days.</p>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-6">
        <div className="rounded-2xl bg-[#1A1A2E] text-white p-6 sm:p-8 grid sm:grid-cols-3 gap-5">
          {[["VIC metro", "1 day"], ["Sydney, Brisbane, Adelaide", "1 to 2 days"], ["Perth plus regional", "2 to 5 days"]].map(([a, b]) => (
            <div key={a}><p className="font-display font-bold text-2xl">{b}</p><p className="text-white/55 text-sm">{a}</p></div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-12 grid md:grid-cols-3 gap-4">
        {[["Truck parts Sydney", "Western Sydney workshops get overnight metro freight on stock lines ordered by 2pm. Braking, filtration and lighting move daily from Campbellfield."], ["Truck parts Brisbane", "South East Queensland routes run 2 to 3 days. Acacia Ridge pickup options open with our Brisbane counter. Bulk fleet orders ride free over threshold."], ["Truck parts Perth", "WA freight runs 3 to 5 days with tracking at every leg. Order service kits ahead of shutdowns and we consolidate cartons free."]].map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-white border border-[#E5E7EB] p-6"><p className="font-display font-bold text-lg text-[#1A1A2E]">{t}</p><p className="text-sm text-[#6B7280] mt-1.5 leading-relaxed">{d}</p></div>
        ))}
      </div>
    </div>
  );
}

export function TradePage() {
  const { addQuote } = useSite();
  const [f, setF] = useState({ name: "", company: "", abn: "", email: "", phone: "", volume: "5 to 20 lines per month" });
  const [sent, setSent] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="bg-[#F7F8FA]">
      <PageHero crumb="Trade" title="Trade pricing" accent="for workshops." sub="ABN holders unlock tier pricing, 30 day terms and priority quotes." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-2 gap-6 items-start">
        <div>
          <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] text-[#9CA3AF]">{["TIER", "WHO", "BENEFIT"].map((h) => <th key={h} className="px-5 py-3.5 font-black tracking-widest">{h}</th>)}</tr></thead>
              <tbody>
                {[["Retail", "Owner drivers", "Shelf price plus promos"], ["Trade", "Workshops with ABN", "5% off most lines plus priority quotes"], ["Fleet", "5 plus vehicles", "10% off plus 30 day terms plus saved lists"]].map(([a, b, c]) => (
                  <tr key={a} className="border-t border-[#F3F4F6]"><td className="px-5 py-3.5 font-bold text-[#1A1A2E]">{a}</td><td className="px-5 py-3.5 text-[#6B7280]">{b}</td><td className="px-5 py-3.5 text-[#1A1A2E] font-semibold">{c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-2xl bg-[#1A1A2E] text-white p-6 flex items-center gap-4"><FileText size={26} className="text-[#FF6B35] shrink-0" /><p className="text-sm text-white/70">Volume breaks apply automatically over 5 units on service lines. Talk to the desk for blanket orders.</p></div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const id = addQuote({ email: f.email, items: [], total: 0, name: f.name, company: f.company, abn: f.abn, kind: "trade-application", volume: f.volume }); setSent(id); }} className="rounded-2xl bg-white border border-[#E5E7EB] p-6 sm:p-7 grid gap-3 shadow-sm">
          <p className="font-display font-bold text-xl text-[#1A1A2E]">Apply for a trade account</p>
          {sent && <p className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3">Application {sent} received. We reply within one business day.</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            <input required value={f.name} onChange={set("name")} placeholder="Full name" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
            <input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Phone" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
          </div>
          <input required value={f.company} onChange={set("company")} placeholder="Company" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
          <div className="grid sm:grid-cols-2 gap-3">
            <input required value={f.abn} onChange={set("abn")} placeholder="ABN" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
            <input required value={f.email} onChange={set("email")} type="email" placeholder="Work email" className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none" />
          </div>
          <select value={f.volume} onChange={set("volume")} className="rounded-xl px-4 py-3 text-sm bg-[#F7F8FA] border border-[#E5E7EB] outline-none">{["1 to 4 lines per month", "5 to 20 lines per month", "20 plus lines per month", "Blanket order enquiry"].map((o) => <option key={o}>{o}</option>)}</select>
          <button className="bg-[#E53E00] text-white rounded-xl py-4 text-sm font-bold hover:bg-[#1A1A2E] transition">Submit trade application</button>
        </form>
      </div>
    </div>
  );
}

const POLICIES = {
  shipping: { title: "Shipping policy", body: [["Dispatch", "Order by 2pm AEST for same day dispatch from Campbellfield VIC."], ["Timeframes", "VIC metro 1 day. Sydney, Brisbane and Adelaide 1 to 2 days. Perth and regional 2 to 5 days."], ["Free freight", "Standard road freight is free over $500. Express and bulky goods quoted at checkout."], ["Pickup", "Click and Collect is free. Ready in 4 hours in business hours. Bring your order number plus ID."]] },
  returns: { title: "Returns policy", body: [["Change of mind", "Unused parts in original packaging within 30 days for a refund or credit. Freight each way is on the buyer unless we advised the fitment."], ["Wrong advice", "If we confirmed fitment by VIN and the part does not fit, we cover the swap plus freight both ways."], ["Faulty goods", "Australian Consumer Law applies in full. Report faults with photos and your order number."], ["Exclusions", "Cut chain, mixed paint, used electrical parts and special orders cannot be returned."]] },
  warranty: { title: "Warranty policy", body: [["Coverage", "12 months against defects in materials and workmanship from delivery date. Batteries 24 months. Electrical 12 months."], ["Claim", "Contact the desk with order number, photos and a fault description. We repair, replace or refund."], ["Not covered", "Incorrect fitment against our advice, overloading beyond ratings, accident damage and normal wear."]] },
  terms: { title: "Terms of service", body: [["Pricing", "AUD including GST. Prices can change without notice. Promos cannot be combined unless stated."], ["Trade terms", "Approved fleet accounts trade on 30 day terms. Overdue accounts revert to prepaid."], ["Liability", "Fit parts per the instructions and torque specs. If unsure, use a licensed mechanic."]] },
  privacy: { title: "Privacy policy", body: [["Collection", "We collect contact, order and vehicle details to fulfil orders and quotes."], ["Use", "Used for fulfilment, support and stock alerts only. No sale of data, no spam."], ["Storage", "Demo build stores data in your own browser. Production storage follows the APPs."], ["Access", "Email sales@aurextruckparts.com.au for access or deletion requests."]] },
};

export function PoliciesPage() {
  const { slug } = useParams();
  const active = POLICIES[slug] ? slug : "shipping";
  return (
    <div className="bg-[#F7F8FA]">
      <PageHero crumb="Policies" title="The fine print," accent="plainly written." sub="Shipping, returns, warranty, terms and privacy in one hub." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-[240px_1fr] gap-6 items-start">
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-3 grid gap-1 lg:sticky lg:top-28">
          {Object.entries(POLICIES).map(([k, v]) => (
            <Link key={k} to={`/policies/${k}`} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${k === active ? "bg-[#1A1A2E] text-white" : "text-[#4B5563] hover:bg-[#F7F8FA]"}`}>{v.title}</Link>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 sm:p-8">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1A2E]">{POLICIES[active].title}</h2>
          <div className="mt-5 space-y-4">
            {POLICIES[active].body.map(([h, t]) => (
              <div key={h} className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-5"><p className="font-bold text-[#1A1A2E]">{h}</p><p className="text-sm text-[#4B5563] mt-1 leading-relaxed">{t}</p></div>
            ))}
          </div>
          <Link to="/contact" className="mt-6 inline-flex items-center gap-2 bg-[#E53E00] text-white rounded-xl px-6 py-3.5 text-sm font-bold">Questions? Talk to the desk <ArrowRight size={15} /></Link>
        </div>
      </div>
    </div>
  );
}
