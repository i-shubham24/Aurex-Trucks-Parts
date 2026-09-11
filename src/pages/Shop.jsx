import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { PRODUCTS as SEED, BRANDS } from "../data/catalog.js";
import { FIT_RANK } from "../data/fitment.js";
import { useProducts } from "../store/products.jsx";
import { useSite } from "../store/site.jsx";
import { ProductCard } from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useGarage } from "../components/garage/GarageContext.jsx";
import FitmentBanner from "../components/garage/FitmentBanner.jsx";

export default function Shop() {
  const { query, setQuery } = useShop();
  const { products: PRODUCTS } = useProducts();
  const { liveCategories: CATEGORIES } = useSite();
  const { fitStatus, hasValidVehicle } = useGarage();
  const [params] = useSearchParams();
  const [cat, setCat] = useState(params.get("cat") || "All");
  const [brand, setBrand] = useState("All brands");
  const [sort, setSort] = useState("Popular");
  const [maxPrice, setMaxPrice] = useState(1600);
  const [inStock, setInStock] = useState(false);
  const [onlyFits, setOnlyFits] = useState(false);

  // Basic facet filter first.
  const base = useMemo(() => PRODUCTS.filter((p) => {
    const okCat = cat === "All" || p.cat === cat;
    const okBrand = brand === "All brands" || p.brand === brand;
    const okQ = query.trim() === "" || (p.name + " " + p.sku + " " + (p.brand || "")).toLowerCase().includes(query.toLowerCase());
    const okP = p.price <= maxPrice;
    const okS = !inStock || p.stock.includes("In stock");
    return okCat && okBrand && okQ && okP && okS;
  }), [PRODUCTS, cat, brand, query, maxPrice, inStock]);

  // Parts that fit the selected truck, for the banner count.
  const fitCount = useMemo(
    () => (hasValidVehicle ? base.filter((p) => ["fits", "universal"].includes(fitStatus(p))).length : 0),
    [base, hasValidVehicle, fitStatus]
  );

  const list = useMemo(() => {
    let l = base;
    if (hasValidVehicle && onlyFits) l = l.filter((p) => ["fits", "universal"].includes(fitStatus(p)));
    const bySort = (a, b) => {
      if (sort === "Low to High") return a.price - b.price;
      if (sort === "High to Low") return b.price - a.price;
      if (sort === "Top Rated") return b.rating - a.rating;
      return 0;
    };
    // With a truck set, fitting parts always float up, then the chosen sort applies.
    l = [...l].sort((a, b) => {
      if (hasValidVehicle) {
        const r = FIT_RANK[fitStatus(a)] - FIT_RANK[fitStatus(b)];
        if (r !== 0) return r;
      }
      return bySort(a, b);
    });
    return l;
  }, [base, hasValidVehicle, onlyFits, fitStatus, sort]);

  const clearAll = () => { setCat("All"); setBrand("All brands"); setQuery(""); setMaxPrice(1600); setInStock(false); setOnlyFits(false); };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-6">
          <p className="text-[12px] font-semibold text-[#9CA3AF]">
            <Link to="/" className="hover:text-[#E53E00] transition">Home</Link>
            <span className="mx-1.5">/</span>Shop
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-5">
            <div>
              <h1 className="font-display font-bold tracking-[-0.02em] text-[36px] sm:text-[48px] leading-[0.95] text-[#1A1A2E]">
                Shop truck <span className="text-[#E53E00]">parts.</span>
              </h1>
              <p className="text-[#6B7280] text-[15px] mt-2 max-w-xl">
                Filter by system, brand and price. Every card opens full specs plus OEM cross plus fitment.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="font-display font-bold text-4xl text-[#1A1A2E]">{list.length}</span>
              <span className="text-[12px] text-[#9CA3AF] font-semibold leading-tight">
                results<br />live in VIC
              </span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex-1 min-w-[240px] focus-within:border-[#E53E00] transition">
              <Search size={16} className="text-[#9CA3AF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, SKU or brand..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#9CA3AF] text-[#1A1A2E]"
              />
              {query && <button onClick={() => setQuery("")}><X size={15} className="text-[#9CA3AF]" /></button>}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl px-5 py-3 bg-white border border-[#E5E7EB] text-sm font-semibold text-[#1A1A2E] outline-none"
            >
              {["Popular", "Low to High", "High to Low", "Top Rated"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Fitment banner */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <FitmentBanner fitCount={fitCount} onlyFits={onlyFits} setOnlyFits={setOnlyFits} />
      </div>

      {/* Filters + Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        <aside className="rounded-2xl bg-white border border-[#E5E7EB] p-5 lg:sticky lg:top-28 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-lg text-[#1A1A2E]">Filters</p>
            <button onClick={clearAll} className="text-[12px] font-semibold text-[#9CA3AF] hover:text-[#E53E00] transition">
              Clear all
            </button>
          </div>

          <p className="mt-5 text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">System</p>
          <div className="mt-2 grid gap-1 max-h-[300px] overflow-auto pr-1">
            {["All", ...CATEGORIES.map((c) => c.name)].map((t) => (
              <button
                key={t}
                onClick={() => setCat(t)}
                className={`flex justify-between items-center text-left rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition ${
                  cat === t
                    ? "bg-[#E53E00] text-white"
                    : "hover:bg-[#F7F8FA] text-[#6B7280]"
                }`}
              >
                {t}
                {t !== "All" && <span className="text-[11px] opacity-60">{CATEGORIES.find((c) => c.name === t)?.count}</span>}
              </button>
            ))}
          </div>

          <p className="mt-5 text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">Brand</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["All brands", ...Array.from(new Set(PRODUCTS.map((p) => p.brand).filter(Boolean)))].map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition ${
                  brand === b
                    ? "bg-[#E53E00] text-white border-[#E53E00]"
                    : "border-[#E5E7EB] text-[#6B7280] hover:border-[#E53E00] hover:text-[#E53E00]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <p className="mt-5 text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">
            Max Price: ${maxPrice}
          </p>
          <input
            type="range"
            min={50}
            max={1600}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-2 w-full accent-[#E53E00]"
          />

          <button
            onClick={() => setInStock(!inStock)}
            className={`mt-4 w-full rounded-xl px-4 py-3 text-[13px] font-bold border transition ${
              inStock
                ? "bg-[#10B981] text-white border-[#10B981]"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#10B981]"
            }`}
          >
            {inStock ? "In stock VIC: ON" : "In stock VIC: OFF"}
          </button>

          <div className="mt-5 rounded-xl bg-gradient-to-br from-[#E53E00] to-[#C23400] text-white p-4">
            <p className="font-bold">Fleet top up?</p>
            <p className="text-[12px] font-medium mt-1 text-white/80">5 plus units unlocks extra pricing in the quote cart.</p>
          </div>
        </aside>

        <div>
          <motion.div layout className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {list.map((p, i) => <ProductCard key={p.sku} p={p} index={i} />)}
            </AnimatePresence>
          </motion.div>
          {list.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-[#E5E7EB] p-12 text-center">
              <p className="font-display font-bold text-2xl text-[#1A1A2E]">No matches at these filters</p>
              <p className="text-[#6B7280] text-sm mt-2">Try a shorter term like brake, LED or filter, or clear filters.</p>
              <button onClick={clearAll} className="mt-5 bg-[#E53E00] text-white rounded-lg px-6 py-3 text-sm font-bold hover:bg-[#C23400] transition">
                Clear all filters
              </button>
            </div>
          )}
          <p className="mt-8 text-[12px] text-[#9CA3AF] font-medium">
            Showing {list.length} of {PRODUCTS.length} demo lines. Full range spans {BRANDS.length} brands
          </p>
        </div>
      </div>
    </div>
  );
}
