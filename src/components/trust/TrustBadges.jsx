import { Truck, Headphones, ShieldCheck, RotateCcw, Award, Clock, MapPin, Phone } from "lucide-react";

export default function TrustBadges({ compact = false, darkTheme = false }) {
  const badges = [
    [Truck, "Quick Dispatch", "Shipped Australia wide in 1 to 2 business days"],
    [Headphones, "Expert Support", "Over 20 years of heavy vehicle knowledge"],
    [ShieldCheck, "ADR Compliant", "Tested to Australian Design Rules"],
    [RotateCcw, "Simple Returns", "Hassle free change of mind returns"],
  ];

  const extendedBadges = [
    ...badges,
    [Award, "Quality Guaranteed", "Genuine parts with warranty coverage"],
    [Clock, "Fast Response", "4-hour quote response time"],
    [MapPin, "Australian Owned", "Based in Campbellfield, Victoria"],
    [Phone, "Expert Support", "03 9000 0000"],
  ];

  const displayBadges = compact ? badges : extendedBadges;

  const themeClasses = darkTheme 
    ? "bg-white/10 border-white/20 text-white" 
    : "bg-white border-[#E5E7EB] text-[#1A1A2E]";

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6`}>
      {displayBadges.map(([Icon, title, description], index) => (
        <div key={index} className="flex items-start gap-3">
          <span className={`grid place-items-center w-11 h-11 rounded-xl ${darkTheme ? 'bg-white/20' : 'bg-white border border-[#E5E7EB]'} text-[#0B2F5C] shrink-0 shadow-sm`}>
            <Icon size={20} />
          </span>
          <div>
            <p className="font-bold text-[14px] text-[#1A1A2E]">{title}</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5 leading-snug">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}