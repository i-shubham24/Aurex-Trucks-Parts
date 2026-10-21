import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Award, CheckCircle2, Minus, Phone, Plus, Ruler, ShieldCheck, Truck, ShoppingCart, ZoomIn, Star, Mail, Layers, Check } from "lucide-react";
import { formatAUD } from "../data/products";
import { useCompany, useSite } from "../store/site";
import { imgFor, imagesFor } from "../data/images";
import SafeImage from "../components/SafeImage";
import { useCart } from "../store/cart";
import ProductCard from "../components/ProductCard";
import { useProduct } from "../hooks/api/useProducts";
import { useProductReviews } from "../hooks/api/useReviews";
import ProductDetailSkeleton from "../components/ProductDetailSkeleton";
import QuoteEnquiryModal from "../components/QuoteEnquiryModal";

function ProductImageZoom({ src, alt, isTailLift }) {
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      className={`group/zoom relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden cursor-crosshair ${
        isTailLift ? "p-0" : "p-2 sm:p-3 bg-white"
      }`}
    >
      <SafeImage
        src={src}
        alt={alt}
        cdnWidth={1400}
        style={{
          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
          transform: isHovered ? "scale(2.2)" : "scale(1)",
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.25s ease-out",
        }}
        className={`pointer-events-none select-none will-change-transform ${
          isTailLift ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain"
        }`}
        fallbackIconSize={32}
      />
      <span
        className={`pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-md border border-line bg-white/95 px-2.5 py-1 text-[11px] font-bold text-steel shadow-xs backdrop-blur-xs transition-opacity duration-200 md:flex ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
      >
        <ZoomIn size={13} className="text-navy" /> Hover to zoom
      </span>
    </div>
  );
}

const EXCLUDED_CHART_KEYS = new Set([
  'Dimensions',
  'Certification',
  'Australian Standard',
  'Technical Specification',
  'Product Parameter',
  'id',
  '_id',
]);

function getCategorizedSpecs(specs = {}) {
  const result = [];
  const seenKeys = new Set();

  // 1. Add existing categorized specs (excluding top-level highlights)
  for (const [key, val] of Object.entries(specs)) {
    if (EXCLUDED_CHART_KEYS.has(key)) continue;
    if (val === undefined || val === null || val === '') continue;

    let cleanVal = String(val);
    // Eliminate contradictory height for wheel nut covers
    if (key === 'Overall Height' && specs.Dimensions && specs.Dimensions.includes('50mm')) {
      cleanVal = '50 mm';
    }

    seenKeys.add(key.toLowerCase());
    result.push([key, cleanVal]);
  }

  // 2. If the product only has pipe-delimited parameters, parse into categorized rows
  if (result.length < 2 && specs['Product Parameter']) {
    const parts = specs['Product Parameter'].split('|').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0) {
        const k = part.slice(0, colonIdx).trim();
        const v = part.slice(colonIdx + 1).trim();
        if (!seenKeys.has(k.toLowerCase()) && !EXCLUDED_CHART_KEYS.has(k)) {
          seenKeys.add(k.toLowerCase());
          result.push([k, v]);
        }
      } else if (!seenKeys.has(part.toLowerCase())) {
        seenKeys.add(part.toLowerCase());
        result.push(['Feature / Construction', part]);
      }
    }
  }

  return result;
}

const SIZE_FAMILIES = [
  // 1. Guangzhou Caiyuan Canvas Stands (CY-20260914-01) - 3 Width Sizes
  {
    skus: ['ATP-TP-11', 'ATP-TP-12', 'ATP-TP-13'],
    label: 'Available Frame Width Sizes',
    options: [
      { sku: 'ATP-TP-13', name: '1250mm (W)', price: '$141' },
      { sku: 'ATP-TP-11', name: '1995mm (W)', price: '$170' },
      { sku: 'ATP-TP-12', name: '2045mm (W)', price: '$179' },
    ]
  },
  // 2. Cam Door Lock Kit Configurations (PI-GLYHM26091414-1)
  {
    skus: ['ATP-TP-01', 'ATP-TP-02', 'ATP-TP-03'],
    label: 'Available Kit Configurations',
    options: [
      { sku: 'ATP-TP-01', name: 'Steel (With Handle)', price: '$102' },
      { sku: 'ATP-TP-02', name: 'Steel (Less Handle)', price: '$86' },
      { sku: 'ATP-TP-03', name: '304 Stainless Steel', price: '$160' },
    ]
  },
  // 3. Commercial Grab Handles (PI-GLYHM26091414-1)
  {
    skus: ['ATP-TP-21', 'ATP-TP-22'],
    label: 'Available Mounting Styles',
    options: [
      { sku: 'ATP-TP-22', name: 'Zinc Plated (No Base)', price: '$10' },
      { sku: 'ATP-TP-21', name: 'Stainless Steel (With Base)', price: '$10' },
    ]
  },
  // 4. Cargo Control End Fittings
  {
    skus: ['ATP-TP-16', 'ATP-TP-17'],
    label: 'Available End Fitting Types',
    options: [
      { sku: 'ATP-TP-16', name: 'F-Track Fitting', price: '$25' },
      { sku: 'ATP-TP-17', name: 'E/Q-Track Fitting', price: '$23' },
    ]
  },
  // 5. Honeycomb 20mm Door Panels
  {
    skus: ['ATP-ACC-08', 'ATP-ACC-09', 'ATP-ACC-10'],
    label: 'Available Panel Sizes',
    options: [
      { sku: 'ATP-ACC-08', name: '2400 x 1200mm (20mm)' },
      { sku: 'ATP-ACC-09', name: '2800 x 1200mm (20mm)' },
      { sku: 'ATP-ACC-10', name: '3200 x 1200mm (20mm)' },
    ]
  },
  // 6. Plywood 20mm Door Panels
  {
    skus: ['ATP-ACC-11', 'ATP-ACC-12', 'ATP-ACC-13'],
    label: 'Available Plywood Core Sizes',
    options: [
      { sku: 'ATP-ACC-11', name: '2400 x 1200mm (20mm)' },
      { sku: 'ATP-ACC-12', name: '2800 x 1200mm (20mm)' },
      { sku: 'ATP-ACC-13', name: '3200 x 1200mm (20mm)' },
    ]
  },
  // 7. Insulated XPS 30mm Panels
  {
    skus: ['ATP-ACC-14', 'ATP-ACC-15'],
    label: 'Available Insulated XPS Sizes',
    options: [
      { sku: 'ATP-ACC-14', name: '2800 x 1200mm (30mm)' },
      { sku: 'ATP-ACC-15', name: '3200 x 1200mm (30mm)' },
    ]
  },
  // 8. Commercial PVC Door Seals
  {
    skus: ['ATP-TP-29', 'ATP-TP-30', 'ATP-TP-31', 'ATP-TP-32', 'ATP-TP-33'],
    label: 'Available Seal Profile Sizes',
    options: [
      { sku: 'ATP-TP-29', name: '20mm x 5M', price: '$46' },
      { sku: 'ATP-TP-30', name: '25mm x 5M', price: '$48' },
      { sku: 'ATP-TP-31', name: '30mm x 4M', price: '$46' },
      { sku: 'ATP-TP-32', name: '55mm x 4.2M', price: '$60' },
      { sku: 'ATP-TP-33', name: '85mm x 5M', price: '$70' },
    ]
  },
  // 8. Beauway Cantilever Tail Lifts
  {
    skus: ['ATP-TL-04', 'ATP-TL-02', 'ATP-TL-01', 'ATP-TL-03', 'ATP-TL-05'],
    label: 'Available Capacities & Platform Sizes',
    options: [
      { sku: 'ATP-TL-04', name: '1.5T Aluminium (2450 x 2400mm)', price: 'POA' },
      { sku: 'ATP-TL-02', name: '2.0T Aluminium (2450 x 2200mm)', price: 'POA' },
      { sku: 'ATP-TL-01', name: '2.0T Aluminium (2450 x 2400mm)', price: 'POA' },
      { sku: 'ATP-TL-03', name: '2.0T Aluminium (2450 x 2600mm)', price: 'POA' },
      { sku: 'ATP-TL-05', name: '3.0T High-Tensile Steel (2450 x 2600mm)', price: 'POA' },
    ]
  }
];

export default function ProductDetail() {
  const { sku } = useParams();
  const COMPANY = useCompany();
  const { settings } = useSite();
  const freeOver = formatAUD(settings.freeFreightOver || 200);

  const { data, isLoading, isError, error, refetch, isFetching } = useProduct(sku);
  const p = data?.product;
  const related = data?.relatedProducts || [];

  const { data: reviewsData } = useProductReviews(sku);
  const reviewsList = reviewsData?.reviews || [];

  const { lines, add, setQty: setCartQty, setOpen, compare, toggleCompare } = useCart();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("specs");
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  useEffect(() => {
    setActiveImgIdx(0);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [sku]);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [isLoading]);

  const cartItem = lines.find((l) => l.sku === p?.sku);
  const inCart = Boolean(cartItem);
  const cartQty = cartItem ? cartItem.qty : 0;

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // Only a 404 means the part is gone. Anything else (API waking up, network blip)
  // is a failed load of a part that probably exists, so say that and offer a retry.
  if (isError && error?.status !== 404) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink">We couldn't load this part</h1>
        <p className="mt-2 text-sm text-steel">The catalogue didn't answer for <span className="font-mono font-bold text-ink">{sku}</span>. It is usually back in a moment.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => refetch()} disabled={isFetching} className="rounded bg-gold px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white disabled:opacity-60">
            {isFetching ? "Trying again…" : "Try again"}
          </button>
          <a href={COMPANY.phoneHref} className="rounded border border-ink px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white">
            Call {COMPANY.phone}
          </a>
        </div>
      </main>
    );
  }

  if (isError || !p) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Part not on file</h1>
        <p className="mt-2 text-sm text-steel">We couldn't find the product SKU: <span className="font-mono font-bold text-ink">{sku}</span></p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/shop" className="rounded bg-gold px-6 py-2.5 text-sm font-bold text-ink hover:bg-navy hover:text-white transition-colors">
            Shop All Products
          </Link>
          <a href={COMPANY.phoneHref} className="rounded border border-ink px-6 py-2.5 text-sm font-bold text-ink hover:bg-ink hover:text-white transition-colors">
            Call {COMPANY.phone}
          </a>
        </div>
      </main>
    );
  }

  const BAD_IMAGE_SUBSTRINGS = ['-gl11113', '-schematic', '-strap.png', '-strap.jpg', '-paddle.png', '-cad', 'cad.', '-drawing', '-blueprint'];
  const isCleanImage = (url) => {
    if (!url || typeof url !== 'string') return false;
    return !BAD_IMAGE_SUBSTRINGS.some((bad) => url.toLowerCase().includes(bad));
  };

  const cleanLocal = imgFor(p.sku);
  const localImages = imagesFor(p.sku).filter(isCleanImage);
  const backendImages = Array.isArray(p.images) && p.images.length > 0 
    ? p.images.map((img) => (typeof img === "string" ? img : img.url)).filter(isCleanImage)
    : [];

  // Prioritize curated multi-image views (front, back, CAD, detail) and studio packshots
  const rawList = localImages.length > 0 
    ? localImages 
    : (cleanLocal ? [cleanLocal] : (backendImages.length > 0 ? backendImages : []));
  const imagesList = Array.from(new Set(rawList.filter(Boolean)));
  if (imagesList.length === 0) {
    const single = cleanLocal || `/images/products/${p.sku}.jpg`;
    if (single) imagesList.push(single);
  }

  const primaryImage = imagesList[activeImgIdx] || imagesList[0] || cleanLocal || `/images/products/${p.sku}.jpg`;
  const isTailLift = p.category === "tail-lifts" || p.categorySlug === "tail-lifts" || (p.sku && p.sku.startsWith("ATP-TL-"));
  const enquiry = p.price === null || p.pricing?.isPOA === true || p.isPOA === true || p.status === "Enquiry only" || isTailLift;
  const inCompare = compare.includes(p.sku);

  const emailSubject = `Price Enquiry: ${p.sku} - ${p.name}`;
  const emailBody = [
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
  const mailtoHref = `mailto:info@aurextruckparts.com.au?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=info@aurextruckparts.com.au&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const sizeFamily = SIZE_FAMILIES.find((f) => f.skus.includes(p.sku));
  const remarkCallout = (() => {
    if (p.sku === 'ATP-TP-14') {
      return {
        badge: 'Supplied With Quick-Release Lever Handle',
        text: 'Equipped with heavy-duty ratcheting lever handle for fast one-person locking & instant release (not bare tube).',
        tag: 'With Handle'
      };
    }
    if (p.sku === 'ATP-TP-16') {
      return {
        badge: 'Supplied With 50mm Webbing Strap Loop',
        text: 'Includes 50mm heavy-duty high-tensile polyester webbing strap loop for direct tie-down connection.',
        tag: 'With Strap'
      };
    }
    if (p.sku === 'ATP-TP-17') {
      return {
        badge: 'Supplied With Webbing Strap & Forged Hook',
        text: 'Reinforced webbing strap complete with heavy forged steel clevis snap hook for logistics tracks.',
        tag: 'With Strap & Hook'
      };
    }
    if (p.sku === 'ATP-TP-01') {
      return {
        badge: 'Complete Kit With Lever Handle',
        text: 'Supplied complete with handle, keepers and cams. Left-Hand (200L) and Right-Hand (200R) available.',
        tag: 'With Handle'
      };
    }
    if (p.sku === 'ATP-TP-02') {
      return {
        badge: 'Cam Gear Sub-Assembly (Less Handle)',
        text: 'Supplied without lower operating handle/latch for custom workshop handle installations.',
        tag: 'Without Latch'
      };
    }
    if (p.sku === 'ATP-TP-22') {
      return {
        badge: 'Direct Weld-On / Bolt-Through',
        text: 'Tubular ends designed without separate mounting base plates (L330mm x H50mm).',
        tag: 'Without Base'
      };
    }
    if (p.sku === 'ATP-TP-19') {
      return {
        badge: 'DN16mm Rod Size Specification',
        text: 'Specifically sized for standard DN16mm diameter locking rods and multi-point linkages.',
        tag: 'DN16mm'
      };
    }
    return null;
  })();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <Link to="/shop" className="hover:text-navy hover:underline">Shop</Link> / <span className="font-semibold text-ink">{p.sku}</span></p>
      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
        <div className="space-y-3.5 md:sticky md:top-24 self-start">
          <div className="relative overflow-hidden rounded-md border border-line bg-white shadow-xs">
            {primaryImage ? (
              <ProductImageZoom
                src={primaryImage}
                alt={p.name}
                isTailLift={p.category === "tail-lifts" || ['ATP-TP-87', 'ATP-TP-91'].includes(p.sku)}
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center p-6 bg-white">
                <span className="grid h-full w-full place-items-center font-mono text-sm font-bold text-faint">{p.sku}</span>
              </div>
            )}
            <span className={`absolute left-3 top-3 pointer-events-none text-[11px] font-extrabold uppercase tracking-wide ${enquiry ? "text-steel" : p.status === "Built to order" ? "text-primary" : "text-green-700"}`}>
              {enquiry ? "Enquire" : p.status === "Built to order" ? "Built to Order" : "In Stock"}
            </span>
          </div>

          {/* Image thumbnails if multiple images exist */}
          {imagesList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagesList.map((imgSrc, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded border p-1 bg-white transition-all ${
                    idx === activeImgIdx ? "border-gold ring-2 ring-gold/50" : "border-line opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={imgSrc} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line text-center text-[12px] font-semibold">
            {[["ADR Checked", "Fitment Matched"], ["Fast Dispatch", "Ex Campbellfield"], ["Fleet Warranty", "12 Mo Commercial"]].map(([t, d]) => (
              <div key={t} className="bg-white px-2 py-2.5">
                <p className="font-bold text-ink">{t}</p>
                <p className="mt-0.5 text-[11px] text-steel">{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3.5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">{p.sub} . {p.sku}</p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl">{p.name}</h1>
            <button 
              type="button"
              onClick={() => {
                setTab("reviews");
                const el = document.getElementById("product-detail-tabs");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-2 flex items-center gap-1.5 text-[13px] hover:opacity-80 transition-opacity text-left"
              aria-label="View customer reviews"
            >
              <span className="text-gold">{"★★★★★"}</span>
              <span className="font-bold">{p.rating}</span>
              <span className="text-faint underline decoration-line/80 underline-offset-2">({reviewsList.length || p.reviews} reviews)</span>
            </button>
          </div>

          {(p.specs?.Certification || p.specs?.['Australian Standard']) && (
            <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/90 bg-white p-3 shadow-xs transition-shadow hover:shadow-sm">
              <div className="flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 shadow-xs">
                <img
                  src="/images/badges/australian-standard-certified.png"
                  alt="Australian Standard Certified Product Mark"
                  className="h-full w-full object-contain"
                  loading="eager"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-navy">
                    Australian Standard Certified
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    <CheckCircle2 size={10} className="text-emerald-700" />
                    Verified Compliance
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs sm:text-[13px] font-extrabold text-ink">
                  {p.specs['Australian Standard'] || p.specs.Certification.split(';')[0]}
                </p>
                <p className="text-[11px] text-steel">
                  Heavy Vehicle National Law (NHVR) & ADR Fitment Compliant
                </p>
              </div>
            </div>
          )}

          {remarkCallout && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 shadow-xs">
              <span className="mt-0.5 inline-flex items-center justify-center rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                {remarkCallout.tag}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-amber-950">{remarkCallout.badge}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-amber-800">{remarkCallout.text}</p>
              </div>
            </div>
          )}

          {sizeFamily && (
            <div className="rounded-lg border border-line bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wide text-ink flex items-center gap-1.5">
                  <Layers size={13} className="text-primary" />
                  {sizeFamily.label}:
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sizeFamily.options.map((opt) => {
                  const isCurrent = opt.sku === p.sku;
                  return (
                    <Link
                      key={opt.sku}
                      to={`/product/${opt.sku}`}
                      className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs transition-all ${
                        isCurrent
                          ? 'border border-navy bg-navy text-white font-bold shadow-xs'
                          : 'border border-line bg-mist/60 text-ink hover:border-steel hover:bg-mist'
                      }`}
                    >
                      <span className="font-extrabold">{opt.name}</span>
                      {!enquiry && opt.price && (
                        <span className={`font-mono text-[11px] font-bold ${isCurrent ? 'text-gold' : 'text-primary'}`}>
                          {opt.price}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-md border border-line bg-mist p-4">
            {enquiry ? (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-2xl font-extrabold">
                    Enquire Price <span className="text-sm font-semibold text-steel">for your fleet</span>
                  </p>
                </div>
                <p className="mt-1 text-[13px] text-steel">
                  {isTailLift
                    ? "Custom sized to your truck chassis and body dimensions. Engineering review in 4 hours."
                    : "Priced to your fleet requirements. Fast quote back within 4 business hours."}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {isTailLift ? (
                    <Link
                      to={`/tail-lift-enquiry?sku=${p.sku}`}
                      className="flex w-full items-center justify-center gap-2 rounded bg-gold py-3 text-center text-sm font-extrabold text-ink transition-colors hover:bg-navy hover:text-white shadow-xs"
                    >
                      Request Tail Lift Quotation Enquiry →
                    </Link>
                  ) : (
                    <a
                      href={mailtoHref}
                      onClick={(e) => {
                        const isMobile = typeof navigator !== "undefined" && (
                          /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                          (typeof window !== "undefined" && window.innerWidth < 768)
                        );
                        if (isMobile) {
                          // On Android and iPhone: follow native mailto directly without window.open or e.preventDefault()
                          return;
                        }
                        e.preventDefault();
                        const win = window.open(gmailHref, "_blank", "noopener,noreferrer");
                        if (!win) {
                          window.location.href = mailtoHref;
                        }
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded bg-gold py-3 text-center text-sm font-extrabold text-ink transition-colors hover:bg-navy hover:text-white shadow-xs cursor-pointer active:scale-[0.99]"
                    >
                      <Mail size={16} /> Email info@aurextruckparts.com.au →
                    </a>
                  )}
                  <a
                    href={COMPANY.phoneHref}
                    className="flex w-full items-center justify-center gap-2 rounded bg-ink py-3 text-sm font-bold text-white transition-colors hover:bg-navy"
                  >
                    <Phone size={16} className="text-gold" /> Call {COMPANY.phone}
                  </a>
                </div>
                <p className="mt-2.5 text-center font-mono text-[11px] text-faint">RESPONSE IN 4 BUSINESS HOURS</p>
              </>
            ) : (
              <><div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="tabular text-5xl font-extrabold text-primary">{formatAUD(p.price)}</p>
                </div>
                <p className="text-right font-mono text-[11px] leading-4 text-faint">{(p.status || "In stock VIC").toUpperCase()}<br />{(p.lead || "Ships in 24 hrs").toUpperCase()}</p>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-steel"><Truck size={14} className="text-green-600" /> Order by 2pm, dispatched today ex Campbellfield.</p>
              {inCart ? (
                <div className="mt-3 flex flex-wrap items-stretch gap-2">
                  <div className="flex flex-1 items-center justify-between rounded-md border-2 border-emerald-600 bg-emerald-50/50 px-3 py-1.5 shadow-xs">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                      <span>In Cart</span>
                    </span>
                    <div className="flex items-center rounded border border-emerald-300 bg-white shadow-xs">
                      <button
                        onClick={() => setCartQty(p.sku, cartQty - 1)}
                        className="px-3 py-2 text-ink transition-colors hover:bg-mist active:scale-95"
                        aria-label="Decrease quantity in cart"
                        title={cartQty === 1 ? "Remove from cart" : "Decrease quantity"}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="tabular min-w-8 text-center text-sm font-extrabold text-ink">
                        {cartQty}
                      </span>
                      <button
                        onClick={() => setCartQty(p.sku, cartQty + 1)}
                        className="px-3 py-2 text-ink transition-colors hover:bg-mist active:scale-95"
                        aria-label="Increase quantity in cart"
                        title="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-extrabold text-ink transition-colors hover:bg-navy hover:text-white"
                  >
                    <ShoppingCart size={16} />
                    <span>View Cart ({cartQty})</span>
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-stretch gap-2">
                  <span className="flex items-center rounded border border-line-dark bg-white">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 hover:bg-mist" aria-label="Decrease"><Minus size={15} /></button>
                    <span className="tabular w-8 text-center text-sm font-extrabold">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 hover:bg-mist" aria-label="Increase"><Plus size={15} /></button>
                  </span>
                  <button onClick={() => add(p, qty)} className="flex-1 rounded bg-gold px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Add to Cart</button>
                </div>
              )}
              <button onClick={() => toggleCompare(p.sku)} className={`mt-2 w-full rounded border py-2.5 text-[13px] font-bold transition-colors ${inCompare ? "border-navy bg-navy text-white" : "border-line-dark text-steel hover:border-navy hover:text-navy"}`}>{inCompare ? "Added to Compare ✓" : "Add to Compare"}</button></>
            )}
          </div>
          <div className="mt-4 rounded-md border border-line bg-white p-4 text-sm">
            <p className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" /> Good match for this line. Add to cart and we double check before dispatch.</p>
            <p className="mt-2 flex items-start gap-2"><Truck size={16} className="mt-0.5 shrink-0 text-green-600" /> {p.status}. {p.lead}.</p>
            <p className="mt-2 border-t border-line pt-2 text-[13px] text-steel"><Link className="font-bold text-navy underline" to="/policies?tab=shipping">Shipping</Link> . <Link className="font-bold text-navy underline" to="/policies?tab=returns">Returns</Link> . <Link className="font-bold text-navy underline" to="/policies?tab=warranty">Warranty</Link></p>
          </div>
        </div>
      </div>
      <div id="product-detail-tabs" className="mt-8 overflow-hidden rounded-md border border-line">
        <div className="flex flex-wrap border-b border-line bg-mist">
          {[
            ["specs", "Technical Specs"],
            ...(p.dhollandiaSpecs ? [["characteristics", "Characteristics & Architecture"]] : []),
            ["fitment", "Fitment & Standards"],
            ["freight", "Freight & Delivery"],
            ["reviews", `Customer Reviews (${reviewsList.length || p.reviews || 0})`],
          ].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-bold transition-colors ${tab === t ? "bg-white text-navy shadow-[inset_0_2px_0_#002049]" : "text-steel hover:text-ink"}`}>{label}</button>
          ))}
        </div>
        <div className="bg-white p-5">
          {tab === "specs" && (
            <div className="space-y-5">
              {(p.specs?.Certification || p.specs?.['Australian Standard']) && (
                <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/30 p-4 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2 shadow-xs">
                      <img
                        src="/images/badges/australian-standard-certified.png"
                        alt="Australian Standard Certified"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-black uppercase tracking-wider text-navy">
                          Australian Standard Approved Certification
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          <CheckCircle2 size={12} className="text-emerald-700" />
                          Aus Standard Approved
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-ink">
                        {p.specs.Certification || p.specs['Australian Standard']}
                      </p>
                      <p className="mt-1 text-xs text-steel leading-relaxed">
                        Engineered and certified in strict compliance with Australian Heavy Vehicle National Regulations (NHVR), ADR mandates, and Standards Australia commercial guidelines.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(p.description || p.desc) && (
                <div className="rounded-lg border border-line bg-mist/30 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-steel mb-1.5">
                    Engineering Overview & Fleet Application
                  </p>
                  <p className="text-sm leading-relaxed text-ink font-normal">
                    {p.description || p.desc}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {p.specs?.Dimensions && (
                  <div className="rounded-lg border border-line bg-mist/40 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-steel">
                      <Ruler size={15} className="text-navy" />
                      <span>Catalogue Dimensions</span>
                    </div>
                    <p className="mt-2 font-mono text-base font-extrabold text-ink">
                      {p.specs.Dimensions}
                    </p>
                    <p className="mt-1 text-[11px] text-faint">
                      Official catalogue profile dimensions & sizing specification.
                    </p>
                  </div>
                )}

                {p.specs?.['Technical Specification'] && (
                  <div className="rounded-lg border border-line bg-mist/40 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-steel">
                      <Award size={15} className="text-navy" />
                      <span>Technical Specification</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-ink">
                      {p.specs['Technical Specification']}
                    </p>
                    <p className="mt-1 text-[11px] text-faint">
                      Commercial vehicle fleet application and engineering standard.
                    </p>
                  </div>
                )}
              </div>

              {(() => {
                const chartSpecs = getCategorizedSpecs(p.specs);
                if (chartSpecs.length === 0) return null;
                return (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-steel">
                      Product Parameters & Specifications
                    </p>
                    <div className="overflow-hidden rounded-md border border-line">
                      <table className="w-full text-sm">
                        <tbody>
                          {chartSpecs.map(([k, v], i) => (
                            <tr key={k} className={i % 2 ? "bg-white" : "bg-mist/60"}>
                              <td className="w-2/5 px-3.5 py-2.5 font-bold text-steel border-r border-line/60">
                                {k}
                              </td>
                              <td className="px-3.5 py-2.5 font-medium text-ink">
                                {v}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {p.category === "tail-lifts" && (
                <div className="mt-4 flex items-center justify-between rounded-md border border-gold/40 bg-gold/10 p-3.5 text-xs text-ink">
                  <div>
                    <span className="font-bold">Need customized platform dimensions or higher tonnage?</span>
                    <p className="text-steel">We supply customized arm centers, roll stops, and battery isolation setups.</p>
                  </div>
                  <Link to={`/tail-lift-enquiry?sku=${p.sku}`} className="rounded bg-navy px-3.5 py-2 font-bold text-white hover:bg-ink">Submit Spec →</Link>
                </div>
              )}
            </div>
          )}
          {tab === "characteristics" && p.dhollandiaSpecs && (
            <div className="space-y-4">
              <p className="text-xs text-steel">
                Standard technical architecture following Australian commercial cantilever tail lift specifications (similar to Dhollandia DH-LM series):
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(p.dhollandiaSpecs).map(([title, detail]) => (
                  <div key={title} className="rounded border border-line bg-mist/50 p-3.5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-navy">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-steel">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "fitment" && (
            <div className="space-y-4 text-sm leading-6 text-steel">
              <p>Designed for Australian fleet conditions, this {p.category.replace("-", " ")} line suits {p.fit.charAt(0).toLowerCase() + p.fit.slice(1)}.</p>

              {(p.specs?.Certification || p.specs?.['Australian Standard']) && (
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/badges/australian-standard-certified.png"
                      alt="Australian Standard"
                      className="h-14 w-14 object-contain rounded-lg border border-slate-200 p-1 bg-white shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black uppercase tracking-wide text-navy">Australian Fleet Standards & Compliance</p>
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-700">Certified</span>
                      </div>
                      <p className="mt-0.5 text-xs font-extrabold text-ink">
                        {p.specs.Certification || p.specs['Australian Standard']}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-steel leading-relaxed">
                    Complies with National Heavy Vehicle Regulator (NHVR) safety rules, ADR standards, and workshop replacement guidelines across Australia.
                  </p>
                </div>
              )}

              {p.category === "tail-lifts" && (
                <div className="rounded-md bg-mist p-3 text-xs leading-relaxed">
                  <p className="font-bold text-ink">ADR 84/00 & AS/NZS 1418.8 Fleet Check:</p>
                  <p>All Aurex cantilever tail lifts are engineered to meet Australian rear underrun safety and commercial vehicle hoist guidelines. Provide your chassis model, overhang, and bed height for engineering sign-off before dispatch.</p>
                </div>
              )}
              <p>Check measurements against your old part, or send our VIC desk your VIN on <a className="font-bold text-navy underline" href={COMPANY.phoneHref}>{COMPANY.phone}</a>.</p>
            </div>
          )}
          {tab === "freight" && <p className="max-w-3xl text-sm leading-6 text-steel">Order by 2pm for same day dispatch ex Campbellfield. Free road freight over {freeOver}. Unused parts in original packaging can be returned within 30 days, see our <Link className="font-bold text-navy underline" to="/policies?tab=returns">returns policy</Link>.</p>}
          {tab === "reviews" && (
            <div className="space-y-6">
              {/* Ratings Summary Bar */}
              <div className="flex flex-col gap-6 rounded-lg border border-line bg-mist/40 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-ink">{p.rating}</span>
                    <span className="block text-xs font-semibold text-faint">out of 5</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gold text-lg">
                      {"★★★★★"}
                    </div>
                    <p className="mt-1 text-xs text-steel">
                      Based on <strong className="text-ink">{reviewsList.length || p.reviews || 0} genuine reviews</strong> from verified Australian fleets & workshops
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-white border border-line p-3 text-xs text-steel max-w-sm">
                  <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
                  <span>
                    <strong>Genuine Verified Purchase:</strong> Ratings are verified and submitted by account holders after orders are successfully delivered.
                  </span>
                </div>
              </div>

              {/* Reviews List */}
              {reviewsList.length > 0 ? (
                <div className="space-y-4">
                  {reviewsList.map((rev) => (
                    <div key={rev._id} className="rounded-lg border border-line bg-white p-5 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink text-sm">{rev.reviewerName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 size={11} /> Verified Buyer
                            </span>
                          )}
                          {rev.reviewerRole && (
                            <span className="text-xs text-faint hidden sm:inline">• {rev.reviewerRole}</span>
                          )}
                        </div>
                        <span className="text-xs text-faint">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex text-gold text-xs">
                          {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                            <span key={idx}>★</span>
                          ))}
                        </div>
                        {rev.truckModelReviewed && (
                          <span className="rounded bg-mist px-2 py-0.5 text-[11px] font-semibold text-steel">
                            Fitted on: {rev.truckModelReviewed}
                          </span>
                        )}
                      </div>

                      {rev.title && (
                        <h4 className="mt-2 text-sm font-bold text-ink">{rev.title}</h4>
                      )}

                      {rev.comment && (
                        <p className="mt-1 text-xs leading-relaxed text-steel">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-line p-8 text-center">
                  <p className="text-sm font-bold text-ink">No reviews written yet for this part</p>
                  <p className="mt-1 text-xs text-steel max-w-md mx-auto">
                    Have you fitted this part? Log into your account once it is delivered to submit genuine fitment and durability ratings.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 rounded-md bg-ink p-4 text-white">
        <ShieldCheck size={19} className="shrink-0 text-gold" />
        <p className="text-sm">Fitted this part? Leave a review after delivery and help the next workshop. <span className="text-gray-300">Reviews appear after moderation.</span></p>
      </div>
      <h2 className="mb-4 mt-10 text-2xl font-extrabold tracking-tight">You May Also Need</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">{related.map((r) => <ProductCard key={r.sku} p={r} badges={false} />)}</div>

      <QuoteEnquiryModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        product={p}
      />
    </main>
  );
}
