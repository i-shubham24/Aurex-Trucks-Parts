import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useCompany } from "../store/site";
import ProductCard from "../components/ProductCard";
import ThemeSelect from "../components/ThemeSelect";
import { useCategories, DEFAULT_CATEGORIES } from "../hooks/api/useCategories";
import { useProducts } from "../hooks/api/useProducts";
import { ProductGridSkeleton } from "../components/ProductCardSkeleton";
import { makeMatcher } from "../utils/search";

// Part-number order: ATP-ACC-01, -02 … then ATP-TL-…, ATP-TP-… (numeric, so -99 sorts before -100).
const bySku = (a, b) => String(a.sku).localeCompare(String(b.sku), "en", { numeric: true });

export default function Shop({ preset }) {
  const COMPANY = useCompany();
  const { slug: paramSlug } = useParams();
  const [params, setParams] = useSearchParams();
  const slug = preset || paramSlug || null;

  const { data: catData, isLoading: catsLoading, isError: catsError } = useCategories();
  // If the category list fails (rate limit, timeout) use the built-in one instead of an empty bar.
  const categories = catData?.length ? catData : catsError ? DEFAULT_CATEGORIES : catData || [];
  const cat = slug ? categories.find((c) => c.slug === slug) : null;
  const urlQ = params.get("q") || "";

  const [q, setQ] = useState(urlQ);
  const [sub, setSub] = useState("All");
  const [avail, setAvail] = useState("All");
  const [sort, setSort] = useState("sku");

  // Keep the filter box in sync when arriving via header search (?q=) or URL change.
  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  useEffect(() => {
    setSub("All");
  }, [slug]);

  const handleQueryChange = (val) => {
    setQ(val);
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val.trim()) {
        next.set("q", val.trim());
      } else {
        next.delete("q");
      }
      return next;
    }, { replace: true });
  };

  // Same params as SHOP_CATALOGUE_PARAMS when there is no category, so /shop picks up the boot prefetch.
  const queryParams = {
    category: slug || undefined,
    limit: 500,
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [slug]);

  const { data, isLoading: prodsLoading, isError: prodsError, refetch: refetchProducts, isFetching: prodsFetching } = useProducts(queryParams);
  const rawProducts = data?.products || [];

  const subs = useMemo(
    () => ["All", ...new Set(rawProducts.filter((p) => p.sub).map((p) => p.sub))],
    [rawProducts]
  );

  const items = useMemo(() => {
    const query = q.toLowerCase().trim();
    let list = rawProducts.filter((p) => sub === "All" || p.sub === sub);
    if (avail === "stock") list = list.filter((p) => String(p.status).toLowerCase().includes("in stock") || p.inventory?.stock > 0);
    if (avail === "order") list = list.filter((p) => String(p.status).toLowerCase().includes("order"));
    if (avail === "enquiry") list = list.filter((p) => p.price === null || p.price === 0 || p.isPOA || p.pricing?.isPOA);
    if (query) {
      const matches = makeMatcher(query);
      list = list.filter((p) => matches(`${p.sku} ${p.name} ${p.sub || ''} ${p.fit || ''} ${p.oem || ''} ${p.shortDescription || ''} ${(p.alternatePartNumbers || []).join(' ')}`));
    }
    if (sort === "sku") list = [...list].sort(bySku);
    if (sort === "low") list = [...list].sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    if (sort === "high") list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return list;
  }, [rawProducts, sub, avail, sort, q]);

  const PAGE_CHUNK = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_CHUNK);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(PAGE_CHUNK);
  }, [slug, q, sub, avail, sort]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_CHUNK, items.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const hasMore = visibleCount < items.length;

  const isLoading = catsLoading || prodsLoading;

  // A failed category request is not proof the shelf doesn't exist.
  if (!catsLoading && !catsError && slug && !cat) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Shelf not found</h1>
        <p className="mt-2 text-sm text-steel">We couldn't find the category you're looking for.</p>
        <Link to="/shop" className="mt-4 inline-block rounded bg-gold px-6 py-2.5 text-sm font-bold text-ink">
          Shop all
        </Link>
      </main>
    );
  }

  const AVAIL_OPTS = [
    { value: "All", label: "All availability" },
    { value: "stock", label: "In stock VIC" },
    { value: "order", label: "Built to order" },
    { value: "enquiry", label: "Enquiry only" },
  ];
  const SORT_OPTS = [
    { value: "sku", label: "Part number" },
    { value: "low", label: "Price low to high" },
    { value: "high", label: "Price high to low" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-[12px] text-faint">
        <Link to="/" className="hover:text-navy hover:underline">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-navy hover:underline">Shop All</Link>
        {cat && <> / <span className="font-semibold text-ink">{cat.name}</span></>}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
        {cat ? cat.name : "Shop All Products"}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-steel">
        {cat ? cat.blurb : `All commercial lines across tail lifts, trailer parts and accessories.`}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          to="/shop"
          className={`rounded-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
            !slug ? "bg-ink text-white" : "bg-mist text-steel hover:text-ink"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug || c.id}
            to={`/shop/${c.slug}`}
            className={`rounded-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              slug === c.slug ? "bg-gold text-ink" : "bg-mist text-steel hover:text-ink"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-3 grid gap-2 rounded-md border border-line bg-mist p-3 sm:flex sm:flex-wrap sm:items-center">
        <span className="flex h-11 items-center gap-2 rounded-md border border-line-dark bg-white px-3 sm:max-w-xs sm:flex-1">
          <Search size={15} className="shrink-0 text-faint" />
          <input
            value={q}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Filter by SKU or keyword"
            aria-label="Filter by SKU or keyword"
            className="h-full w-full bg-transparent text-[13px] outline-none"
          />
        </span>
        <span className="grid grid-cols-2 gap-2 sm:contents">
          <ThemeSelect value={sub} onChange={setSub} options={subs} label="Type" mega />
          <ThemeSelect value={avail} onChange={setAvail} options={AVAIL_OPTS} label="Availability" />
        </span>
        <ThemeSelect value={sort} onChange={setSort} options={SORT_OPTS} label="Sort" align="right" />
        <span className="text-right font-mono text-[11px] text-faint sm:ml-auto sm:text-left">
          {isLoading ? "LOADING..." : `${items.length} LINES`}
        </span>
      </div>

      {isLoading ? (
        <div className="mt-4">
          <ProductGridSkeleton count={10} />
        </div>
      ) : prodsError && rawProducts.length === 0 ? (
        <div role="alert" className="mt-8 rounded-md border border-line bg-white p-8 text-center text-sm text-steel">
          <p className="font-bold text-ink">We couldn't load the catalogue just now.</p>
          <p className="mt-1">It is usually back in a moment.</p>
          <button
            type="button"
            onClick={() => refetchProducts()}
            disabled={prodsFetching}
            className="mt-4 rounded bg-gold px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white disabled:opacity-60"
          >
            {prodsFetching ? "Trying again…" : "Try again"}
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="mt-8 rounded-md border border-line bg-white p-8 text-center text-sm text-steel">
          No lines match those filters.{" "}
          <button
            onClick={() => {
              setQ("");
              setSub("All");
              setAvail("All");
            }}
            className="font-bold text-navy underline"
          >
            Clear filters
          </button>{" "}
          or call{" "}
          <a className="font-bold text-navy underline" href={COMPANY.phoneHref}>
            {COMPANY.phone}
          </a>
          .
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
            {visibleItems.map((p) => (
              <ProductCard key={p.sku || p.id} p={p} joined />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="mt-6 flex flex-col items-center justify-center gap-2 py-4">
              <p className="font-mono text-xs text-faint">
                Showing {visibleItems.length} of {items.length} lines
              </p>
              <button
                type="button"
                onClick={() => setVisibleCount((c) => Math.min(c + PAGE_CHUNK, items.length))}
                className="inline-flex items-center gap-1.5 rounded border border-line-dark bg-white px-5 py-2 text-xs font-bold text-ink shadow-sm transition-colors hover:bg-mist"
              >
                Load next {Math.min(PAGE_CHUNK, items.length - visibleCount)} lines
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export function CategoryByParam() {
  const { slug } = useParams();
  const { data: categories = [], isLoading, isError, isPlaceholderData } = useCategories();
  const known = categories.some((c) => c.slug === slug);

  // Placeholder (cached / built-in) categories may not include a newer shelf yet: wait for the real list.
  if (isLoading || (isPlaceholderData && !known)) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <ProductGridSkeleton count={10} />
      </main>
    );
  }

  // If the list failed to load we can't tell the shelf is missing, so show it and let its products load.
  if (known || isError) {
    return <Shop key={slug} preset={slug} />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-ink">Shelf not found</h1>
      <p className="mt-2 text-sm text-steel">We couldn't find the category: {slug}</p>
      <Link to="/shop" className="mt-4 inline-block rounded bg-gold px-6 py-2.5 text-sm font-bold text-ink">
        Shop all
      </Link>
    </main>
  );
}
