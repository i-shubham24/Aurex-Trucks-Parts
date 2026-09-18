export function PartnersPage() {
  const partners = [
    { name: "Beauway", type: "Tail Lifts & Hydraulics", desc: "Hydraulic tail lifts in 1.5T to 3T aluminium and steel with power units and full accessory kits." },
    { name: "Ganland", type: "Trailer Door Hardware", desc: "Hinges, door locking gear, locks, tracks, retainers, handles, cargo control and tool boxes." },
    { name: "Caiyuan", type: "Body Hardware", desc: "Paddle latches, stainless hinges, canvas stands and columns built to drawing." },
    { name: "Aurex", type: "House Range", desc: "Our own curated range of the 36 approved lines, checked for fitment before dispatch." }
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      <div className="bg-[#222538] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl">Our Partners</h1>
          <p className="text-[#9CA3AF] mt-4 max-w-2xl mx-auto text-lg">
            We source our 36 approved lines directly from specialist manufacturers.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {partners.map((p, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col justify-between hover:border-[#134E8D] transition group cursor-default">
              <div>
                <h3 className="font-display font-black text-2xl text-[#222538] group-hover:text-[#134E8D] transition">{p.name}</h3>
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
