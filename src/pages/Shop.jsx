import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShieldCheck, Truck, RotateCcw, ArrowRight } from "lucide-react";
import Fuse from "fuse.js";
import { PRODUCTS as SEED, BRANDS, HERO } from "../data/catalog.js";
import { FIT_RANK } from "../data/fitment.js";
import { useProducts } from "../store/products.jsx";
import { useSite } from "../store/site.jsx";
import { ProductCard, Dropdown, SafeImg } from "../components/ui.jsx";
import { useShop } from "../store/shop.jsx";
import { useGarage } from "../components/garage/GarageContext.jsx";
import FitmentBanner from "../components/garage/FitmentBanner.jsx";

// Category names already contain their noun ("Trailer Parts", "Tail Lifts"),
// so highlight the last word in silver instead of appending "parts." again.
function CategoryTitle({ name }) {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return <>{name}<span className="text-[#C7CDD6]">.</span></>;
  return <>{words.slice(0, -1).join(" ")} <span className="text-[#C7CDD6]">{words[words.length - 1]}.</span></>;
}

export default function Shop() {
  const { query, setQuery } = useShop();
  const { products: PRODUCTS } = useProducts();
  const { liveCategories: CATEGORIES } = useSite();
  const { fitStatus, hasValidVehicle } = useGarage();
  const [params] = useSearchParams();
  const catParam = params.get("cat") || "All";
  const qParam = params.get("q") || "";
  const [cat, setCat] = useState(catParam);
  const [brand, setBrand] = useState("All brands");
  const [sort, setSort] = useState("Popular");
  const [maxPrice, setMaxPrice] = useState(1600);
  const [inStock, setInStock] = useState(false);
  const [onlyFits, setOnlyFits] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep the filter in sync when the category or query in the URL changes (nav clicks, mega menu).
  useEffect(() => { setCat(catParam); }, [catParam]);
  useEffect(() => { if (qParam) setQuery(qParam); }, [qParam, setQuery]);

  const fuse = useMemo(() => new Fuse(PRODUCTS, { keys: ['name', 'sku', 'brand'], threshold: 0.3 }), [PRODUCTS]);

  // Basic facet filter first.
  const base = useMemo(() => {
    let results = PRODUCTS;
    if (query.trim() !== "") {
      results = fuse.search(query).map(r => r.item);
    }
    return results.filter((p) => {
      const okCat = cat === "All" || p.cat === cat;
      const okBrand = brand === "All brands" || p.brand === brand;
      const okP = p.price == null || p.price <= maxPrice;
      const okS = !inStock || p.stock.includes("In stock");
      return okCat && okBrand && okP && okS;
    });
  }, [PRODUCTS, cat, brand, query, maxPrice, inStock, fuse]);

  // Parts that fit the selected truck, for the banner count.
  const fitCount = useMemo(
    () => (hasValidVehicle ? base.filter((p) => ["fits", "universal"].includes(fitStatus(p))).length : 0),
    [base, hasValidVehicle, fitStatus]
  );

  const list = useMemo(() => {
    let l = base;
    if (hasValidVehicle && onlyFits) l = l.filter((p) => ["fits", "universal"].includes(fitStatus(p)));
    const bySort = (a, b) => {
      if (sort === "Low to High") return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sort === "High to Low") return (b.price ?? -1) - (a.price ?? -1);
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
  const activeCat = cat !== "All" ? CATEGORIES.find((c) => c.name === cat) : null;

  return (
    <div>
      {/* Category hero, changes with the selected system */}
      <section className="relative bg-[#1A1A2E] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeCat?.name || "all"} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
              <SafeImg src={activeCat?.image || HERO.dark} alt="" label="AUREX" className="w-full h-full object-cover opacity-45" wrapClass="w-full h-full" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 grid-scrim opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E]/85 via-[#1A1A2E]/60 to-transparent" />
          <motion.div aria-hidden animate={{ x: [0, 36, 0], y: [0, -20, 0], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-24 -top-12 w-[420px] h-[420px] rounded-full bg-[#0B2F5C]/15 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-9 min-h-[380px] flex flex-col justify-center">
          <p className="text-[12px] font-semibold text-white/50">
            <Link to="/" className="hover:text-[#2F5E93] transition">Home</Link>
            <span className="mx-1.5">/</span>
            <Link to="/shop" className="hover:text-[#2F5E93] transition">Shop</Link>
            {activeCat && <><span className="mx-1.5">/</span><span className="text-white/80">{activeCat.name}</span></>}
          </p>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="min-w-0 max-w-2xl"
              >
                <p className="text-[12px] font-black tracking-[0.22em] text-[#2F5E93] uppercase mb-2">{activeCat ? "System" : "Full catalogue"}</p>
                <h1 className="font-display font-bold tracking-[-0.02em] text-[36px] sm:text-[54px] leading-[0.92]">
                  {activeCat ? <CategoryTitle name={activeCat.name} /> : <>Shop truck <span className="text-[#C7CDD6]">parts.</span></>}
                </h1>
                <p className="text-white/60 text-[15px] mt-3 max-w-xl leading-relaxed">
                  {activeCat ? `${activeCat.blurb}. In stock in VIC and freighted Australia wide.` : "Filter by system, brand and price. Every card opens full specs plus OEM cross plus fitment."}
                </p>
                {activeCat && activeCat.subs?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeCat.subs.map((s) => (
                      <span key={s} className="clip-cut-sm bg-white/10 border border-white/15 text-white/85 text-[12px] font-semibold px-3 py-1.5">{s}</span>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-semibold text-white/70">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#2F5E93]" /> ADR compliant range</span>
                  <span className="flex items-center gap-1.5"><Truck size={15} className="text-[#2F5E93]" /> Same day dispatch from VIC</span>
                  <span className="flex items-center gap-1.5"><RotateCcw size={15} className="text-[#2F5E93]" /> Free returns on fit errors</span>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="shrink-0 flex items-center gap-3">
              <span className="font-display font-bold text-5xl text-white tabular-nums">{list.length}</span>
              <span className="text-[12px] text-white/50 font-semibold leading-tight">results<br />live in VIC</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 items-center justify-end">
            <div className="clip-cut flex items-center gap-2 bg-white/[0.09] px-5 py-3 w-full sm:w-72 focus-within:bg-white/[0.14] transition">
              <Search size={16} className="text-white/50 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, SKU or brand..."
                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-white/40 text-white"
              />
              {query && <button onClick={() => setQuery("")}><X size={15} className="text-white/50" /></button>}
            </div>
            <Dropdown
              value={sort}
              onChange={setSort}
              align="right"
              options={["Popular", "Low to High", "High to Low", "Top Rated"]}
              className="min-w-[170px]"
            />
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
            <span className="flex items-center gap-3">
              <button onClick={clearAll} className="text-[12px] font-semibold text-[#9CA3AF] hover:text-[#0B2F5C] transition">
                Clear all
              </button>
              <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden text-[12px] font-bold text-[#0B2F5C]">
                {filtersOpen ? "Hide ▲" : "Show ▼"}
              </button>
            </span>
          </div>
          <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>

          <p className="mt-5 text-[11px] font-bold tracking-widest text-[#9CA3AF] uppercase">System</p>
          <div className="mt-2 grid gap-1 max-h-[300px] overflow-auto pr-1">
            {["All", ...CATEGORIES.map((c) => c.name)].map((t) => (
              <button
                key={t}
                onClick={() => setCat(t)}
                className={`clip-cut-sm flex justify-between items-center text-left px-3.5 py-2.5 text-[13px] font-semibold transition ${
                  cat === t
                    ? "bg-[#0B2F5C] text-white"
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
                className={`clip-cut-sm px-3 py-1.5 text-[12px] font-semibold border transition ${
                  brand === b
                    ? "bg-[#0B2F5C] text-white border-[#0B2F5C]"
                    : "border-[#E5E7EB] text-[#6B7280] hover:border-[#0B2F5C] hover:text-[#0B2F5C]"
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
            className="mt-2 w-full accent-[#1A1A2E]"
          />

          <button
            onClick={() => setInStock(!inStock)}
            className={`clip-cut mt-4 w-full px-4 py-3 text-[13px] font-bold border-2 transition ${
              inStock
                ? "bg-[#1A1A2E] text-white border-[#1A1A2E]"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#1A1A2E]"
            }`}
          >
            {inStock ? "In stock VIC: ON" : "In stock VIC: OFF"}
          </button>

          <div className="mt-5 rounded-xl bg-gradient-to-br from-[#0B2F5C] to-[#071E3C] text-white p-4">
            <p className="font-bold">Fleet top up?</p>
            <p className="text-[12px] font-medium mt-1 text-white/80">5 plus units unlocks extra pricing in the quote cart.</p>
          </div>
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
              <p className="text-[#6B7280] text-sm mt-2">Try a shorter term like hinge, lock or track, or clear filters.</p>
              <button onClick={clearAll} className="clip-cut mt-5 bg-[#0B2F5C] text-white px-6 py-3 text-sm font-bold hover:bg-[#1A1A2E] transition">
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
