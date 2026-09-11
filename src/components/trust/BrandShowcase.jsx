import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BrandShowcase({ compact = false }) {
  const brands = [
    { name: "Kenworth", logo: "KW" },
    { name: "Mack", logo: "MK" },
    { name: "Volvo", logo: "VO" },
    { name: "Scania", logo: "SC" },
    { name: "Isuzu", logo: "IS" },
    { name: "Hino", logo: "HI" },
    { name: "Bendix", logo: "BX" },
    { name: "Bosch", logo: "BS" },
    { name: "Wabco", logo: "WB" },
    { name: "Meritor", logo: "MT" },
    { name: "Donaldson", logo: "DN" },
    { name: "Narva", logo: "NV" },
  ];

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft < 
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
      );
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  if (compact) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {brands.slice(0, 6).map((brand, index) => (
          <div
            key={index}
            className="aspect-square bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl flex items-center justify-center hover:border-[#E53E00] transition cursor-pointer group"
          >
            <div className="text-center">
              <p className="font-display font-bold text-lg text-[#1A1A2E] group-hover:text-[#E53E00] transition">
                {brand.logo}
              </p>
              <p className="text-[10px] text-[#9CA3AF] mt-1">{brand.name}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl text-[#1A1A2E]">Trusted Brands</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center hover:border-[#E53E00] disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center hover:border-[#E53E00] disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {brands.map((brand, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="min-w-[120px] aspect-square bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl flex items-center justify-center hover:border-[#E53E00] hover:shadow-md transition cursor-pointer group snap-start"
          >
            <div className="text-center">
              <p className="font-display font-bold text-2xl text-[#1A1A2E] group-hover:text-[#E53E00] transition">
                {brand.logo}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">{brand.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm text-[#6B7280] mt-4">
        Carrying {brands.length}+ leading automotive and heavy truck brands
      </p>
    </div>
  );
}