import { Link } from "react-router-dom";

export const PARTNER_BRANDS = [
  { name: "BEAUWAY", tag: "Tail Lifts & Powerpacks", color: "#134E8D", badge: "Direct Supplier" },
  { name: "GANLAND", tag: "Heavy Door Gear & Locks", color: "#222538", badge: "Certified OEM" },
  { name: "CAIYUAN", tag: "Body Builder Hardware", color: "#3873B3", badge: "Approved Line" },
  { name: "AUREX HD", tag: "Engineered Transport Spares", color: "#134E8D", badge: "ADR Tested" },
  { name: "HYVA", tag: "Hydraulic Cylinders", color: "#0C2B52", badge: "Heavy Duty" },
  { name: "JOST", tag: "Fifth Wheels & Landing Legs", color: "#222538", badge: "Fleet Grade" },
  { name: "HENDRICKSON", tag: "Suspension Spares", color: "#134E8D", badge: "OEM Match" },
  { name: "KNORR-BREMSE", tag: "Air Brake Systems", color: "#3873B3", badge: "Precision Spec" },
  { name: "SAF-HOLLAND", tag: "Axles & Couplings", color: "#222538", badge: "Linehaul Ready" },
];

export default function PartnerCarousel() {
  // Double the list for seamless infinite loop
  const list = [...PARTNER_BRANDS, ...PARTNER_BRANDS];

  return (
    <section className="relative bg-[#F4F7FB] border-y border-[#D7E4F2] py-3.5 sm:py-4 overflow-hidden select-none">
      <div className="mask-fade-x relative overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee marquee-track items-center gap-4.5 sm:gap-5.5 w-max">
          {list.map((b, i) => (
            <Link
              key={`${b.name}-${i}`}
              to={`/shop?search=${encodeURIComponent(b.name.replace(' HD', ''))}`}
              className="group inline-flex items-center gap-3 bg-white border border-[#E5E7EB] hover:border-[#134E8D] px-4 sm:px-4.5 py-2 rounded-xl shadow-xs hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span
                    className="font-display font-black text-[15px] sm:text-[16px] tracking-tight text-[#222538] group-hover:text-[#134E8D] transition-colors"
                  >
                    {b.name}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#134E8D] bg-[#EDF3FA] px-1.5 py-0.5 rounded">
                    {b.badge}
                  </span>
                </div>
                <span className="text-[11px] text-[#6B7280] font-medium leading-none mt-0.5">
                  {b.tag}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
