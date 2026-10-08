import { Link, useNavigate } from "react-router-dom";
import { GitCompareArrows, MessageSquare, ShoppingCart, Star } from "lucide-react";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import SafeImage from "./SafeImage";
import { useCart } from "../store/cart";

export function PartVisual({ p }) {
  const img = imgFor(p.sku);
  if (img) {
    const isTailLift = p.category === "tail-lifts";
    // Tail lifts are landscape yard photos — use full object-cover without padding so they aren't shrunken
    if (isTailLift) {
      return (
        <SafeImage
          alt={p.name}
          loading="lazy"
          src={img}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      );
    }
    // Hardware & trailer parts with white studio background
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-1">
        <SafeImage
          alt={p.name}
          loading="lazy"
          src={img}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }
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
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={11}
            className={i <= Math.round(rating) ? "fill-gold" : "text-line-dark"}
          />
        ))}
      </span>
      <span className="text-faint">({reviews})</span>
    </span>
  );
}

export function StatusBadge({ p }) {
  if (p.price === null) {
    return (
      <span className="grid h-7 min-w-7 place-items-center rounded-sm bg-ink px-2 text-[10px] font-extrabold uppercase tracking-wider text-white">
        Enquire
      </span>
    );
  }
  if (p.status === "Built to order") {
    return (
      <span className="grid h-7 min-w-7 place-items-center rounded-sm bg-primary px-2 text-[10px] font-extrabold uppercase tracking-wider text-white">
        Built to Order
      </span>
    );
  }
  return (
    <span className="grid h-7 min-w-7 place-items-center rounded-sm bg-gold px-2 text-[10px] font-extrabold uppercase tracking-wider text-ink">
      In Stock
    </span>
  );
}

function CompareBtn({ p }) {
  const { compare, toggleCompare } = useCart();
  const on = compare.includes(p.sku);
  return (
    <button
      onClick={() => toggleCompare(p.sku)}
      aria-label="Compare"
      title={on ? "Remove from compare" : "Add to compare"}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors ${
        on
          ? "border-navy bg-navy text-white"
          : "border-line-dark bg-white text-ink hover:border-navy hover:bg-navy hover:text-white"
      }`}
    >
      <GitCompareArrows size={14} />
    </button>
  );
}

export default function ProductCard({ p, joined }) {
  const { add } = useCart();
  const navigate = useNavigate();
  const enquiry = p.price === null;
  const isTailLift = p.category === "tail-lifts";
  const targetUrl = `/product/${p.sku}`;
  const enquiryUrl = isTailLift
    ? `/tail-lift-enquiry?sku=${p.sku}`
    : `/contact?topic=${encodeURIComponent(p.name)}&sku=${p.sku}`;

  return (
    <div
      className={`card-zoom group flex h-full flex-col bg-white transition-all duration-200 hover:-translate-y-1 hover:border-navy hover:shadow-[0_14px_30px_rgba(0,32,73,0.18)] ${
        joined ? "" : "rounded-md border border-line"
      }`}
    >
      <Link
        to={targetUrl}
        className={`relative block aspect-[4/3] overflow-hidden bg-mist ${
          joined ? "" : "rounded-t-[5px]"
        }`}
      >
        <PartVisual p={p} />

        {/* hover quick-action bar: the only quick-action bar that hovers out */}
        {!enquiry ? (
          <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-2 bg-navy px-3 py-1.5 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
            <span className="text-[12px] font-bold text-white underline underline-offset-4 transition-colors hover:text-gold">
              View Details →
            </span>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Quick add ${p.name} to cart`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                add(p);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  add(p);
                }
              }}
              className="pointer-events-auto grid h-7 w-7 place-items-center rounded-md bg-white text-ink shadow transition-colors hover:bg-gold"
            >
              <ShoppingCart size={14} />
            </span>
          </span>
        ) : (
          <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-2 bg-navy px-3 py-1.5 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
            <span className="text-[12px] font-bold text-white underline underline-offset-4 transition-colors hover:text-gold">
              View Specifications →
            </span>
            <button
              type="button"
              aria-label={`Enquire price for ${p.name}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(enquiryUrl);
              }}
              className="pointer-events-auto grid h-7 w-7 place-items-center rounded-md bg-white text-ink shadow transition-colors hover:bg-gold"
            >
              <MessageSquare size={14} />
            </button>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
          {p.sub} . {p.sku}
        </p>
        <Link to={targetUrl}>
          <h3 className="mt-1 line-clamp-2 min-h-11 text-[15px] font-extrabold leading-snug text-ink transition-colors group-hover:text-navy hover:text-navy">
            {p.name}
          </h3>
        </Link>
        <p className="mt-1 truncate text-[12.5px] text-steel">{p.fit}</p>
        <Stars rating={p.rating || 4.6} reviews={p.reviews || 12} />

        {/* Clean bottom row: only compare on desktop and price / enquiry text. NO extra cart or msg icons here. */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="hidden shrink-0 lg:block">
            <CompareBtn p={p} />
          </span>
          {enquiry ? (
            <span className="ml-auto text-[15px] font-extrabold text-primary">
              Enquire Price
            </span>
          ) : (
            <span className="ml-auto tabular text-[20px] font-extrabold text-primary">
              {formatAUD(p.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
