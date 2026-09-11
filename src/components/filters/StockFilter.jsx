import { useState } from "react";
import { ChevronDown, ChevronRight, Package } from "lucide-react";

export default function StockFilter({ inStockOnly = false, onChange, compact = false }) {
  const [expanded, setExpanded] = useState(true);

  const handleToggle = () => {
    onChange(!inStockOnly);
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase hover:text-[#1A1A2E] transition"
      >
        <span>Availability</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      
      {expanded && (
        <div className="mt-2">
          <button
            onClick={handleToggle}
            className={`w-full rounded-xl px-4 py-3 text-[13px] font-bold border transition flex items-center gap-3 ${
              inStockOnly
                ? "bg-[#10B981] text-white border-[#10B981]"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#10B981] hover:text-[#10B981]"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              inStockOnly ? "bg-white/20" : "bg-[#F5F6F8]"
            }`}>
              <Package size={16} className={inStockOnly ? "text-white" : "text-[#10B981]"} />
            </div>
            <div className="text-left">
              <p className="font-semibold">In Stock VIC</p>
              <p className="text-[11px] opacity-80">
                {inStockOnly ? "Showing available items" : "Show only available items"}
              </p>
            </div>
            {inStockOnly && (
              <div className="ml-auto w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}