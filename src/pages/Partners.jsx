export function PartnersPage() {
  const partners = [
    { name: "Donaldson", type: "Filtration Systems", desc: "Leading provider of heavy-duty filtration solutions for engines and hydraulics." },
    { name: "Narva", type: "Auto Electrical & Lighting", desc: "Premium LED lighting, beacons, and electrical accessories for transport." },
    { name: "Bosch", type: "Starters & Alternators", desc: "OEM quality rotating electrical and charging systems." },
    { name: "SAF Holland", type: "Axles & Suspension", desc: "World-class fifth wheels, landing gear, and heavy suspension setups." },
    { name: "Fleetguard", type: "Filtration", desc: "Cummins filtration technology for maximum engine protection." },
    { name: "Gulf Western", type: "Oils & Lubricants", desc: "Australian made oils and coolants formulated for harsh local conditions." },
    { name: "Tridon", type: "Wipers & Thermostats", desc: "High quality engine cooling and vision products." },
    { name: "Wabco", type: "Air Braking", desc: "Advanced EBS and ABS braking valves and sensors for heavy trailers." },
    { name: "Century", type: "Batteries", desc: "Ultra-reliable heavy commercial starting and deep cycle batteries." },
    { name: "Hendrickson", type: "Air Suspension", desc: "Global leader in heavy-duty truck and trailer air suspension systems." },
    { name: "Gates", type: "Belts & Hoses", desc: "Premium EPDM drive belts, tensioners, and cooling system hoses." },
    { name: "KYB", type: "Shock Absorbers", desc: "Heavy commercial shock absorbers engineered for ride control and tyre life." }
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      <div className="bg-[#1A1A2E] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl">Our Partners</h1>
          <p className="text-[#9CA3AF] mt-4 max-w-2xl mx-auto text-lg">
            We only stock genuine and OEM-quality replacement parts from the world's most trusted manufacturers.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {partners.map((p, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col justify-between hover:border-[#E53E00] transition group cursor-default">
              <div>
                <h3 className="font-display font-black text-2xl text-[#1A1A2E] group-hover:text-[#E53E00] transition">{p.name}</h3>
                <span className="inline-block bg-[#F3F4F6] text-[#4B5563] text-xs font-bold px-2 py-1 rounded mt-2 uppercase tracking-wide">
                  {p.type}
                </span>
                <p className="text-sm text-[#6B7280] mt-4">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
