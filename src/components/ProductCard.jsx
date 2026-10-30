import { Link, useNavigate } from "react-router-dom";
import { GitCompareArrows, MessageSquare, ShoppingCart, Star, Mail } from "lucide-react";
import { formatAUD } from "../data/products";
import { productImage } from "../data/images";
import SafeImage from "./SafeImage";
import { useCart, useCartActions } from "../store/cart";

export function PartVisual({ p }) {
  const img = productImage(p);
  if (img) {
    const isTailLift = p.category === "tail-lifts" || p.categorySlug === "tail-lifts";
    const isPhotoCover = isTailLift || ['ATP-TP-87', 'ATP-TP-91'].includes(p.sku);
    const isReducedProfile = ['ATP-TP-88', 'ATP-TP-89', 'ATP-TP-90'].includes(p.sku);

    if (isReducedProfile) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-white p-2 sm:p-2.5">
          <SafeImage
            alt={p.name}
            loading="lazy"
            src={img}
            cdnWidth={360}
            className="max-h-full max-w-full rounded-[3px] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      );
    }

    // Tail lifts & landscape profile photos — use full object-cover without padding so they aren't shrunken or letterboxed
    if (isPhotoCover) {
      return (
        <SafeImage
          alt={p.name}
          loading="lazy"
          src={img}
          cdnWidth={360}
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
          cdnWidth={360}
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
  /* Unreviewed parts keep the row's height so prices stay aligned across the grid. */
  if (!reviews) return <span className="mt-1 block h-4" aria-hidden="true" />;
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
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-steel">
        Enquire
      </span>
    );
  }
  if (p.status === "Built to order") {
    return (
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
        Built to Order
      </span>
    );
  }
  return (
    <span className="text-[10px] font-extrabold uppercase tracking-wider text-green-700">
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
  const { add } = useCartActions();
  const navigate = useNavigate();
  const isTailLift = p.category === "tail-lifts" || p.categorySlug === "tail-lifts" || (p.sku && p.sku.startsWith("ATP-TL-"));
  const enquiry = p.price === null || p.pricing?.isPOA === true || p.isPOA === true || p.status === "Enquiry only" || isTailLift;
  const targetUrl = `/product/${p.sku}`;

  const handleEnquiryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTailLift) {
      navigate(`/tail-lift-enquiry?sku=${p.sku}`);
    } else {
      const subject = `Price Enquiry: ${p.sku} - ${p.name}`;
      const body = [
        "Hi Aurex Truck Parts Team,",
        "",
        "I would like to enquire about trade/fleet pricing and stock availability for:",
        `Part Number: ${p.sku}`,
        `Product: ${p.name}`,
        "",
        "Required Quantity: ",
        "Delivery Postcode / Location: ",
        "Company / Account Name: ",
        "Contact Phone Number: ",
        "",
        "Thank you!"
      ].join("\n");
      const mailtoUrl = `mailto:info@aurextruckparts.com.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      const isMobile = typeof navigator !== "undefined" && (
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (typeof window !== "undefined" && window.innerWidth < 768)
      );

      if (isMobile) {
        window.location.href = mailtoUrl;
      } else {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=info@aurextruckparts.com.au&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        const win = window.open(gmailUrl, "_blank", "noopener,noreferrer");
        if (!win) {
          window.location.href = mailtoUrl;
        }
      }
    }
  };

  return (
    <div
      className={`card-zoom group flex h-full flex-col bg-white transition-all duration-200 hover:-translate-y-1 hover:border-navy hover:shadow-[0_14px_30px_rgba(0,32,73,0.18)] ${
        joined ? "" : "rounded-md border border-line"
      }`}
    >
      <Link
        to={targetUrl}
        className={`relative block aspect-[4/3] overflow-hidden bg-white ${
          joined ? "" : "rounded-t-[5px]"
        }`}
      >
        <PartVisual p={p} />

        {/* hover quick-action bar */}
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
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-md bg-white text-ink shadow transition-colors hover:bg-gold md:h-7 md:w-7"
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
              aria-label={isTailLift ? `Tail lift enquiry for ${p.name}` : `Direct Gmail enquiry for ${p.name}`}
              title={isTailLift ? "Open Tail Lift Dedicated Enquiry Form" : "Direct Email Enquiry via Gmail (info@aurextruckparts.com.au)"}
              onClick={handleEnquiryClick}
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-md bg-white text-ink shadow transition-colors hover:bg-gold md:h-7 md:w-7"
            >
              {isTailLift ? <MessageSquare size={14} /> : <Mail size={14} />}
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
        <Stars rating={p.rating} reviews={p.reviews} />

        {/* Clean bottom row: only compare on desktop and price / enquiry text. NO extra cart or msg icons here. */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="hidden shrink-0 lg:block">
            <CompareBtn p={p} />
          </span>
          {enquiry ? (
            <div className="ml-auto text-right">
              <span className="text-[14px] font-extrabold text-primary">
                Enquire Price
              </span>
            </div>
          ) : (
            <div className="ml-auto text-right">
              <span className="tabular text-[20px] font-extrabold text-primary">
                {formatAUD(p.price)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
