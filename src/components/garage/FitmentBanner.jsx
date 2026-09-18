import { Truck, X, Filter } from "lucide-react";
import { useGarage } from "./GarageContext.jsx";
import YMMWidget from "./YMMWidget.jsx";

const NOTCH = { clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)" };

// Persistent fitment bar for the shop. Shows what the garage is filtering to, or prompts for a truck.
// No clip-path on the outer container, so the YMM dropdown can overflow freely.
export default function FitmentBanner({ fitCount, onlyFits, setOnlyFits }) {
  const { selectedVehicle, hasValidVehicle, clearSelectedVehicle } = useGarage();

  if (!hasValidVehicle) {
    return (
      <div className="relative bg-[#12121B] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 border-[#0B2F5C]">
        <div className="flex items-center gap-3 flex-1">
          <span className="grid place-items-center w-10 h-10 bg-white/5 border border-white/10 text-[#8FB4E0] shrink-0" style={NOTCH}>
            <Truck size={18} />
          </span>
          <div>
            <p className="font-display font-bold text-[15px]">Shopping blind?</p>
            <p className="text-white/80 text-[13px]">Add your truck and we grey out anything that will not fit.</p>
          </div>
        </div>
        <div className="shrink-0"><YMMWidget variant="pill" /></div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#0B2F5C] text-white p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3 border-l-4 border-[#1A1A2E]">
      <span className="grid place-items-center w-10 h-10 bg-black/15 shrink-0" style={NOTCH}>
        <Truck size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black tracking-[0.22em] uppercase text-white/70">Filtering for your rig</p>
        <p className="font-display font-bold text-[16px] leading-tight truncate">
          {selectedVehicle.year ? `${selectedVehicle.year} ` : ""}{selectedVehicle.make} {selectedVehicle.model}
          <span className="font-sans font-semibold text-white/70 text-[13px] ml-2">{fitCount} parts fit</span>
        </p>
      </div>
      <button
        onClick={() => setOnlyFits(!onlyFits)}
        className={`flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-black uppercase tracking-wide border-2 transition ${
          onlyFits ? "bg-white text-[#0B2F5C] border-white" : "border-white/40 text-white hover:border-white"
        }`}
      >
        <Filter size={13} /> {onlyFits ? "Fit only: on" : "Fit only: off"}
      </button>
      <button onClick={clearSelectedVehicle} className="flex items-center gap-1.5 text-white/80 hover:text-white text-[12px] font-bold uppercase tracking-wide">
        <X size={14} /> Clear
      </button>
    </div>
  );
}
