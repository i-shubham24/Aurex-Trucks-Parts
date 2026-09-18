import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import { useSite } from "../../store/site.jsx";
import CategoryFilter from "./CategoryFilter.jsx";
import BrandFilter from "./BrandFilter.jsx";
import PriceFilter from "./PriceFilter.jsx";
import StockFilter from "./StockFilter.jsx";

export default function FilterSidebar({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedPriceRange,
  inStockOnly,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
  onStockChange,
  onClearAll,
  compact = false
}) {
  const { liveCategories: CATEGORIES } = useSite();
  const [isExpanded, setIsExpanded] = useState(!compact);

  const handleClearAll = () => {
    onCategoryChange("All");
    onBrandChange("All brands");
    onPriceChange([0, 6000]);
    onStockChange(false);
    if (onClearAll) onClearAll();
  };

  const hasActiveFilters = selectedCategory !== "All" || 
                          selectedBrand !== "All brands" || 
                          selectedPriceRange[0] > 0 || 
                          selectedPriceRange[1] < 6000 || 
                          inStockOnly;

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
            hasActiveFilters 
              ? "bg-[#0B2F5C] text-white" 
              : "bg-[#F5F6F8] border border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C]"
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-xl shadow-elevated z-50 p-4 space-y-4"
            >
              <FilterContent
                categories={categories || CATEGORIES}
                brands={brands}
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                selectedPriceRange={selectedPriceRange}
                inStockOnly={inStockOnly}
                onCategoryChange={onCategoryChange}
                onBrandChange={onBrandChange}
                onPriceChange={onPriceChange}
                onStockChange={onStockChange}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <aside className="rounded-2xl bg-white border border-[#E5E7EB] p-5 lg:sticky lg:top-28 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-lg text-[#1A1A2E]">Filters</p>
        {hasActiveFilters && (
          <button onClick={handleClearAll} className="text-[12px] font-semibold text-[#9CA3AF] hover:text-[#0B2F5C] transition">
            Clear all
          </button>
        )}
      </div>

      <FilterContent
        categories={categories || CATEGORIES}
        brands={brands}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        selectedPriceRange={selectedPriceRange}
        inStockOnly={inStockOnly}
        onCategoryChange={onCategoryChange}
        onBrandChange={onBrandChange}
        onPriceChange={onPriceChange}
        onStockChange={onStockChange}
        onClearAll={handleClearAll}
        hasActiveFilters={hasActiveFilters}
      />
    </aside>
  );
}

function FilterContent({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedPriceRange,
  inStockOnly,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
  onStockChange,
  onClearAll,
  hasActiveFilters
}) {
  return (
    <div className="space-y-5">
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onChange={onCategoryChange}
      />

      <BrandFilter
        brands={brands}
        selected={selectedBrand}
        onChange={onBrandChange}
      />

      <PriceFilter
        range={selectedPriceRange}
        onChange={onPriceChange}
      />

      <StockFilter
        inStockOnly={inStockOnly}
        onChange={onStockChange}
      />

      <div className="rounded-xl bg-gradient-to-br from-[#0B2F5C] to-[#071E3C] text-white p-4">
        <p className="font-bold">Fleet top up?</p>
        <p className="text-[12px] font-medium mt-1 text-white/80">5 plus units unlocks extra pricing in the quote cart.</p>
      </div>
    </div>
  );
}