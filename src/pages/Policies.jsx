import { useState } from "react";
import { Link } from "react-router-dom";
import { formatAUD } from "../data/products";
import { useSite } from "../store/site";

const TABS = [
  { id: "shipping", label: "Shipping", title: "Shipping policy", body: [
    ["Dispatch", "Order by 2pm AEST for same day dispatch from Campbellfield VIC."],
    ["Timeframes", "VIC metro 1 day. Sydney, Brisbane and Adelaide 1 to 2 days. Perth and regional 2 to 5 days."],
    ["Free freight", "Standard road freight is free over FREE_OVER. Express and bulky goods quoted at checkout."],
    ["Pickup", "Click and Collect is free. Ready in 4 hours in business hours. Bring your order number plus ID."],
  ] },
  { id: "returns", label: "Returns", title: "Returns policy", body: [
    ["Change of mind", "Unused parts in original packaging within 30 days for a refund or credit. Freight each way is on the buyer unless we advised the fitment."],
    ["Wrong advice", "If we confirmed fitment by VIN and the part does not fit, we cover the swap plus freight both ways."],
    ["Faulty goods", "Australian Consumer Law applies in full. Report faults with photos and your order number."],
    ["Exclusions", "Cut chain, mixed paint, used electrical parts and special orders cannot be returned."],
  ] },
  { id: "warranty", label: "Warranty", title: "Warranty policy", body: [
    ["Coverage", "12 months against defects in materials and workmanship from delivery date."],
    ["Claim", "Contact the desk with order number, photos and a fault description. We repair, replace or refund."],
    ["Not covered", "Incorrect fitment against our advice, overloading beyond ratings, accident damage and normal wear."],
  ] },
  { id: "terms", label: "Terms", title: "Terms of service", body: [
    ["Pricing", "AUD pricing shown on site. Prices can change without notice. Promos cannot be combined unless stated."],
    ["Trade terms", "Approved fleet accounts trade on 30 day terms. Overdue accounts revert to prepaid."],
    ["Liability", "Fit parts per the instructions and torque specs. If unsure, use a licensed mechanic."],
  ] },
  { id: "privacy", label: "Privacy", title: "Privacy policy", body: [
    ["Collection", "We collect contact, order and vehicle details to fulfil orders and quotes."],
    ["Use", "Used for fulfilment, support and stock alerts only. No sale of data, no spam."],
    ["Access", "Email sales@aurextruckparts.com.au for access or deletion requests."],
  ] },
];

export default function Policies({ initial = "shipping" }) {
  const [tab, setTab] = useState(TABS.some((t) => t.id === initial) ? initial : "shipping");
  const { settings } = useSite();
  const freeOver = formatAUD(settings.freeFreightOver || 500);
  const active = TABS.find((t) => t.id === tab);
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Policies</span></p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">The fine print, plainly written.</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${tab === t.id ? "bg-ink text-white" : "bg-mist text-steel hover:text-ink"}`}>{t.label}</button>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-line bg-white">
        <p className="border-b border-line bg-mist px-5 py-3 text-base font-extrabold">{active.title}</p>
        <div className="divide-y divide-line">
          {active.body.map(([h, d]) => (
            <div key={h} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_minmax(0,1fr)]">
              <p className="text-sm font-bold">{h}</p>
              <p className="text-sm leading-6 text-steel">{d.split("FREE_OVER").join(freeOver)}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-steel">Something not covered? Call <a className="font-bold text-navy underline" href="tel:0390000000">03 9000 0000</a>.</p>
    </main>
  );
}
