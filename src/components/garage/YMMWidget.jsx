import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Car, Plus, X } from "lucide-react";
import { useGarage } from "./GarageContext.jsx";
import { MAKES, MODELS } from "../../data/catalog.js";

export default function YMMWidget({ compact = false, darkTheme = false }) {
  const { selectedVehicle, hasValidVehicle, addVehicle, updateVehicle, clearSelectedVehicle } = useGarage();
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState(selectedVehicle?.year || "");
  const [make, setMake] = useState(selectedVehicle?.make || "");
  const [model, setModel] = useState(selectedVehicle?.model || "");
  const [partSearch, setPartSearch] = useState("");

  const handleSaveVehicle = () => {
    if (year && make && model) {
      if (selectedVehicle) {
        updateVehicle(selectedVehicle.id, { year, make, model });
      } else {
        addVehicle({ year, make, model });
      }
      setIsOpen(false);
    }
  };

  const handleClearVehicle = () => {
    clearSelectedVehicle();
    setYear("");
    setMake("");
    setModel("");
  };

  const handleSearch = () => {
    if (partSearch.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(partSearch)}`;
    }
  };

  const themeClasses = darkTheme 
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/40" 
    : "bg-[#F5F6F8] border-[#E5E7EB] text-[#1A1A2E] placeholder:text-[#9CA3AF]";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {hasValidVehicle ? (
          <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg px-3 py-2">
            <Car size={16} className="text-[#10B981]" />
            <span className="text-sm font-semibold text-[#10B981]">
              {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </span>
            <button onClick={handleClearVehicle} className="text-[#10B981] hover:text-[#059669]">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-[#E53E00]/10 border border-[#E53E00]/20 rounded-lg px-3 py-2 text-[#E53E00] hover:bg-[#E53E00]/20 transition"
          >
            <Plus size={16} />
            <span className="text-sm font-semibold">Add Vehicle</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {!isOpen ? (
        <div className="flex items-center gap-3">
          {hasValidVehicle ? (
            <div className="flex items-center gap-3 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl px-4 py-3">
              <Car size={20} className="text-[#10B981]" />
              <div>
                <p className="text-sm font-bold text-[#10B981]">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </p>
                <p className="text-xs text-[#10B981]/70">Parts filtered for your vehicle</p>
              </div>
              <button onClick={handleClearVehicle} className="text-[#10B981] hover:text-[#059669]">
                <X size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-[#E53E00] text-white rounded-xl px-5 py-3 font-bold hover:bg-[#C23400] transition"
            >
              <Car size={18} />
              Select Your Vehicle
            </button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 ${darkTheme ? 'bg-white/10' : 'bg-white border border-[#E5E7EB]'} shadow-elevated`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Select Your Vehicle</h3>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-[#E5E7EB] transition">
              <X size={18} />
            </button>
          </div>
          
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
            <div>
              <label className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Make</label>
              <div className="relative mt-1.5">
                <select 
                  value={make} 
                  onChange={(e) => setMake(e.target.value)}
                  className={`w-full ${themeClasses} rounded-xl px-4 py-3.5 text-sm font-semibold outline-none appearance-none cursor-pointer`}
                >
                  <option value="">Select make</option>
                  {MAKES.map((m) => <option key={m}>{m}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
              </div>
            </div>
            
            <div>
              <label className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Year</label>
              <div className="relative mt-1.5">
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  className={`w-full ${themeClasses} rounded-xl px-4 py-3.5 text-sm font-semibold outline-none appearance-none cursor-pointer`}
                >
                  <option value="">Select year</option>
                  {MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
              </div>
            </div>
            
            <div>
              <label className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Model</label>
              <input 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter model"
                className={`mt-1.5 w-full ${themeClasses} rounded-xl px-4 py-3.5 text-sm font-semibold outline-none`}
              />
            </div>
            
            <button 
              onClick={handleSaveVehicle}
              disabled={!year || !make || !model}
              className="bg-[#E53E00] text-white rounded-xl px-6 py-3.5 text-sm font-bold hover:bg-[#C23400] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Save Vehicle
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
            <label className="text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Part Search</label>
            <div className="mt-2 flex gap-2">
              <input 
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Brake, winch, filter..."
                className={`flex-1 ${themeClasses} rounded-xl px-4 py-3 text-sm font-semibold outline-none`}
              />
              <button 
                onClick={handleSearch}
                className="bg-[#1A1A2E] text-white rounded-xl px-5 py-3 text-sm font-bold hover:bg-[#2D2D4A] transition"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}