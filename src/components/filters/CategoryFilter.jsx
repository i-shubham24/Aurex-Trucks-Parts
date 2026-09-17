import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function CategoryFilter({ categories, selected, onChange, compact = false }) {
  const [expanded, setExpanded] = useState(true);

  const handleCategoryClick = (categoryName) => {
    onChange(categoryName === selected ? "All" : categoryName);
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase hover:text-[#1A1A2E] transition"
      >
        <span>System</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      
      {expanded && (
        <div className={`mt-2 ${compact ? "grid gap-1" : "grid gap-1 max-h-[300px] overflow-auto pr-1"}`}>
          {["All", ...(categories?.map((c) => c.name) || [])].map((categoryName) => (
            <button
              key={categoryName}
              onClick={() => handleCategoryClick(categoryName)}
              className={`flex justify-between items-center text-left rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition ${
                selected === categoryName
                  ? "bg-[#0B2F5C] text-white"
                  : "hover:bg-[#F7F8FA] text-[#6B7280]"
              }`}
            >
              <span>{categoryName}</span>
              {categoryName !== "All" && (
                <span className="text-[11px] opacity-60">
                  {categories?.find((c) => c.name === categoryName)?.count || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}