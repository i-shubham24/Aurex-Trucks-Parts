import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, Minus, Phone, Plus, ShieldCheck, Truck } from "lucide-react";
import { formatAUD } from "../data/products";
import { useCatalog } from "../store/catalog";
import { useCompany, useSite } from "../store/site";
import { imgFor } from "../data/images";
import SafeImage from "../components/SafeImage";
import { useCart } from "../store/cart";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { sku } = useParams();
  const { products: PRODUCTS } = useCatalog();
  const COMPANY = useCompany();
  const { settings } = useSite();
  const freeOver = formatAUD(settings.freeFreightOver || 500);
  const p = PRODUCTS.find((x) => x.sku === sku);
  const { add, compare, toggleCompare } = useCart();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("specs");
  if (!p) return <main className="mx-auto max-w-7xl px-4 py-16">Part not on file. <Link to="/shop" className="font-bold text-navy underline">Shop all</Link></main>;
  const related = PRODUCTS.filter((x) => x.category === p.category && x.sku !== p.sku).slice(0, 5);
  const enquiry = p.price === null;
  const inCompare = compare.includes(p.sku);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <Link to="/shop" className="hover:text-navy hover:underline">Shop</Link> / <span className="font-semibold text-ink">{p.sku}</span></p>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-md border border-line bg-white shadow-xs">
            <div className={`flex aspect-[4/3] w-full items-center justify-center ${p.category === "tail-lifts" ? "p-0 overflow-hidden" : "p-6 bg-white"}`}>
              {imgFor(p.sku) ? (
                <SafeImage
                  src={imgFor(p.sku)}
                  alt={p.name}
                  className={p.category === "tail-lifts" ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain"}
                  fallbackIconSize={32}
                />
              ) : (
                <span className="grid h-full w-full place-items-center font-mono text-sm font-bold text-faint">{p.sku}</span>
              )}
            </div>
            <span className={`absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${enquiry ? "bg-ink text-white" : p.status === "Built to order" ? "bg-primary text-white" : "bg-gold text-ink"}`}>{enquiry ? "Enquire" : p.status === "Built to order" ? "Built to Order" : "In Stock"}</span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-px border border-line bg-line text-center text-[12px] font-semibold">
            {[["ADR checked", "Fitment matched"], ["1-2 day dispatch", "Ex Campbellfield"], ["Easy returns", "30 day change of mind"]].map(([t, d]) => (
              <div key={t} className="bg-white px-2 py-3"><p className="font-bold">{t}</p><p className="mt-0.5 text-faint">{d}</p></div>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">{p.sub} . {p.sku}</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{p.name}</h1>
          <p className="mt-1.5 text-sm text-steel">{p.fit}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[13px]"><span className="text-gold">{"★★★★★"}</span><span className="font-bold">{p.rating}</span><span className="text-faint">({p.reviews} reviews)</span></div>
          <div className="mt-4 rounded-md border border-line bg-mist p-4">
            {enquiry ? (
              <>
                <p className="text-2xl font-extrabold">Enquire Price <span className="text-sm font-semibold text-steel">for your fleet</span></p>
                <p className="mt-1 text-[13px] text-steel">
                  {p.category === "tail-lifts"
                    ? "Custom sized to your truck chassis and body dimensions. Engineering review in 4 hours."
                    : "Priced to your drawing or sample. Back within 4 business hours."}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {p.category === "tail-lifts" ? (
                    <Link
                      to={`/tail-lift-enquiry?sku=${p.sku}`}
                      className="flex items-center justify-center gap-2 rounded bg-gold py-3 text-center text-sm font-extrabold text-ink transition-colors hover:bg-navy hover:text-white sm:col-span-2"
                    >
                      Request Tail Lift Quotation Enquiry →
                    </Link>
                  ) : (
                    <Link
                      to={`/contact?topic=${encodeURIComponent(p.name)}&sku=${p.sku}`}
                      className="rounded border border-ink bg-white py-3 text-center text-sm font-bold transition-colors hover:bg-ink hover:text-white"
                    >
                      Send Enquiry
                    </Link>
                  )}
                  <a
                    href={COMPANY.phoneHref}
                    className={`flex items-center justify-center gap-2 rounded bg-ink py-3 text-sm font-bold text-white transition-colors hover:bg-navy ${
                      p.category === "tail-lifts" ? "sm:col-span-2" : ""
                    }`}
                  >
                    <Phone size={16} /> Call {COMPANY.phone}
                  </a>
                </div>
                <p className="mt-2.5 text-center font-mono text-[11px] text-faint">RESPONSE IN 4 BUSINESS HOURS</p>
              </>
            ) : (
              <><div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="tabular text-5xl font-extrabold text-primary">{formatAUD(p.price)}</p>
                <p className="text-right font-mono text-[11px] leading-4 text-faint">{p.status.toUpperCase()}<br />{p.lead.toUpperCase()}</p>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-steel"><Truck size={14} className="text-green-600" /> Order by 2pm, dispatched today ex Campbellfield.</p>
              <div className="mt-3 flex flex-wrap items-stretch gap-2">
                <span className="flex items-center rounded border border-line-dark bg-white">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 hover:bg-mist" aria-label="Decrease"><Minus size={15} /></button>
                  <span className="tabular w-8 text-center text-sm font-extrabold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 hover:bg-mist" aria-label="Increase"><Plus size={15} /></button>
                </span>
                <button onClick={() => add(p, qty)} className="flex-1 rounded bg-gold px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Add to Cart</button>
              </div>
              <button onClick={() => toggleCompare(p.sku)} className={`mt-2 w-full rounded border py-2.5 text-[13px] font-bold transition-colors ${inCompare ? "border-navy bg-navy text-white" : "border-line-dark text-steel hover:border-navy hover:text-navy"}`}>{inCompare ? "Added to Compare ✓" : "Add to Compare"}</button></>
            )}
          </div>
          <div className="mt-4 rounded-md border border-line bg-white p-4 text-sm">
            <p className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" /> Good match for this line. Add to cart and we double check before dispatch.</p>
            <p className="mt-2 flex items-start gap-2"><Truck size={16} className="mt-0.5 shrink-0 text-green-600" /> {p.status}. {p.lead}.</p>
            <p className="mt-2 border-t border-line pt-2 text-[13px] text-steel"><Link className="font-bold text-navy underline" to="/policies">Shipping</Link> . <Link className="font-bold text-navy underline" to="/policies">Returns</Link> . <Link className="font-bold text-navy underline" to="/policies">Warranty</Link></p>
          </div>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-md border border-line">
        <div className="flex border-b border-line bg-mist">
          {[
            ["specs", "Technical Specs"],
            ...(p.dhollandiaSpecs ? [["characteristics", "Characteristics & Architecture"]] : []),
            ["fitment", "Fitment & Standards"],
            ["freight", "Freight & Delivery"],
          ].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-bold transition-colors ${tab === t ? "bg-white text-navy shadow-[inset_0_2px_0_#002049]" : "text-steel hover:text-ink"}`}>{label}</button>
          ))}
        </div>
        <div className="bg-white p-5">
          {tab === "specs" && (
            <div className="space-y-4">
              <table className="w-full text-sm">
                <tbody>{Object.entries(p.specs || {}).map(([k, v], i) => (<tr key={k} className={i % 2 ? "bg-white" : "bg-mist"}><td className="w-2/5 px-3 py-2.5 font-semibold text-steel">{k}</td><td className="px-3 py-2.5 font-medium">{v}</td></tr>))}</tbody>
              </table>
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
              <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="space-y-2 text-sm leading-6 text-steel">
              <p>Designed for Australian fleet conditions, this {p.category.replace("-", " ")} line suits {p.fit.charAt(0).toLowerCase() + p.fit.slice(1)}.</p>
              {p.category === "tail-lifts" && (
                <div className="rounded-md bg-mist p-3 text-xs leading-relaxed">
                  <p className="font-bold text-ink">ADR 84/00 & AS/NZS 1418.8 Fleet Check:</p>
                  <p>All Aurex cantilever tail lifts are engineered to meet Australian rear underrun safety and commercial vehicle hoist guidelines. Provide your chassis model, overhang, and bed height for engineering sign-off before dispatch.</p>
                </div>
              )}
              <p>Check measurements against your old part, or send our VIC desk your VIN on <a className="font-bold text-navy underline" href={COMPANY.phoneHref}>{COMPANY.phone}</a>.</p>
            </div>
          )}
          {tab === "freight" && <p className="max-w-3xl text-sm leading-6 text-steel">Order by 2pm for same day dispatch ex Campbellfield. Free road freight over {freeOver}. Unused parts in original packaging can be returned within 30 days, see our <Link className="font-bold text-navy underline" to="/policies">returns policy</Link>.</p>}
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 rounded-md bg-ink p-4 text-white">
        <ShieldCheck size={19} className="shrink-0 text-gold" />
        <p className="text-sm">Fitted this part? Leave a review after delivery and help the next workshop. <span className="text-gray-300">Reviews appear after moderation.</span></p>
      </div>
      <h2 className="mb-4 mt-10 text-2xl font-extrabold tracking-tight">You May Also Need</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">{related.map((r) => <ProductCard key={r.sku} p={r} badges={false} />)}</div>
    </main>
  );
}
