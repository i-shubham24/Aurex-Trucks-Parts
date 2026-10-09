import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useCompany } from "../store/site";
import ProductCard from "../components/ProductCard";
import ThemeSelect from "../components/ThemeSelect";
import { useCategories } from "../hooks/api/useCategories";
import { useProducts } from "../hooks/api/useProducts";
import { ProductGridSkeleton } from "../components/ProductCardSkeleton";
import { makeMatcher } from "../utils/search";

// Part-number order: ATP-ACC-01, -02 … then ATP-TL-…, ATP-TP-… (numeric, so -99 sorts before -100).
const bySku = (a, b) => String(a.sku).localeCompare(String(b.sku), "en", { numeric: true });

export default function Shop({ preset }) {
  const COMPANY = useCompany();
  const { slug: paramSlug } = useParams();
  const [params] = useSearchParams();
  const slug = preset || paramSlug || null;

  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const cat = slug ? categories.find((c) => c.slug === slug) : null;
  const urlQ = params.get("q") || "";

  const [q, setQ] = useState(urlQ);
  const [sub, setSub] = useState("All");
  const [avail, setAvail] = useState("All");
  const [sort, setSort] = useState("sku");

  // Keep the filter box in sync when arriving via header search (?q=) while already on /shop.
  useEffect(() => {
    setQ(urlQ);
    setSub("All");
  }, [urlQ, slug]);

  const queryParams = {
    category: slug || undefined,
    limit: 500,
  };

  const { data, isLoading: prodsLoading } = useProducts(queryParams);
  const rawProducts = data?.products || [];

  const subs = useMemo(
    () => ["All", ...new Set(rawProducts.filter((p) => p.sub).map((p) => p.sub))],
    [rawProducts]
  );

  const items = useMemo(() => {
    const query = (params.get("q") || q).toLowerCase().trim();
    let list = rawProducts.filter((p) => sub === "All" || p.sub === sub);
    if (avail === "stock") list = list.filter((p) => String(p.status).toLowerCase().includes("in stock") || p.inventory?.stock > 0);
    if (avail === "order") list = list.filter((p) => String(p.status).toLowerCase().includes("order"));
    if (avail === "enquiry") list = list.filter((p) => p.price === null);
    if (query) {
      const matches = makeMatcher(query);
      list = list.filter((p) => matches(`${p.sku} ${p.name} ${p.sub}`));
    }
    if (sort === "sku") list = [...list].sort(bySku);
    if (sort === "low") list = [...list].sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    if (sort === "high") list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return list;
  }, [rawProducts, sub, avail, sort, q, params]);

  const isLoading = catsLoading || prodsLoading;

  if (!catsLoading && slug && !cat) {
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
            onChange={(e) => setQ(e.target.value)}
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
        <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {items.map((p) => (
            <ProductCard key={p.sku || p.id} p={p} joined />
          ))}
        </div>
      )}
    </main>
  );
}

export function CategoryByParam() {
  const { slug } = useParams();
  const { data: categories = [], isLoading } = useCategories();
  
  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <ProductGridSkeleton count={10} />
      </main>
    );
  }

  if (categories.some((c) => c.slug === slug)) {
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
