import { Link } from "react-router-dom";
import { GitCompareArrows, Phone, ShoppingCart, Star } from "lucide-react";
import { formatAUD } from "../data/products";
import { useCompany } from "../store/site";
import { imgFor } from "../data/images";
import { useCart } from "../store/cart";

export function PartVisual({ p }) {
  const img = imgFor(p.sku);
  if (img) return <img alt={p.name} loading="lazy" src={img} className="h-full w-full object-cover" />;
  return (
    <span className="grid h-full w-full place-items-center bg-mist">
      <span className="font-mono text-xs font-bold text-faint">{p.sku}</span>
    </span>
  );
}

function Stars({ rating, reviews }) {
  return (
    <span className="mt-1 flex items-center gap-1.5 text-[11px]">
      <span className="flex text-gold">
        {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={11} className={i <= Math.round(rating) ? "fill-gold" : "text-line-dark"} />)}
      </span>
      <span className="text-faint">({reviews})</span>
    </span>
  );
}

export function StatusBadge({ p }) {
  if (p.price === null) return <span className="grid h-8 min-w-8 place-items-center rounded-full bg-ink px-2 text-[10px] font-bold text-white">Enquire</span>;
  if (p.status === "Built to order") return <span className="grid h-8 min-w-8 place-items-center rounded-full bg-primary px-2 text-[10px] font-bold text-white">Built to Order</span>;
  return <span className="grid h-8 min-w-8 place-items-center rounded-full bg-gold px-2 text-[10px] font-bold text-ink">In Stock</span>;
}

function CompareBtn({ p }) {
  const { compare, toggleCompare } = useCart();
  const on = compare.includes(p.sku);
  return (
    <button onClick={() => toggleCompare(p.sku)} aria-label="Compare" title={on ? "Remove from compare" : "Add to compare"}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${on ? "border-navy bg-navy text-white" : "border-line-dark bg-white text-ink hover:border-navy hover:bg-navy hover:text-white"}`}>
      <GitCompareArrows size={15} />
    </button>
  );
}

export default function ProductCard({ p, joined, badges = true }) {
  const { add } = useCart();
  const COMPANY = useCompany();
  const enquiry = p.price === null;
  return (
    <div className={`card-zoom group flex h-full flex-col bg-white transition-all duration-200 hover:-translate-y-1 hover:border-navy hover:shadow-[0_14px_30px_rgba(0,32,73,0.18)] ${joined ? "" : "rounded-md border border-line"}`}>
      <Link to={`/product/${p.sku}`} className={`relative block aspect-[4/3] overflow-hidden bg-mist ${joined ? "" : "rounded-t-[5px]"}`}>
        <PartVisual p={p} />
        {badges && <span className="absolute left-2 top-2"><StatusBadge p={p} /></span>}
        {/* hover quick-action bar: slim solid strip that slides up from below */}
        {!enquiry ? (
          <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-2 bg-navy px-3 py-1.5 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
            <span className="text-[12px] font-bold text-white underline underline-offset-4 transition-colors hover:text-gold">View Details →</span>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Quick add ${p.name} to cart`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(p); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); add(p); } }}
              className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow transition-colors hover:bg-gold"
            >
              <ShoppingCart size={15} />
            </span>
          </span>
        ) : (
          <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-2 bg-navy px-3 py-1.5 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
            <span className="text-[12px] font-bold text-white underline underline-offset-4 transition-colors hover:text-gold">View Details →</span>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Call to enquire about ${p.name}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = COMPANY.phoneHref; }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); window.location.href = COMPANY.phoneHref; } }}
              className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow transition-colors hover:bg-gold"
            >
              <Phone size={15} />
            </span>
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-faint">{p.sub} . {p.sku}</p>
        <Link to={`/product/${p.sku}`}><h3 className="mt-1 line-clamp-2 min-h-11 text-[15px] font-extrabold leading-snug text-ink transition-colors group-hover:text-navy hover:text-navy">{p.name}</h3></Link>
        <p className="mt-1 truncate text-[12.5px] text-steel">{p.fit}</p>
        <Stars rating={p.rating || 4.6} reviews={p.reviews || 12} />
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Desktop: compare lives here (quick-add is in the hover bar).
              Phones/tablets: hover can't fire, so this spot becomes a one-tap
              round add-to-cart (or call) button instead. */}
          <span className="hidden shrink-0 lg:block"><CompareBtn p={p} /></span>
          {enquiry ? (
            <a href={COMPANY.phoneHref} aria-label={`Call to enquire about ${p.name}`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-ink transition-colors hover:bg-navy hover:text-white lg:hidden">
              <Phone size={15} />
            </a>
          ) : (
            <button onClick={() => add(p)} aria-label={`Add ${p.name} to cart`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-ink transition-colors hover:bg-navy hover:text-white active:scale-95 lg:hidden">
              <ShoppingCart size={15} />
            </button>
          )}
          {enquiry
            ? <span className="text-[15px] font-extrabold text-primary">Enquire on Call</span>
            : <span className="tabular text-[22px] font-extrabold text-primary">{formatAUD(p.price)}</span>}
        </div>
      </div>
    </div>
  );
}
