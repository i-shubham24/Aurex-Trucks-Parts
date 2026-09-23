import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import { useCart } from "../store/cart";

const FREE_FREIGHT = 500;

export default function CartDrawer() {
  const { lines, setQty, remove, total, open, setOpen } = useCart();
  if (!open) return null;
  const progress = Math.min(1, total / FREE_FREIGHT);
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
          <p className="flex items-center gap-2 text-[15px] font-bold"><ShoppingCart size={18} /> Shopping Cart ({lines.reduce((s, l) => s + l.qty, 0)})</p>
          <button onClick={() => setOpen(false)} aria-label="Close cart" className="transition-colors hover:text-gold"><X size={20} /></button>
        </div>
        <div className="border-b border-line bg-gold/15 px-4 py-3">
          {total >= FREE_FREIGHT
            ? <p className="text-[13px] font-bold text-green-700">You unlocked FREE road freight.</p>
            : <p className="text-[13px] text-steel">Add <strong className="tabular">{formatAUD(FREE_FREIGHT - total)}</strong> more for free road freight.</p>}
          <div className="mt-2 h-1.5 rounded-full bg-pale"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress * 100}%` }} /></div>
        </div>
        <div className="flex-1 overflow-auto px-4 py-3">
          {lines.length === 0 && <p className="py-6 text-center text-sm text-steel">Your cart is empty.<br />Trailer parts are enquiry only, call us for those.</p>}
          {lines.map((l) => (
            <div key={l.sku} className="mb-3 flex gap-3 rounded-md border border-line p-2.5">
              <span className="h-16 w-16 shrink-0 overflow-hidden rounded bg-mist">{imgFor(l.sku) && <img src={imgFor(l.sku)} alt="" className="h-full w-full object-cover" />}</span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] font-bold leading-snug">{l.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-faint">{l.sku}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="flex items-center rounded border border-line-dark">
                    <button onClick={() => setQty(l.sku, l.qty - 1)} className="px-2 py-1 transition-colors hover:bg-mist" aria-label="Decrease"><Minus size={13} /></button>
                    <span className="tabular w-7 text-center text-[13px] font-bold">{l.qty}</span>
                    <button onClick={() => setQty(l.sku, l.qty + 1)} className="px-2 py-1 transition-colors hover:bg-mist" aria-label="Increase"><Plus size={13} /></button>
                  </span>
                  <span className="tabular text-sm font-extrabold text-primary">{formatAUD(l.price * l.qty)}</span>
                </div>
              </div>
              <button onClick={() => remove(l.sku)} className="self-start text-[11px] font-bold text-faint underline transition-colors hover:text-navy">Remove</button>
            </div>
          ))}
        </div>
        <div className="border-t border-line px-4 py-3">
          <div className="tabular flex justify-between text-[15px] font-extrabold"><span>Subtotal</span><span>{formatAUD(total)}</span></div>
          <p className="mt-0.5 text-[11px] text-faint">Freight calculated at checkout.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setOpen(false)} className="rounded border border-ink py-2.5 text-sm font-bold transition-colors hover:bg-mist">Continue shopping</button>
            <Link to="/checkout" onClick={() => setOpen(false)} className="rounded bg-gold py-2.5 text-center text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Checkout</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
