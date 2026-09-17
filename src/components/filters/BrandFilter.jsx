import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

export default function BrandFilter({ brands, selected, onChange, compact = false }) {
  const [expanded, setExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBrands = brands?.filter((brand) =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleBrandClick = (brandName) => {
    onChange(brandName === selected ? "All brands" : brandName);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase hover:text-[#1A1A2E] transition"
      >
        <span>Brand</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      
      {expanded && (
        <div className="mt-2 space-y-2">
          {!compact && (
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search brands..."
                className="w-full bg-[#F5F6F8] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0B2F5C] transition"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A2E]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          
          <div className={`flex flex-wrap gap-1.5 ${compact ? "max-h-32 overflow-auto" : ""}`}>
            {["All brands", ...filteredBrands].map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandClick(brand)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition ${
                  selected === brand
                    ? "bg-[#0B2F5C] text-white border-[#0B2F5C]"
                    : "border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C] hover:text-[#0B2F5C]"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
          
          {filteredBrands.length === 0 && searchTerm && (
            <p className="text-xs text-[#9CA3AF] text-center py-2">No brands found</p>
          )}
        </div>
      )}
    </div>
  );
}