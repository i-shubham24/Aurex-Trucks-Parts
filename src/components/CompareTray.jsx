import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GitCompareArrows, ShoppingCart, Star, Trash2, X } from "lucide-react";
import { PRODUCTS, formatAUD } from "../data/products";
import { COMPANY } from "../data/company";
import { imgFor } from "../data/images";
import { useCart } from "../store/cart";

export default function CompareTray() {
  const { compare, toggleCompare, clearCompare, add } = useCart();
  const [open, setOpen] = useState(false);
  const items = useMemo(() => compare.map((s) => PRODUCTS.find((p) => p.sku === s)).filter(Boolean), [compare]);
  if (items.length === 0) return null;

  const priced = items.filter((p) => p.price != null);
  const bestSku = priced.length ? priced.reduce((a, b) => (a.price <= b.price ? a : b)).sku : null;
  const topRated = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.sku;

  const rows = [
    { label: "Price", render: (p) => (
      <span className="inline-flex flex-wrap items-center gap-2">
        {p.price == null
          ? <span className="text-[15px] font-extrabold text-primary">Enquire</span>
          : <span className="tabular text-[17px] font-extrabold">{formatAUD(p.price)}</span>}
        {bestSku === p.sku && <span className="bg-green-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Best price</span>}
      </span>) },
    { label: "Rating", render: (p) => (
      <span className="inline-flex items-center gap-1.5">
        <span className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} className={s <= Math.round(p.rating || 0) ? "fill-gold text-gold" : "fill-line text-line"} />)}</span>
        <b className="text-[13px]">{p.rating}</b><span className="text-xs text-faint">({p.reviews})</span>
        {topRated === p.sku && items.length > 1 && <span className="bg-gold/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">Top rated</span>}
      </span>) },
    { label: "Stock", render: (p) => (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${String(p.status).includes("In stock") ? "bg-ink text-white" : "bg-mist text-steel"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${String(p.status).includes("In stock") ? "bg-green-500" : "bg-faint"}`} />{p.status}
      </span>) },
    { label: "Fitment", render: (p) => <span className="block max-w-[220px] leading-snug text-steel">{p.fit}</span> },
    { label: "Specs", render: (p) => <span className="block max-w-[220px] leading-snug text-steel">{Object.entries(p.specs || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(" . ")}</span> },
  ];
  const cols = `130px repeat(${items.length}, minmax(170px, 1fr))`;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-ink py-2 pl-2 pr-2 text-white shadow-2xl">
        <span className="flex -space-x-2 pl-2">{items.map((p) => <span key={p.sku} className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-[10px] font-black">{p.sku.slice(0, 2)}</span>)}</span>
        <span className="px-1 text-[13px] font-bold">Compare ({items.length}/3)</span>
        <button onClick={() => setOpen(true)} className="rounded-full bg-gold px-5 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-white">Compare</button>
        <button onClick={clearCompare} className="p-2 text-white/50 hover:text-white" aria-label="Clear compare"><X size={15} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
            <div className="flex shrink-0 items-start gap-4 bg-ink px-5 py-5 text-white sm:px-7">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-gold text-ink"><GitCompareArrows size={19} /></span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Side by side . {items.length} of 3</p>
                <p className="text-[22px] font-extrabold leading-tight sm:text-[26px]">Compare the difference</p>
                <p className="mt-0.5 text-[13px] text-white/60">Price, rating, stock and fitment. Pick the right line.</p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto shrink-0 rounded border border-white/20 p-2 transition-colors hover:bg-white hover:text-ink" aria-label="Close compare"><X size={16} /></button>
            </div>
            <div className="overflow-auto p-5 sm:p-7">
              <div className="grid gap-3" style={{ gridTemplateColumns: cols }}>
                <div />
                {items.map((p) => (
                  <div key={p.sku} className="relative overflow-hidden rounded-md border border-line bg-white">
                    <span className="block aspect-[16/9] overflow-hidden bg-mist">{imgFor(p.sku) && <img src={imgFor(p.sku)} alt="" className="h-full w-full object-cover" />}</span>
                    <button onClick={() => toggleCompare(p.sku)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-faint shadow transition-colors hover:text-primary" aria-label={`Remove ${p.sku}`}><Trash2 size={13} /></button>
                    <div className="p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-faint">{p.sub} . {p.sku}</p>
                      <p className="mt-0.5 line-clamp-2 min-h-9 text-[13px] font-bold leading-snug">{p.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 overflow-hidden rounded-md border border-line">
                {rows.map((r, ri) => (
                  <div key={r.label} className={`grid items-center gap-3 px-3 py-3 sm:px-4 ${ri % 2 ? "bg-mist" : "bg-white"}`} style={{ gridTemplateColumns: cols }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-faint">{r.label}</p>
                    {items.map((p) => <div key={p.sku} className="min-w-0 text-[13.5px]">{r.render(p)}</div>)}
                  </div>
                ))}
                <div className="grid items-center gap-3 bg-ink px-3 py-4 sm:px-4" style={{ gridTemplateColumns: cols }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Next step</p>
                  {items.map((p) => (
                    <div key={p.sku} className="flex flex-wrap items-center gap-2">
                      {p.price == null
                        ? <a href={COMPANY.phoneHref} onClick={() => setOpen(false)} className="rounded bg-white px-4 py-2.5 text-xs font-bold transition-colors hover:bg-gold hover:text-ink">Call to Enquire</a>
                        : <button onClick={() => { add(p); setOpen(false); }} className="rounded bg-gold px-4 py-2.5 text-xs font-bold transition-colors hover:bg-white"><span className="inline-flex items-center gap-1.5"><ShoppingCart size={13} /> Add to Cart</span></button>}
                      <button onClick={() => toggleCompare(p.sku)} className="text-xs font-semibold text-white/50 underline underline-offset-2 hover:text-white">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
