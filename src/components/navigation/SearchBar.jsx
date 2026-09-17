import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useShop } from "../../store/shop.jsx";

export default function SearchBar({ placeholder = "Search parts, SKU, or brand...", compact = false }) {
  const { query, setQuery } = useShop();
  const [focused, setFocused] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      window.location.href = "/shop";
    }
  };

  return (
    <div 
      className={`flex items-center bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl ${compact ? 'px-3 py-2' : 'pl-4 pr-1.5 py-1.5'} focus-within:border-[#0B2F5C] focus-within:bg-white transition`}
    >
      <Search size={compact ? 14 : 16} className="text-[#9CA3AF]" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none ${compact ? 'px-2 text-xs' : 'px-3 text-sm'} placeholder:text-[#9CA3AF] text-[#1A1A2E]`}
      />
      <AnimatePresence>
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setQuery("")}
            className="p-1.5 rounded-lg hover:bg-[#E5E7EB] transition"
            aria-label="clear search"
          >
            <X size={14} className="text-[#9CA3AF]" />
          </motion.button>
        )}
      </AnimatePresence>
      {!compact && (
        <button 
          onClick={handleSearch}
          className="bg-[#0B2F5C] text-white rounded-lg w-9 h-9 grid place-items-center hover:bg-[#1A1A2E] active:scale-95 transition ml-1"
          aria-label="search"
        >
          <Search size={15} />
        </button>
      )}
    </div>
  );
}