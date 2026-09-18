import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function PriceFilter({ range = [0, 6000], onChange, min = 0, max = 6000, compact = false }) {
  const [expanded, setExpanded] = useState(true);
  const [localRange, setLocalRange] = useState(range);

  const handleMinChange = (value) => {
    const newMin = Math.min(Number(value), localRange[1]);
    setLocalRange([newMin, localRange[1]]);
    onChange([newMin, localRange[1]]);
  };

  const handleMaxChange = (value) => {
    const newMax = Math.max(Number(value), localRange[0]);
    setLocalRange([localRange[0], newMax]);
    onChange([localRange[0], newMax]);
  };

  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setLocalRange([localRange[0], value]);
    onChange([localRange[0], value]);
  };

  const formatPrice = (value) => `$${value.toFixed(0)}`;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase hover:text-[#1A1A2E] transition"
      >
        <span>Price Range</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      
      {expanded && (
        <div className="mt-2 space-y-3">
          <div className="flex items-center justify-between text-[12px] font-semibold text-[#9CA3AF]">
            <span>{formatPrice(localRange[0])}</span>
            <span>to</span>
            <span>{formatPrice(localRange[1])}</span>
          </div>
          
          <input
            type="range"
            min={min}
            max={max}
            value={localRange[1]}
            onChange={handleSliderChange}
            className="w-full accent-[#0B2F5C] h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer"
          />
          
          {!compact && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Min</label>
                <input
                  type="number"
                  value={localRange[0]}
                  onChange={(e) => handleMinChange(e.target.value)}
                  min={min}
                  max={max}
                  className="mt-1 w-full bg-[#F5F6F8] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0B2F5C] transition"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Max</label>
                <input
                  type="number"
                  value={localRange[1]}
                  onChange={(e) => handleMaxChange(e.target.value)}
                  min={min}
                  max={max}
                  className="mt-1 w-full bg-[#F5F6F8] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0B2F5C] transition"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}