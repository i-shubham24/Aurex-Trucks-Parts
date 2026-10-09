import { Link, useLocation } from "react-router-dom";
import { useCompany } from "../store/site";

/* Unknown addresses used to render the home page under the wrong URL. */
export default function NotFound() {
  const { pathname } = useLocation();
  const COMPANY = useCompany();
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 text-center">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-primary">Page not found</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">That page isn't on the shelf</h1>
      <p className="mx-auto mt-2 max-w-md break-words text-sm text-steel">
        Nothing lives at <span className="font-mono font-bold text-ink">{pathname}</span>. It may have moved, or the link may be mistyped.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/shop" className="bg-gold px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Shop All Products</Link>
        <Link to="/" className="border border-ink px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white">Back to Home</Link>
        <a href={COMPANY.phoneHref} className="tabular border border-ink px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white">Call {COMPANY.phone}</a>
      </div>
    </main>
  );
}
