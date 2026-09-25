import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { NEWS } from "../data/content";
import { useCatalog } from "../store/catalog";
import { useCompany } from "../store/site";
import ProductCard from "../components/ProductCard";

const TAG_CAT = { "Tail Lifts": "tail-lifts", "Trailer Parts": "trailer-parts", "Accessories": "accessories", "Tool Boxes": "accessories" };

export function articleBySlug(slug) {
  return NEWS.find((n) => n.slug === slug);
}

export default function Article() {
  const { slug } = useParams();
  const COMPANY = useCompany();
  const { products } = useCatalog();
  const post = articleBySlug(slug);

  /* Per-article BlogPosting schema for rich results. */
  useEffect(() => {
    if (!post) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "article-ld";
    el.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: post.img,
      datePublished: post.date,
      author: { "@type": "Organization", name: "Aurex Truck Parts Australia" },
    });
    document.head.appendChild(el);
    return () => { document.getElementById("article-ld")?.remove(); };
  }, [post]);

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Article not found</h1>
        <p className="mt-2 text-sm text-steel">That story is no longer on the counter.</p>
        <Link to="/" className="mt-5 inline-block rounded bg-gold px-6 py-3 text-sm font-bold text-ink">Back home</Link>
      </main>
    );
  }

  const cat = TAG_CAT[post.tag];
  const related = products.filter((p) => p.category === cat).slice(0, 4);
  const others = NEWS.filter((n) => n.slug !== post.slug).slice(0, 3);

  return (
    <main>
      <article className="mx-auto max-w-3xl px-4 pt-6">
        <p className="text-[12px] text-faint">
          <Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Stock Notes</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="bg-gold px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink">{post.tag}</span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-faint">{post.date}</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight md:text-[40px]">{post.title}</h1>
        <p className="mt-2 text-[15px] leading-7 text-steel">{post.excerpt}</p>
        <div className="card-zoom mt-5 overflow-hidden rounded-md border border-line">
          <img src={post.img} alt={post.title} className="aspect-[16/8] w-full object-cover" />
        </div>
        <div className="mt-6 space-y-5">
          {(post.body || []).map((b, k) => (
            <section key={k}>
              {b.h && <h2 className="text-xl font-extrabold tracking-tight">{b.h}</h2>}
              {b.p && <p className="mt-2 text-[15px] leading-7 text-steel">{b.p}</p>}
              {b.list && (
                <ul className="mt-3 grid gap-2 rounded-md border border-gold bg-gold/10 p-4">
                  {b.list.map((li) => (
                    <li key={li} className="flex items-start gap-2 text-sm font-semibold"><span className="mt-0.5 text-gold">✓</span>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-md bg-ink p-5 text-white">
          <p className="text-[15px] font-extrabold">Talk specs with the counter?</p>
          <a href={COMPANY.phoneHref} className="flex items-center gap-2 rounded bg-gold px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-white"><Phone size={15} /> {COMPANY.phone}</a>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold tracking-tight">Shop this story</h2>
            <Link to={`/shop/${cat}`} className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-steel hover:text-navy">Shop all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{related.map((p) => <ProductCard key={p.sku} p={p} />)}</div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-10">
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight">More from the counter</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {others.map((n) => (
            <Link key={n.slug} to={`/news/${n.slug}`} className="card-zoom group overflow-hidden rounded-md border border-line bg-white transition-all hover:-translate-y-1 hover:border-gold">
              <span className="block overflow-hidden bg-mist"><img src={n.img} alt={n.title} loading="lazy" className="aspect-[16/9] w-full object-cover" /></span>
              <span className="block p-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-faint">{n.date} · {n.tag}</span>
                <span className="mt-1 block font-extrabold leading-snug transition-colors group-hover:text-navy">{n.title}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-navy hover:underline"><ArrowLeft size={15} /> Back to home</Link>
      </section>
    </main>
  );
}
