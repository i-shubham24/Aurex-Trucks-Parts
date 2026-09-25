import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, ClipboardCheck, Headset, Phone, Truck } from "lucide-react";
import { formatAUD } from "../data/products";
import { useCatalog } from "../store/catalog";
import { FAQS } from "../data/company";
import { useCompany, useSite } from "../store/site";
import { NEWS, TESTIMONIALS } from "../data/content";
import { CAT_IMG, imgFor } from "../data/images";
import { useCart } from "../store/cart";
import ProductCard from "../components/ProductCard";

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

const SLIDES = [
  { img: WEB("hero-roadtrain"), eyebrow: "Australia's heavy body specialist", title: "Tail Lifts That Earn.", sub: "1.5T to 3T aluminium and steel lifts with full kits.", cta: "Shop Tail Lifts", href: "/shop/tail-lifts" },
  { img: WEB("hero-semi"), eyebrow: "Campbellfield VIC stock", title: "Trailer Hardware, Matched.", sub: "Door gear, tracks and stands. Priced on enquiry.", cta: "Enquire Now", href: "/shop/trailer-parts" },
  { img: WEB("port"), eyebrow: "Same day dispatch by 2pm", title: "Accessories Off the Shelf.", sub: "Bars, buffers, boxes and fittings, ready to ship.", cta: "Shop Accessories", href: "/shop/accessories" },
];

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);
  const s = SLIDES[i];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4">
      <div className="relative grid overflow-hidden rounded-lg bg-mist md:grid-cols-2 md:items-center">
        <div className="px-6 py-12 md:px-12 md:py-16" key={`t-${i}`}>
          <p className="inline-flex items-center gap-2.5 bg-ink px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white"><span className="inline-block h-4 w-1.5 bg-gold" />{s.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-[56px]">{s.title}</h1>
          <p className="mt-3 max-w-sm text-[15px] leading-6 text-steel">{s.sub}</p>
          <div className="mt-6 flex gap-2.5 sm:gap-3"><Link to={s.href} className="flex-1 whitespace-nowrap bg-gold px-4 py-3 text-center text-[13px] font-bold text-ink transition-colors hover:bg-navy hover:text-white sm:flex-none sm:px-7 sm:text-sm">Shop Now</Link><a href="#bestsellers" className="flex-1 whitespace-nowrap border border-ink px-4 py-3 text-center text-[13px] font-bold transition-colors hover:bg-ink hover:text-white sm:flex-none sm:px-7 sm:text-sm">Best Sellers</a></div>
          <div className="mt-7 flex gap-1.5">
            {SLIDES.map((x, k) => <button key={x.img} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? "w-7 bg-gold" : "w-2 bg-line-dark hover:bg-faint"}`} />)}
          </div>
        </div>
        <div className="relative min-h-[260px] md:min-h-[380px]" key={`i-${i}`}>
          <div className="hero-slide absolute inset-y-4 right-6 left-16 rounded-full bg-gold/50 blur-[1px] md:left-24" />
          <img src={s.img} alt={s.title} fetchPriority="high" className="hero-slide absolute inset-0 h-full w-full rounded-r-lg object-cover [clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]" />
        </div>
      </div>
    </section>
  );
}

function Tiles() {
  const { categories } = useCatalog();
  const prices = { "tail-lifts": "From $3,850", "trailer-parts": "Priced on enquiry", "accessories": "From $4.50" };
  return (
    <section id="categories" className="mx-auto grid max-w-7xl scroll-mt-24 gap-4 px-4 pt-6 md:grid-cols-3">
      {categories.slice(0, 3).map((c) => (
        <Link key={c.slug} to={`/shop/${c.slug}`} className="card-zoom group grid grid-cols-2 items-center overflow-hidden rounded-md border border-line bg-mist transition-colors hover:border-gold">
          <span className="p-4 md:p-5"><span className="block text-xl font-extrabold leading-tight md:text-2xl">{c.name}</span><span className="tabular mt-1.5 block text-sm font-extrabold text-primary">{prices[c.slug] || `${c.count} lines`}</span><span className="mt-2.5 inline-block bg-mist px-3 py-1.5 text-xs font-bold transition-colors group-hover:bg-gold">{c.count} lines →</span></span>
          <span className="block h-full min-h-[110px] overflow-hidden bg-mist">{CAT_IMG[c.slug] && <img src={CAT_IMG[c.slug]} alt={c.name} loading="lazy" className="h-full w-full object-cover" />}</span>
        </Link>
      ))}
    </section>
  );
}

const TABS = [
  { id: "best", label: "Best Sellers" },
  { id: "tail-lifts", label: "Tail Lifts" },
  { id: "accessories", label: "Accessories" },
];

function Arrivals() {
  const [tab, setTab] = useState("best");
  const { products } = useCatalog();
  const best = ["TL-20-2450-2400", "TL-15-2450-2400", "GL-25126", "GL-15616", "PU-12V-22KW", "TL-20-2450-2200", "A20-01S-06", "GL-16513", "GL-19120", "GL-23116"].map((s) => products.find((p) => p.sku === s)).filter(Boolean);
  const lifts = products.filter((p) => p.category === "tail-lifts").slice(0, 5);
  const accs = products.filter((p) => p.category === "accessories").slice(0, 10);
  const items = tab === "best" ? best : tab === "tail-lifts" ? lifts : accs;
  return (
    <section id="bestsellers" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-10">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-[28px]">Hot Deals</h2>
        <div className="mt-2.5 flex justify-center gap-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`border px-4 py-1.5 text-[13px] font-bold transition-colors ${tab === t.id ? "border-gold bg-gold text-ink" : "border-line-dark bg-white text-steel hover:border-ink hover:text-ink"}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="cap-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">{items.map((p) => <ProductCard key={p.sku} p={p} bare joined badges={false} />)}</div>
    </section>
  );
}

function SubTiles() {
  const tiles = [
    ["Door Gear", "GL-11113", "#cat-trailer-parts"], ["Hinges", "GL-13112", "#cat-trailer-parts"],
    ["Tracks", "GL-19113H1", "#cat-trailer-parts"], ["Canvas Stands", "CANVAS-1995-1600", "#cat-trailer-parts"],
    ["Tool Boxes", "GL-25126", "#cat-accessories"], ["Latches", "A20-01S-06", "#cat-accessories"],
    ["Load Restraint", "GL-15616", "#cat-accessories"], ["Power Units", "PU-12V-22KW", "#cat-tail-lifts"],
  ];
  return (
    <section className="mt-10 bg-mist py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-4 text-center text-xl font-extrabold tracking-tight md:text-[22px]">Popular Categories</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map(([label, sku, href]) => (
            <a key={label} href={href} className="group flex items-center gap-3 rounded-md border border-line bg-white p-2.5 transition-colors hover:border-gold">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded bg-mist">{imgFor(sku) && <img src={imgFor(sku)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />}</span>
              <span className="text-[13px] font-bold leading-snug transition-colors group-hover:text-navy">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow() {
  const { add } = useCart();
  const { products } = useCatalog();
  const f = products.find((p) => p.sku === "GL-25126");
  const rest = ["GL-15616", "GL-23116", "GL-ASJ04", "GL-19120", "GL-19117"].map((s) => products.find((p) => p.sku === s)).filter(Boolean);
  if (!f) return null;
  return (
    <section id="cat-accessories" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-10">
      <SecHead title="Accessories & Parts" link="#cat-accessories" linkLabel="Shop all 17" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-zoom rounded-md border border-gold bg-gold/10 p-4">
          <div className="overflow-hidden rounded bg-white"><img src={imgFor(f.sku)} alt={f.name} loading="lazy" className="aspect-square w-full object-cover" /></div>
          <p className="mt-3 text-[15px] font-extrabold leading-snug">{f.name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px]"><span className="text-gold">{"★★★★★"}</span><span className="text-faint">({f.reviews} Reviews)</span></div>
          <p className="tabular mt-1.5 text-xl font-extrabold text-primary">{formatAUD(f.price)}</p>
          <button onClick={() => add(f)} className="mt-2.5 w-full rounded bg-gold py-2 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Add to Cart</button>
        </div>
        <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5 md:col-span-2">{rest.map((p) => <ProductCard key={p.sku} p={p} joined badges={false} />)}</div>
      </div>
      <span id="cat-tail-lifts" className="scroll-mt-24" />
    </section>
  );
}

function LiftsBand() {
  const ref = useRef(null);
  const { products } = useCatalog();
  const items = products.filter((p) => p.category === "tail-lifts");
  return (
    <section className="mt-10 bg-ink py-10 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold"><span className="inline-block h-4 w-1.5 bg-gold" />Tail lifts</p><h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-white md:text-[22px]">Sized for Aussie Bodies</h2></div>
          <div className="flex shrink-0 gap-2">
            <button aria-label="Previous" onClick={() => ref.current?.scrollBy({ left: -480, behavior: "smooth" })} className="grid h-9 w-9 place-items-center rounded-full border border-gray-600 text-white transition-colors hover:border-gold hover:text-gold">←</button>
            <button aria-label="Next" onClick={() => ref.current?.scrollBy({ left: 480, behavior: "smooth" })} className="grid h-9 w-9 place-items-center rounded-full bg-gold font-bold text-ink transition-colors hover:bg-white">→</button>
          </div>
        </div>
        <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1">{items.map((p) => <div key={p.sku} className="w-[270px] shrink-0 snap-start md:w-[300px]"><ProductCard key={p.sku} p={p} bare badges={false} /></div>)}</div>
      </div>
    </section>
  );
}

function TrailerBlock() {
  const [all, setAll] = useState(false);
  const { products } = useCatalog();
  const COMPANY = useCompany();
  const parts = products.filter((p) => p.category === "trailer-parts");
  const shown = all ? parts : parts.slice(0, 10);
  return (
    <section id="cat-trailer-parts" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-[28px]">Trailer Parts, Priced on Enquiry</h2>
          <p className="mt-1 max-w-xl text-[13px] text-steel">Profiles and hands vary. Call <a className="font-bold text-primary hover:underline" href={COMPANY.phoneHref}>{COMPANY.phone}</a> with photos and measurements.</p>
        </div>
        <button onClick={() => setAll(!all)} className="btn-fill border border-ink px-5 py-2.5 text-sm font-bold transition-colors hover:text-white">{all ? "Show Less" : `View All ${parts.length} Trailer Parts →`}</button>
      </div>
      <div className="cap-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">{shown.map((p) => <ProductCard key={p.sku} p={p} joined badges={false} />)}</div>
    </section>
  );
}

function CounterBand() {
  const COMPANY = useCompany();
  return (
    <section className="mt-10 bg-mist">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-steel">Campbellfield trade counter</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">36 Approved Lines. VIN Matched. Freighted Daily.</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-steel">Tail lifts, trailer hardware and accessories, checked twice and shipped fast across Australia.</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a href={COMPANY.phoneHref} className="rounded bg-ink px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy">Call {COMPANY.phone}</a>
            <a href="#bestsellers" className="rounded border border-ink px-6 py-2.5 text-sm font-bold transition-colors hover:bg-ink hover:text-white">Shop Best Sellers</a>
          </div>
        </div>
        <div className="relative">
          <span className="block overflow-hidden rounded-md border border-line"><img src={WEB("warehouse")} alt="Stocked warehouse" loading="lazy" className="aspect-[16/7] w-full object-cover" /></span>
          <span className="absolute -bottom-4 right-6 grid h-20 w-20 place-items-center rounded-full bg-gold text-center text-xs font-extrabold leading-tight text-ink shadow-lg">36<br />LINES</span>
        </div>
      </div>
    </section>
  );
}

const TAG_LINKS = { "Tail Lifts": "/shop/tail-lifts", "Trailer Parts": "/shop/trailer-parts", "Accessories": "/shop/accessories", "Tool Boxes": "/shop/accessories" };

const articleHref = (n) => (n.slug ? `/news/${n.slug}` : TAG_LINKS[n.tag] || "/shop");

function Blog() {
  const COMPANY = useCompany();
  const posts = NEWS.slice(0, 4);
  const [lead, ...rest] = posts;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-faint">From the counter</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">Stock Notes & Workshop News</h2>
        </div>
        <span className="font-mono text-[11px] font-bold text-faint">N01 — N{String(posts.length).padStart(2, "0")}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Link to={articleHref(lead)} className="card-zoom group grid border-2 border-ink bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,32,73,0.18)]">
          <span className="relative block overflow-hidden bg-mist">
            <img src={lead.img} alt={lead.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
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
            <Link key={n.title} to={articleHref(n)} className="card-zoom group grid grid-cols-[140px_minmax(0,1fr)] border-2 border-ink bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,32,73,0.18)] sm:grid-cols-[200px_minmax(0,1fr)]">
              <span className="relative block min-h-full overflow-hidden bg-mist">
                <img src={n.img} alt={n.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
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

function MakesMarquee() {
  const makes = ["VOLVO", "SCANIA", "HINO", "ISUZU", "KENWORTH", "MACK", "IVECO", "DAF", "FUSO", "UD TRUCKS", "MAN", "MERCEDES-BENZ"];
  const row = [...makes, ...makes];
  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold"><span className="inline-block h-4 w-1.5 bg-gold" />Truck makes we fit</p>
        <Link to="/shop" className="text-[13px] font-bold text-gray-300 transition-colors hover:text-gold">Shop all parts →</Link>
      </div>
      <div className="marquee mt-5 overflow-hidden">
        <div className="marquee-track flex items-center">
          {row.map((m, k) => (
            k < makes.length ? (
              <Link key={`${m}-${k}`} to="/shop" className="flex shrink-0 items-center">
                <span className={`whitespace-nowrap px-6 text-3xl font-extrabold tracking-[0.08em] transition-colors md:text-4xl ${k % 2 ? "text-outline" : "text-white"}`}>{m}</span>
                <span className="h-2.5 w-2.5 shrink-0 bg-gold" />
              </Link>
            ) : (
              <span key={`${m}-${k}`} aria-hidden="true" className="flex shrink-0 items-center">
                <span className={`whitespace-nowrap px-6 text-3xl font-extrabold tracking-[0.08em] md:text-4xl ${k % 2 ? "text-outline" : "text-white"}`}>{m}</span>
                <span className="h-2.5 w-2.5 shrink-0 bg-gold" />
              </span>
            )
          ))}
        </div>
      </div>
    </>
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
    <section id="reviews" className="mt-12 scroll-mt-24 overflow-hidden bg-ink pb-12 pt-10 text-white">
      <MakesMarquee />
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10" />
      <div className="mx-auto max-w-4xl px-4 pt-8 text-center" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold"><span className="inline-block h-4 w-1.5 bg-gold" />Reviews</p>
        <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white md:text-[28px]">Trusted at Counters Across the Country</h2>
        <div key={i} className="mt-6">
          <p className="font-serif text-6xl leading-none text-gold">“</p>
          <blockquote className="-mt-4 text-xl font-medium leading-8 text-white md:text-2xl md:leading-10">{r.quote}</blockquote>
          <div className="mt-5 flex items-center justify-center gap-1 text-gold">{"★★★★★"}</div>
          <p className="mt-3 flex items-center justify-center gap-2.5">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gold text-sm font-extrabold text-ink ring-2 ring-gold/60">
              {initials}
              {r.img && <img src={r.img} alt={r.name} loading="lazy" onError={(e) => e.currentTarget.remove()} className="absolute inset-0 h-full w-full object-cover" />}
            </span>
            <span className="text-left"><span className="block text-sm font-bold text-white">{r.name}</span><span className="block text-xs text-gray-400">{r.role}</span></span>
          </p>
        </div>
        <div className="mt-7 flex items-center justify-center gap-4">
          <button onClick={() => setI((i + items.length - 1) % items.length)} aria-label="Previous review" className="grid h-9 w-9 place-items-center rounded-full border border-gray-600 text-white transition-colors hover:border-gold hover:text-gold">←</button>
          <div className="flex gap-1.5">
            {items.map((x, k) => <button key={x.name} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? "w-7 bg-gold" : "w-2 bg-gray-600 hover:bg-gray-400"}`} />)}
          </div>
          <button onClick={() => setI((i + 1) % items.length)} aria-label="Next review" className="grid h-9 w-9 place-items-center rounded-full bg-gold font-bold text-ink transition-colors hover:bg-white">→</button>
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
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-lg font-bold leading-none transition-all duration-200 ${isOpen ? "rotate-45 bg-primary text-white" : "bg-mist text-ink"}`}>+</span>
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
