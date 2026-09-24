import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, PackageSearch, Phone, Search, ShoppingCart, User, X } from "lucide-react";
import { useCompany } from "../store/site";
import { useSite } from "../store/site";
import { useCart } from "../store/cart";
import { useAuth } from "../store/auth";
import { useCatalog } from "../store/catalog";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";

function SearchBox({ onGo }) {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const go = useNavigate();
  const { products: PRODUCTS } = useCatalog();
  const matches = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return [];
    return PRODUCTS.filter((p) => `${p.sku} ${p.name} ${p.sub}`.toLowerCase().includes(query)).slice(0, 6);
  }, [q, PRODUCTS]);
  const submit = (e) => {
    e.preventDefault();
    setFocus(false);
    if (onGo) onGo();
    go(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };
  return (
    <div className="relative w-full">
      <form onSubmit={submit} className="flex w-full items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
          placeholder="Search by part number, OEM, or keyword"
          className="h-10 w-full min-w-0 rounded-l-md border border-line-dark bg-white px-4 text-sm text-ink outline-none placeholder:text-faint focus:border-gold" />
        <button className="grid h-10 w-12 shrink-0 place-items-center rounded-r-md bg-ink text-white transition-colors hover:bg-navy" aria-label="Search"><Search size={17} /></button>
      </form>
      {focus && matches.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-line bg-white shadow-xl">
          {matches.map((p) => (
            <button key={p.sku} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setFocus(false); setQ(""); if (onGo) onGo(); go(`/product/${p.sku}`); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-mist">
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded bg-mist">{imgFor(p.sku) && <img src={imgFor(p.sku)} alt="" className="h-full w-full object-cover" />}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold">{p.name}</span><span className="font-mono text-[11px] text-faint">{p.sku}</span></span>
              <span className="tabular shrink-0 text-[13px] font-extrabold text-primary">{p.price === null ? "POA" : formatAUD(p.price)}</span>
            </button>
          ))}
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={submit} className="block w-full bg-mist px-3 py-2 text-center text-[13px] font-bold transition-colors hover:text-navy">See all results →</button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { count, total, setOpen } = useCart();
  const { user, logout } = useAuth();
  const COMPANY = useCompany();
  const { settings } = useSite();
  const [menu, setMenu] = useState(false);
  const [shop, setShop] = useState(false);
  const [notice, setNotice] = useState(true);
  const loc = useLocation();

  const shopActive = loc.pathname.startsWith("/shop");
  const linkCls = (active) => `u-slide px-3.5 py-2.5 text-[14px] font-bold transition-colors hover:text-navy ${active ? "text-navy" : "text-ink"}`;

  return (
    <header className="sticky top-0 z-40">
      {notice && settings.announcement && (
        <div className="flex items-center justify-center gap-3 bg-ink px-4 py-1.5 text-center">
          <p className="truncate text-[12px] font-semibold text-white">{settings.announcement}</p>
          <button onClick={() => setNotice(false)} aria-label="Dismiss announcement" className="shrink-0 text-gray-400 transition-colors hover:text-gold"><X size={14} /></button>
        </div>
      )}
      {/* ── Main header bar (yellow) — logo / search / contact / account / cart ── */}
      <div id="top" className="bg-gold text-ink">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
          <Link to="/" className="shrink-0 rounded bg-white px-2 py-1"><img src="/logo.jpeg" alt="Aurex Truck Parts" className="h-10 w-auto" /></Link>
          <div className="hidden min-w-0 flex-1 md:flex md:justify-end"><div className="w-full max-w-md"><SearchBox /></div></div>
          <a href={COMPANY.phoneHref} className="group hidden shrink-0 items-center gap-2 xl:flex">
            <Phone size={26} className="text-primary transition-colors group-hover:text-navy" />
            <span className="leading-tight"><span className="block text-[12px] text-ink/70">Call to order</span><span className="tabular block text-[17px] font-extrabold text-ink group-hover:text-navy">{COMPANY.phone}</span></span>
          </a>
          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            {user ? (
              <Link to="/profile" aria-label="Profile" title={user.name} className="flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-white transition-colors hover:bg-navy">
                <span className="text-lg font-extrabold leading-none text-gold">{(user.name || "A")[0].toUpperCase()}</span>
                <span className="hidden max-w-24 truncate text-sm font-extrabold sm:block">{(user.name || "Trader").split(" ")[0]}</span>
              </Link>
            ) : (
              <Link to="/login" aria-label="Account" className="grid h-11 w-11 place-items-center rounded-md border border-ink/30 text-ink transition-colors hover:border-navy hover:text-navy"><User size={20} /></Link>
            )}
            <button onClick={() => setOpen(true)} aria-label="Open cart" className="flex h-11 items-center gap-2 whitespace-nowrap rounded bg-ink px-6 text-sm font-extrabold text-white transition-colors hover:bg-navy">
              <span className="relative"><ShoppingCart size={19} />{count > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">{count}</span>}</span>
              Cart {formatAUD(total)}
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-md text-ink hover:bg-ink/10 md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
          {/* mobile search — second line */}
          <div className="w-full md:hidden"><SearchBox onGo={() => setMenu(false)} /></div>
        </div>
      </div>
      <nav className="hidden border-b border-line bg-white md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2">
          <div className="relative" onMouseEnter={() => setShop(true)} onMouseLeave={() => setShop(false)}>
            <Link to="/shop" aria-haspopup="true" aria-expanded={shop} onFocus={() => setShop(true)} onClick={() => setShop((v) => !v)} className={`flex items-center gap-2.5 rounded-md px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-white transition-colors ${shopActive ? "bg-navy" : "bg-ink hover:bg-navy"}`}><Menu size={16} /> Shop by Category <ChevronDown size={14} className={`transition-transform ${shop ? "rotate-180" : ""}`} /></Link>
            {shop && (
              <div className="absolute left-0 top-full z-40 w-64 overflow-hidden rounded-md border border-line bg-white py-1 shadow-xl" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setShop(false); }}>
                <Link to="/shop" onClick={() => setShop(false)} className="block px-4 py-2.5 text-sm font-bold transition-colors hover:bg-mist hover:text-navy">All Products <span className="float-right font-mono text-[11px] text-faint">36</span></Link>
                <Link to="/shop/tail-lifts" onClick={() => setShop(false)} className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-mist hover:text-navy">Tail Lifts <span className="font-mono text-[11px] text-faint">6 lines</span></Link>
                <Link to="/shop/trailer-parts" onClick={() => setShop(false)} className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-mist hover:text-navy">Trailer Parts <span className="font-mono text-[11px] text-faint">13 lines</span></Link>
                <Link to="/shop/accessories" onClick={() => setShop(false)} className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-mist hover:text-navy">Accessories <span className="font-mono text-[11px] text-faint">17 lines</span></Link>
              </div>
            )}
          </div>
          <Link to="/" className={linkCls(loc.pathname === "/")}>Home</Link>
          <Link to="/shop" className={linkCls(shopActive)}>Shop</Link>
          <Link to="/about" className={linkCls(loc.pathname === "/about")}>About Us</Link>
          <Link to="/contact" className={linkCls(loc.pathname === "/contact")}>Contact</Link>
          <Link to="/track" className={linkCls(loc.pathname === "/track")}>Track Order</Link>
          <span className="ml-auto hidden items-center gap-3 text-[13px] font-bold lg:flex">
            {user ? (
              <>
                <Link to="/profile" className="transition-colors hover:text-navy hover:underline">{user.name}</Link>
                <span className="h-3.5 w-px bg-line-dark" />
                <button onClick={logout} className="transition-colors hover:text-navy hover:underline">Logout</button>
                <span className="h-3.5 w-px bg-line-dark" />
              </>
            ) : (
              <>
                <Link to="/login" className="transition-colors hover:text-navy hover:underline">Login</Link>
                <span className="h-3.5 w-px bg-line-dark" />
                <Link to="/signup" className="rounded-md bg-ink px-4 py-1.5 text-white transition-colors hover:bg-navy">Sign Up</Link>
                <span className="h-3.5 w-px bg-line-dark" />
              </>
            )}
            <PackageSearch size={15} className="text-faint" />
            <Link to="/orders" className="transition-colors hover:text-navy hover:underline">My Orders</Link>
          </span>
        </div>
      </nav>
      {menu && (
        <div className="border-t border-line bg-white px-4 py-2 md:hidden">
          <Link to="/" onClick={() => setMenu(false)} className="block border-t border-line py-3 text-[15px] font-bold first:border-0">Home</Link>
          <Link to="/shop" onClick={() => setMenu(false)} className="block border-t border-line py-3 text-[15px] font-bold first:border-0">Shop All Products</Link>
          <Link to="/shop/tail-lifts" onClick={() => setMenu(false)} className="block border-t border-line py-3 pl-4 text-sm font-semibold text-steel first:border-0">Tail Lifts</Link>
          <Link to="/shop/trailer-parts" onClick={() => setMenu(false)} className="block border-t border-line py-3 pl-4 text-sm font-semibold text-steel first:border-0">Trailer Parts</Link>
          <Link to="/shop/accessories" onClick={() => setMenu(false)} className="block border-t border-line py-3 pl-4 text-sm font-semibold text-steel first:border-0">Accessories</Link>
          <Link to="/about" onClick={() => setMenu(false)} className="block border-t border-line py-3 text-[15px] font-bold first:border-0">About Us</Link>
          <Link to="/contact" onClick={() => setMenu(false)} className="block border-t border-line py-3 text-[15px] font-bold first:border-0">Contact</Link>
          <Link to="/track" onClick={() => setMenu(false)} className="block border-t border-line py-3 text-[15px] font-bold first:border-0">Track Order</Link>
          <Link to="/orders" onClick={() => setMenu(false)} className="block border-t border-line py-3 text-[15px] font-bold first:border-0">My Orders</Link>
          <div className="flex gap-4 border-t border-line py-3 text-[15px] font-bold">
            {user ? (
              <><Link to="/profile" onClick={() => setMenu(false)}>{user.name}</Link>
              <button onClick={logout}>Logout</button></>
            ) : (
              <><Link to="/login" onClick={() => setMenu(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMenu(false)}>Sign Up</Link></>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
