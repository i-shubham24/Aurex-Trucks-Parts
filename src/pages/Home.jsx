import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, ClipboardCheck, Headset, Phone, Truck } from "lucide-react";
import { formatAUD } from "../data/products";
import { useCatalog } from "../store/catalog";
import { FAQS } from "../data/company";
import { useCompany, useSite } from "../store/site";
import { NEWS, TESTIMONIALS } from "../data/content";
import { CAT_IMG, imgFor } from "../data/images";
import { useCart } from "../store/cart";
import ProductCard from "../components/ProductCard";
import SafeImage from "../components/SafeImage";
import { useCategories } from "../hooks/api/useCategories";
import { CategoryTilesSkeleton } from "../components/CategorySkeleton";
import { useCarousel } from "../hooks/api/useCarousel";
import { HeroSkeleton } from "../components/HeroSkeleton";
import { useProducts } from "../hooks/api/useProducts";
import { ProductGridSkeleton } from "../components/ProductCardSkeleton";
import { useBlogs } from "../hooks/api/useBlogs";

const WEB = (n) => `/images/web/${n}.jpg`;

function SecHead({ title, link, linkLabel }) {
  const Cmp = link && link.startsWith("/") ? Link : "a";
  const props = link && link.startsWith("/") ? { to: link } : { href: link };
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-extrabold tracking-tight md:text-[28px]">{title}</h2>
      {link && <Cmp {...props} className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-steel transition-colors hover:text-navy">{linkLabel || "View all"} <ArrowRight size={14} /></Cmp>}
    </div>
  );
}

function Hero() {
  const { data: slides = [], isLoading, isError } = useCarousel();
  const [i, setI] = useState(0);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setI((v) => (v + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setI((v) => (v - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides]);

  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (isError || !slides || slides.length === 0) {
    return null;
  }

  const s = slides[i] || slides[0];
  const imageSrc = s.image?.url || s.img;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4">
      <div className="group/hero relative grid overflow-hidden rounded-lg bg-mist md:grid-cols-2 md:items-center">
        <div className="px-6 py-12 md:px-12 md:py-16" key={`t-${i}-${s.id || s.title}`}>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-[56px]">{s.title}</h1>
          <p className="mt-3 max-w-sm text-[15px] leading-6 text-steel">{s.subtitle || s.sub}</p>
          <div className="mt-6 flex gap-2.5 sm:gap-3">
            <Link
              to={s.buttonLink || s.href || "/shop"}
              className="flex-1 whitespace-nowrap bg-gold px-4 py-3 text-center text-[13px] font-bold text-ink transition-colors hover:bg-navy hover:text-white sm:flex-none sm:px-7 sm:text-sm"
            >
              {s.buttonText || "Explore Products"}
            </Link>
            <Link
              to={s.enquiryHref || "/tail-lift-enquiry"}
              className="flex-1 whitespace-nowrap border border-ink px-4 py-3 text-center text-[13px] font-bold transition-colors hover:bg-ink hover:text-white sm:flex-none sm:px-7 sm:text-sm"
            >
              Enquiry
            </Link>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <div className="flex gap-1.5">
              {slides.map((x, k) => (
                <button
                  key={x.id || x.img || k}
                  onClick={() => setI(k)}
                  aria-label={`Slide ${k + 1}`}
                  className={`h-1.5 rounded-sm transition-all ${k === i ? "w-8 bg-gold" : "w-2.5 bg-line-dark hover:bg-faint"}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 pl-2">
              <button
                onClick={prevSlide}
                aria-label="Previous slide"
                className="flex h-7 w-7 items-center justify-center rounded border border-line bg-white text-ink transition-colors hover:border-gold hover:bg-gold"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="flex h-7 w-7 items-center justify-center rounded border border-line bg-white text-ink transition-colors hover:border-gold hover:bg-gold"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="relative min-h-[260px] md:min-h-[380px]" key={`i-${i}-${s.id || s.title}`}>
          <div className="hero-slide absolute inset-y-4 right-6 left-16 rounded-md bg-gold/50 blur-[1px] md:left-24" />
          {imageSrc && (
            <img
              src={imageSrc}
              alt={s.title}
              fetchPriority="high"
              className="hero-slide absolute inset-0 h-full w-full rounded-r-lg object-cover [clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]"
            />
          )}
        </div>

        {/* Floating Desktop Next / Previous Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/90 text-ink shadow-md backdrop-blur transition-all hover:bg-gold hover:border-gold hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/90 text-ink shadow-md backdrop-blur transition-all hover:bg-gold hover:border-gold hover:scale-105 active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

function Tiles() {
  const { data: categories = [], isLoading, isError } = useCategories();

  if (isLoading) {
    return <CategoryTilesSkeleton count={3} />;
  }

  if (isError || !categories || categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="mx-auto grid max-w-7xl scroll-mt-24 gap-4 px-4 pt-6 md:grid-cols-3">
      {categories.slice(0, 3).map((c) => {
        const imageSrc = c.image?.url || c.imageUrl;
        const lineCount = c.count ?? c.productCount ?? 0;
        return (
          <Link
            key={c.slug || c.id}
            to={`/shop/${c.slug}`}
            className="card-zoom group grid grid-cols-2 items-center overflow-hidden rounded-md border border-line bg-mist transition-colors hover:border-gold"
          >
            <span className="p-4 md:p-5">
              <span className="block text-xl font-extrabold leading-tight md:text-2xl">{c.name}</span>
              <span className="tabular mt-1.5 block text-sm font-extrabold text-primary">
                {c.tag || `${lineCount} lines`}
              </span>
              <span className="mt-2.5 inline-block bg-mist px-3 py-1.5 text-xs font-bold transition-colors group-hover:bg-gold">
                {lineCount} lines →
              </span>
            </span>
            <span className="block h-full min-h-[110px] overflow-hidden bg-mist">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-line/40" />
              )}
            </span>
          </Link>
        );
      })}
    </section>
  );
}

const TABS = [
  { id: "best", label: "Best Sellers" },
  { id: "trailer-parts", label: "Trailer Parts" },
  { id: "accessories", label: "Accessories" },
  { id: "tail-lifts", label: "Tail Lifts" },
];

function Arrivals() {
  const [tab, setTab] = useState("best");

  const queryParams = {
    category: tab === "best" ? undefined : tab,
    sort: tab === "best" ? "popular" : "newest",
    limit: 10,
  };

  const { data, isLoading } = useProducts(queryParams);
  const items = data?.products || [];

  return (
    <section id="bestsellers" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-10">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-[28px]">Hot Deals</h2>
        <div className="mt-2.5 flex justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border px-4 py-1.5 text-[13px] font-bold transition-colors ${
                tab === t.id
                  ? "border-gold bg-gold text-ink"
                  : "border-line-dark bg-white text-steel hover:border-ink hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={10} />
      ) : items.length > 0 ? (
        <div className="cap-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {items.map((p) => (
            <ProductCard key={p.sku || p.id} p={p} bare joined badges={false} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-steel">No products found in this category.</div>
      )}
    </section>
  );
}


function LiftsBand() {
  const ref = useRef(null);
  const { data, isLoading } = useProducts({ category: "tail-lifts", limit: 20 });
  const items = data?.products || [];

  return (
    <section className="mt-10 bg-ink py-10 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              <span className="inline-block h-4 w-1.5 bg-gold" />Tail lifts
            </p>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-white md:text-[22px]">
              Sized for Aussie Bodies
            </h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              aria-label="Previous"
              onClick={() => ref.current?.scrollBy({ left: -480, behavior: "smooth" })}
              className="grid h-8 w-8 place-items-center rounded-md border border-gray-600 text-white transition-colors hover:border-gold hover:text-gold"
            >
              ←
            </button>
            <button
              aria-label="Next"
              onClick={() => ref.current?.scrollBy({ left: 480, behavior: "smooth" })}
              className="grid h-8 w-8 place-items-center rounded-md bg-gold font-bold text-ink transition-colors hover:bg-white"
            >
              →
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="w-[270px] shrink-0 rounded-md border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-3 md:w-[300px]">
                <div className="shimmer aspect-[4/3] w-full rounded bg-zinc-800" />
                <div className="shimmer h-3.5 w-24 rounded bg-zinc-800" />
                <div className="shimmer h-5 w-3/4 rounded bg-zinc-800" />
                <div className="shimmer h-3 w-1/2 rounded bg-zinc-800" />
                <div className="flex items-center justify-between pt-2">
                  <div className="shimmer h-6 w-24 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1">
            {items.map((p) => (
              <div key={p.sku || p.id} className="w-[270px] shrink-0 snap-start md:w-[300px]">
                <ProductCard key={p.sku || p.id} p={p} bare badges={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TrailerBlock() {
  const { data, isLoading } = useProducts({ category: "trailer-parts", limit: 10 });
  const COMPANY = useCompany();
  const parts = data?.products || [];
  const totalCount = data?.pagination?.total || data?.total || 107;

  return (
    <section id="cat-trailer-parts" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-[28px]">Trailer Parts, Priced on Enquiry</h2>
          <p className="mt-1 max-w-xl text-[13px] text-steel">
            Profiles and hands vary. Call{" "}
            <a className="font-bold text-primary hover:underline" href={COMPANY.phoneHref}>
              {COMPANY.phone}
            </a>{" "}
            with photos and measurements.
          </p>
        </div>
        <Link
          to="/shop/trailer-parts"
          className="btn-fill border border-ink px-5 py-2.5 text-sm font-bold transition-colors hover:bg-navy hover:border-navy hover:text-white"
        >
          View All {totalCount} Trailer Parts →
        </Link>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={10} />
      ) : parts.length > 0 ? (
        <div className="cap-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {parts.map((p) => (
            <ProductCard key={p.sku || p.id} p={p} joined badges={false} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-steel">No trailer parts currently available.</div>
      )}
    </section>
  );
}

function CounterBand() {
  const COMPANY = useCompany();
  return (
    <section className="mt-12 bg-mist border-y border-line">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded bg-gold/20 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              <span className="h-2 w-2 rounded-full bg-gold" />
              Campbellfield Trade Desk & Warehouse
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              149+ Commercial Lines in Stock. Pick Up Today.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-steel">
              Our Campbellfield hub holds complete inventory for heavy transport fleets, commercial bodybuilders, and repair workshops. Walk in for trade counter collection or organise same-day dispatch.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-line bg-white p-3.5 shadow-xs">
                <p className="font-mono text-xs font-bold uppercase text-primary">Trade Desk Hours</p>
                <p className="mt-1 text-sm font-bold text-ink">Mon – Fri: 9:00am – 5:00pm</p>
                <p className="text-xs text-steel">Saturday: 9:00am – 12:00pm</p>
              </div>
              <div className="rounded-md border border-line bg-white p-3.5 shadow-xs">
                <p className="font-mono text-xs font-bold uppercase text-primary">Daily Dispatch</p>
                <p className="mt-1 text-sm font-bold text-ink">Express Freight Aus-Wide</p>
                <p className="text-xs text-steel">Same-day dispatch for orders by 2pm</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={COMPANY.phoneHref}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy"
              >
                <Phone size={15} />
                Call Trade Desk: {COMPANY.phone}
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 rounded-md border border-ink bg-white px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-gold hover:border-gold"
              >
                Directions & Hours <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-lg border-2 border-ink bg-white shadow-[0_16px_36px_rgba(0,32,73,0.14)]">
              <img
                src={WEB("campbellfield-trade-counter")}
                alt="Aurex Truck Parts Campbellfield Trade Counter and Warehouse"
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="absolute top-3 left-3 rounded bg-navy/90 px-3 py-1.5 font-mono text-xs font-bold text-white shadow backdrop-blur-xs">
                MELBOURNE WAREHOUSE • VIC 3061
              </div>
              <div className="absolute bottom-3 right-3 rounded-md bg-gold px-4 py-2 text-center text-xs font-black uppercase tracking-wider text-ink shadow-lg">
                <span className="block text-base leading-none font-extrabold">149+</span>
                <span>Lines In Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const TAG_LINKS = { "Tail Lifts": "/shop/tail-lifts", "Trailer Parts": "/shop/trailer-parts", "Accessories": "/shop/accessories", "Tool Boxes": "/shop/accessories" };

const articleHref = (n) => (n.slug ? `/news/${n.slug}` : TAG_LINKS[n.tag] || "/shop");

function Blog() {
  const COMPANY = useCompany();
  const { data: blogData, isLoading } = useBlogs({ limit: 4 });
  const posts = blogData?.blogs && blogData.blogs.length > 0 ? blogData.blogs : NEWS.slice(0, 4);
  const [lead, ...rest] = posts;

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="shimmer aspect-[16/9] w-full rounded-md bg-mist" />
          <div className="grid gap-4">
            <div className="shimmer h-24 w-full rounded-md bg-mist" />
            <div className="shimmer h-24 w-full rounded-md bg-mist" />
            <div className="shimmer h-24 w-full rounded-md bg-mist" />
          </div>
        </div>
      </section>
    );
  }

  if (!lead) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-faint">From the counter</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">Stock Notes & Workshop News</h2>
        </div>
        <span className="font-mono text-[11px] font-bold text-faint">N01 / N{String(posts.length).padStart(2, "0")}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Link to={articleHref(lead)} className="card-zoom group grid border-2 border-ink bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,32,73,0.18)]">
          <span className="relative block overflow-hidden bg-mist">
            <SafeImage
              src={lead.coverImage || lead.img}
              alt={lead.title}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
              fallbackIconSize={32}
            />
            <span className="absolute left-3 top-3 bg-gold px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink">{lead.tag}</span>
          </span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2 p-5">
            <span className="font-mono text-[11px] font-bold text-faint">{lead.date.toUpperCase()}</span>
            <span className="min-w-52 flex-1">
              <span className="block text-xl font-extrabold leading-snug transition-colors group-hover:text-navy md:text-2xl">{lead.title}</span>
            </span>
            <span className="text-[13px] font-bold text-navy underline underline-offset-4 transition-all group-hover:gap-2 group-hover:text-gold">Read →</span>
          </span>
        </Link>
        <div className="grid content-start gap-4">
          {rest.map((n, k) => (
            <Link key={n.slug || n.id || n.title} to={articleHref(n)} className="card-zoom group grid grid-cols-[140px_minmax(0,1fr)] border-2 border-ink bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,32,73,0.18)] sm:grid-cols-[200px_minmax(0,1fr)]">
              <span className="relative block min-h-full overflow-hidden bg-mist">
                <SafeImage
                  src={n.coverImage || n.img}
                  alt={n.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                  fallbackIconSize={20}
                />
              </span>
              <span className="flex min-w-0 flex-col justify-center gap-1.5 p-4">
                <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
                  <span className="text-gold">N{String(k + 2).padStart(2, "0")}</span> {n.date.toUpperCase()} · {n.tag.toUpperCase()}
                </span>
                <span className="text-[16px] font-extrabold leading-snug transition-colors group-hover:text-navy">{n.title}</span>
                <span className="text-[13px] font-bold text-navy underline underline-offset-4 transition-colors group-hover:text-gold">Read →</span>
              </span>
            </Link>
          ))}
          <a href={COMPANY.phoneHref} className="flex items-center justify-between gap-3 rounded-md border border-gold bg-gold/15 px-5 py-4 transition-colors hover:bg-gold/25">
            <span className="text-[15px] font-extrabold text-ink">After something older? Ask the counter.</span>
            <span className="tabular shrink-0 font-mono text-[11px] font-bold text-navy">{COMPANY.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const COMPANY = useCompany();
  const { settings } = useSite();
  const items = [
    [Truck, "Daily Freight Australia Wide", `Order by 2pm. Free road freight over ${formatAUD(settings.freeFreightOver || 500)}.`],
    [ClipboardCheck, "Quotes in 4 Business Hours", "Send VIN or photos for an exact price."],
    [BadgeCheck, "VIN Matched Catalogue", "Every line crossed to make, model and OEM."],
    [Headset, "Talk to a Specialist", `${COMPANY.phone}. Real advice, no scripts.`],
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([Icon, t, d]) => (
          <div key={t} className="group rounded-md border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-gold text-ink transition-colors group-hover:bg-navy group-hover:text-white"><Icon size={19} /></span>
            <p className="mt-3 text-sm font-bold">{t}</p>
            <p className="mt-1 text-[13px] leading-5 text-steel">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Reviews() {
  const items = TESTIMONIALS;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [paused, items.length]);
  const r = items[i];
  const initials = r.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <section id="reviews" className="mt-12 scroll-mt-24 overflow-hidden bg-ink py-14 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

        <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold"><span className="inline-block h-4 w-1.5 bg-gold" />Reviews</p>
        <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white md:text-[28px]">Trusted at Counters Across the Country</h2>
        <div key={i} className="mt-6">
          <p className="font-serif text-6xl leading-none text-gold">“</p>
          <blockquote className="-mt-4 text-xl font-medium leading-8 text-white md:text-2xl md:leading-10">{r.quote}</blockquote>
          <div className="mt-5 flex items-center justify-center gap-1 text-gold">{"★★★★★"}</div>
          <p className="mt-3 flex items-center justify-center gap-2.5">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md bg-gold text-sm font-extrabold text-ink ring-2 ring-gold/60">
              {initials}
              {r.img && <img src={r.img} alt={r.name} loading="lazy" onError={(e) => e.currentTarget.remove()} className="absolute inset-0 h-full w-full object-cover" />}
            </span>
            <span className="text-left"><span className="block text-sm font-bold text-white">{r.name}</span><span className="block text-xs text-gray-400">{r.role}</span></span>
          </p>
        </div>
        <div className="mt-7 flex items-center justify-center gap-4">
          <button onClick={() => setI((i + items.length - 1) % items.length)} aria-label="Previous review" className="grid h-8 w-8 place-items-center rounded-md border border-gray-600 text-white transition-colors hover:border-gold hover:text-gold">←</button>
          <div className="flex gap-1.5">
            {items.map((x, k) => <button key={x.name} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className={`h-1.5 rounded-sm transition-all ${k === i ? "w-8 bg-gold" : "w-2.5 bg-gray-600 hover:bg-gray-400"}`} />)}
          </div>
          <button onClick={() => setI((i + 1) % items.length)} aria-label="Next review" className="grid h-8 w-8 place-items-center rounded-md bg-gold font-bold text-ink transition-colors hover:bg-white">→</button>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  const COMPANY = useCompany();
  const { settings } = useSite();
  const freeOver = formatAUD(settings.freeFreightOver || 500);
  return (
    <section id="faq" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-12">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-44 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">Straight Answers</h2>
          <p className="mt-2 text-sm leading-6 text-steel">The questions we hear at the counter every week. Anything else, call and ask.</p>
          <a href={COMPANY.phoneHref} className="mt-4 flex items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-bold text-white transition-colors hover:bg-navy"><Phone size={15} /> {COMPANY.phone}</a>
          <Link to="/contact" className="mt-2 block rounded-md border border-line-dark py-3 text-center text-sm font-bold transition-colors hover:border-navy hover:text-navy">Contact Page →</Link>
        </div>
        <div className="divide-y divide-line rounded-md border border-line bg-white">
          {FAQS.map((f, k) => {
            const isOpen = open === k;
            return (
              <div key={f.q}>
                <button onClick={() => setOpen(isOpen ? -1 : k)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
                  <span className={`font-mono text-xs ${isOpen ? "text-primary" : "text-faint"}`}>{String(k + 1).padStart(2, "0")}</span>
                  <span className={`flex-1 text-[15px] font-bold ${isOpen ? "text-primary" : ""}`}>{f.q}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-lg font-bold leading-none transition-all duration-200 ${isOpen ? "rotate-45 bg-primary text-white" : "bg-mist text-ink"}`}>+</span>
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden"><p className="px-5 pb-5 pl-[52px] text-sm leading-6 text-steel">{f.a.split("$500").join(freeOver)}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Tiles />
      <Arrivals />
      <LiftsBand />
      <TrailerBlock />
      <CounterBand />
      <Blog />
      <Trust />
      <Reviews />
      <Faq />
    </main>
  );
}
