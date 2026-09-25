import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useCatalog } from "../store/catalog";
import { useCompany } from "../store/site";
import ProductCard from "../components/ProductCard";

export default function Shop({ preset }) {
  const { products: PRODUCTS, categories: CATEGORIES } = useCatalog();
  const COMPANY = useCompany();
  const { slug: paramSlug } = useParams();
  const [params] = useSearchParams();
  const slug = preset || paramSlug || null;
  const cat = slug ? CATEGORIES.find((c) => c.slug === slug) : null;
  const urlQ = params.get("q") || "";

  const subs = useMemo(() => [...new Set(PRODUCTS.filter((p) => !slug || p.category === slug).map((p) => p.sub))], [slug, PRODUCTS]);
  const [q, setQ] = useState(urlQ);
  const [sub, setSub] = useState("All");
  const [avail, setAvail] = useState("All");
  const [sort, setSort] = useState("featured");

  /* Keep the filter box in sync when arriving via header search (?q=) while already on /shop. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setQ(urlQ); setSub("All"); }, [urlQ, slug]);

  const items = useMemo(() => {
    const query = (params.get("q") || q).toLowerCase().trim();
    let list = PRODUCTS.filter((p) => (!slug || p.category === slug) && (sub === "All" || p.sub === sub));
    if (avail === "stock") list = list.filter((p) => p.status === "In stock VIC");
    if (avail === "order") list = list.filter((p) => p.status === "Built to order");
    if (avail === "enquiry") list = list.filter((p) => p.price === null);
    if (query) list = list.filter((p) => `${p.sku} ${p.name} ${p.sub}`.toLowerCase().includes(query));
    if (sort === "low") list = [...list].sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    if (sort === "high") list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return list;
  }, [slug, sub, avail, sort, q, params]);

  if (slug && !cat) return <main className="mx-auto max-w-7xl px-4 py-16"><p>Shelf not found. <Link to="/shop" className="font-bold text-navy underline">Shop all</Link></p></main>;

  const sel = "h-11 w-full rounded-md border border-line-dark bg-white px-2.5 text-[13px] font-semibold outline-none focus:border-gold sm:w-auto";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <Link to="/shop" className="hover:text-navy hover:underline">Shop</Link>{cat && <> / <span className="font-semibold text-ink">{cat.name}</span></>}</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">{cat ? cat.name : "Shop All Products"}</h1>
      <p className="mt-1 max-w-2xl text-sm text-steel">{cat ? cat.blurb : "All 36 approved lines across tail lifts, trailer parts and accessories."} {cat && cat.slug === "trailer-parts" ? "All lines enquiry only." : ""}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link to="/shop" className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${!slug ? "bg-ink text-white" : "bg-mist text-steel hover:text-ink"}`}>All</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/shop/${c.slug}`} className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${slug === c.slug ? "bg-gold text-ink" : "bg-mist text-steel hover:text-ink"}`}>{c.name}</Link>
        ))}
      </div>

      <div className="mt-3 grid gap-2 rounded-md border border-line bg-mist p-3 sm:flex sm:flex-wrap sm:items-center">
        <span className="flex h-11 items-center gap-2 rounded-md border border-line-dark bg-white px-3 sm:max-w-xs sm:flex-1">
          <Search size={15} className="shrink-0 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by SKU or keyword" className="w-full bg-transparent text-[13px] outline-none" />
        </span>
        <span className="grid grid-cols-2 gap-2 sm:contents">
          <select value={sub} onChange={(e) => setSub(e.target.value)} className={sel} aria-label="Type">
            <option>All</option>
            {subs.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={avail} onChange={(e) => setAvail(e.target.value)} className={sel} aria-label="Availability">
            <option value="All">All availability</option>
            <option value="stock">In stock VIC</option>
            <option value="order">Built to order</option>
            <option value="enquiry">Enquiry only</option>
          </select>
        </span>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={sel} aria-label="Sort">
          <option value="featured">Featured</option>
          <option value="low">Price low to high</option>
          <option value="high">Price high to low</option>
        </select>
        <span className="text-right font-mono text-[11px] text-faint sm:ml-auto sm:text-left">{items.length} LINES</span>
      </div>

      {items.length === 0
        ? <p className="mt-8 rounded-md border border-line bg-white p-8 text-center text-sm text-steel">No lines match those filters. <button onClick={() => { setQ(""); setSub("All"); setAvail("All"); }} className="font-bold text-navy underline">Clear filters</button> or call <a className="font-bold text-navy underline" href={COMPANY.phoneHref}>{COMPANY.phone}</a>.</p>
        : <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">{items.map((p) => <ProductCard key={p.sku} p={p} joined />)}</div>}
    </main>
  );
}

export function CategoryByParam() {
  const { slug } = useParams();
  const { categories } = useCatalog();
  if (categories.some((c) => c.slug === slug)) return <Shop key={slug} preset={slug} />;
  return <main className="mx-auto max-w-7xl px-4 py-16"><p>Shelf not found. <Link to="/shop" className="font-bold text-navy underline">Shop all</Link></p></main>;
}
