import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Printer, Truck } from "lucide-react";
import { formatAUD } from "../data/products";
import { useCompany } from "../store/site";
import { findOrder } from "../utils/orders";
import { useSite } from "../store/site";

export default function OrderSuccess() {
  const { id } = useParams();
  const { settings } = useSite();
  const COMPANY = useCompany();
  const order = findOrder(id);
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-line bg-white p-6 text-center shadow-[0_16px_40px_rgba(0,32,73,0.08)]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50 ring-1 ring-green-200"><CheckCircle2 size={32} className="text-green-700" /></span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Order locked in</h1>
        <p className="mt-1 text-sm text-steel">Packed in Campbellfield VIC. Keep your order ID for tracking.</p>
        <p className="mx-auto mt-3 w-fit rounded-lg bg-gold px-4 py-1.5 font-mono text-lg font-extrabold text-ink">{id}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <Link to={`/track?id=${id}`} className="rounded-lg bg-gold px-6 py-2.5 text-sm font-extrabold text-ink transition-colors hover:bg-navy hover:text-white">Track this order →</Link>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-line-dark px-6 py-2.5 text-sm font-bold text-steel transition-colors hover:border-navy hover:text-navy"><Printer size={15} /> Print Tax Invoice</button>
          <Link to="/shop" className="rounded-lg border border-line-dark px-6 py-2.5 text-sm font-bold text-steel transition-colors hover:border-navy hover:text-navy">Keep shopping</Link>
        </div>
      </div>
      {order ? (
        <div className="mt-5 rounded-md border border-line bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-ink pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-faint">Tax Invoice</p>
              <p className="mt-1 text-lg font-extrabold">Aurex Truck Parts Australia</p>
              <p className="font-mono text-[11px] text-faint">{settings.abn}</p>
            </div>
            <div className="text-right text-[13px] text-steel">
              <p className="font-mono font-bold text-ink">{order.id}</p>
              <p>{new Date(order.placedAt).toLocaleString("en-AU")}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">Billed / deliver to</p>
              <p className="mt-1 font-bold">{order.address?.name}</p>
              <p className="text-steel">{order.address?.address}, {order.address?.suburb} {order.address?.state} {order.address?.postcode}</p>
              <p className="text-steel">{order.address?.phone} . {order.address?.email}</p>
              {order.address?.notes && <p className="mt-1 text-steel">Notes: {order.address.notes}</p>}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faint">Freight + payment</p>
              <p className="mt-1 font-bold">{order.shipping}</p>
              <p className="text-steel">{order.payment}</p>
              <p className="mt-1 flex items-center gap-1.5 text-steel"><Truck size={14} className="text-green-600" /> {order.status}</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            {(order.items || order.lines || []).map((l) => (
              <p key={l.sku} className="flex justify-between gap-3"><span>{l.qty} × {l.name} <span className="font-mono text-[11px] text-faint">{l.sku}</span></span><span className="tabular shrink-0 font-bold">{formatAUD(l.price * l.qty)}</span></p>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <p className="flex justify-between text-steel"><span>Subtotal</span><span className="tabular font-bold text-ink">{formatAUD(order.subtotal)}</span></p>
            {order.discount > 0 && <p className="flex justify-between text-green-700"><span>Promo{order.promoCode ? ` (${order.promoCode})` : ""}</span><span className="tabular font-bold">−{formatAUD(order.discount)}</span></p>}
            <p className="flex justify-between text-steel"><span>Freight</span><span className="tabular font-bold text-ink">{order.shippingFee === 0 ? "FREE" : formatAUD(order.shippingFee)}</span></p>
            <p className="flex justify-between text-steel"><span>GST included (10%)</span><span className="tabular font-bold text-ink">{formatAUD(order.total / 11)}</span></p>
            <p className="tabular flex justify-between pt-1 text-lg font-extrabold"><span>Total paid</span><span>{formatAUD(order.total)}</span></p>
          </div>
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-line bg-mist p-5 text-center text-sm text-steel">Receipt not found on this device, but your order ID above still tracks fine.</p>
      )}
      <p className="mt-4 text-center text-[13px] text-steel">Questions? <a href={COMPANY.phoneHref} className="font-bold text-navy underline">{COMPANY.phone}</a></p>
    </main>
  );
}
