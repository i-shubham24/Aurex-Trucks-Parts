import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, PackageSearch, Phone, Search, ShoppingCart, User, X } from "lucide-react";
import { COMPANY } from "../data/company";
import { useCart } from "../store/cart";
import { formatAUD, PRODUCTS } from "../data/products";
import { imgFor } from "../data/images";

function AccountModal({ mode, close, onDone }) {
  const [tab, setTab] = useState(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [done, setDone] = useState(false);
  const input = "h-14 w-full rounded-md border border-line-dark bg-white px-4 text-[15px] outline-none placeholder:text-faint focus:border-gold";
  const submit = (e) => {
    e.preventDefault();
    const who = tab === "signup" ? (name.split(" ")[0] || "Trader") : (email.split("@")[0] || "Trader");
    try { localStorage.setItem("aurex-user", JSON.stringify({ name: who, email })); } catch { /* private mode */ }
    setDone(true);
    onDone(who);
  };
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={close} />
      <div className="relative grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-2xl sm:grid-cols-[380px_minmax(0,1fr)]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-7 text-white sm:flex">
          <img src="/images/web/hero-roadtrain.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <span className="relative grid h-13 w-13 place-items-center rounded-full bg-gold font-mono text-sm font-extrabold text-ink">AT</span>
          <span className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Trade accounts</p>
            <p className="mt-2 text-2xl font-extrabold leading-snug md:text-[28px]">Counter pricing, unlocked.</p>
            <ul className="mt-4 space-y-2 text-[15px] text-gray-200">
              <li>✓ ABN trade tiers</li>
              <li>✓ 30 day fleet terms</li>
              <li>✓ Saved vehicles + lists</li>
            </ul>
          </span>
        </div>
        <div className="relative p-6 sm:p-10">
          <button onClick={close} aria-label="Close" className="absolute right-4 top-4 text-faint hover:text-ink"><X size={22} /></button>
          {done ? (
            <div className="py-10 text-center">
              <p className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-2xl font-extrabold text-ink">✓</p>
              <h3 className="mt-4 text-2xl font-extrabold">{tab === "signup" ? "Account created" : "Welcome back"}</h3>
              <p className="mt-2 text-[15px] text-steel">Trade pricing applies at checkout.</p>
              <button onClick={close} className="mt-6 w-full rounded bg-ink py-3.5 text-base font-bold text-white transition-colors hover:bg-navy">Start Shopping</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1 rounded-md bg-mist p-1.5">
                <button onClick={() => setTab("login")} className={`rounded py-2.5 text-base font-bold transition-colors ${tab === "login" ? "bg-white text-ink shadow" : "text-steel"}`}>Login</button>
                <button onClick={() => setTab("signup")} className={`rounded py-2.5 text-base font-bold transition-colors ${tab === "signup" ? "bg-white text-ink shadow" : "text-steel"}`}>Sign Up</button>
              </div>
              <form onSubmit={submit} className="mt-4 grid gap-3">
                {tab === "signup" && <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={input} />}
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={input} />
                <input required type="password" minLength={6} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password (6+ characters)" className={input} />
                <button className="rounded bg-gold py-3.5 text-base font-bold text-ink transition-colors hover:bg-navy hover:text-white">{tab === "signup" ? "Create Account" : "Login"}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchBox({ onGo }) {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const go = useNavigate();
  const matches = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return [];
    return PRODUCTS.filter((p) => `${p.sku} ${p.name} ${p.sub}`.toLowerCase().includes(query)).slice(0, 6);
  }, [q]);
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
            <button key={p.sku} onMouseDown={(e) => e.preventDefault()} onClick={() => { setFocus(false); setQ(""); if (onGo) onGo(); go(`/product/${p.sku}`); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-mist">
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded bg-mist">{imgFor(p.sku) && <img src={imgFor(p.sku)} alt="" className="h-full w-full object-cover" />}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold">{p.name}</span><span className="font-mono text-[11px] text-faint">{p.sku}</span></span>
              <span className="tabular shrink-0 text-[13px] font-extrabold text-primary">{p.price === null ? "POA" : formatAUD(p.price)}</span>
            </button>
          ))}
          <button onMouseDown={(e) => e.preventDefault()} onClick={submit} className="block w-full bg-mist px-3 py-2 text-center text-[13px] font-bold transition-colors hover:text-navy">See all results →</button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { count, total, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [shop, setShop] = useState(false);
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("aurex-user")); } catch { return null; } });
  const loc = useLocation();

  const logout = () => { try { localStorage.removeItem("aurex-user"); } catch { /* private mode */ } setUser(null); };
  const authed = (who) => { setUser({ name: who }); setAccount(null); };

  const shopActive = loc.pathname.startsWith("/shop");
  const linkCls = (active) => `u-slide px-3.5 py-2.5 text-[14px] font-bold transition-colors hover:text-navy ${active ? "text-navy" : "text-ink"}`;

  return (
    <header className="sticky top-0 z-40">
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
              <Link to="/profile" aria-label="Profile" className="grid h-11 w-11 place-items-center rounded-md border border-ink/30 text-ink transition-colors hover:border-navy hover:text-navy">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[12px] font-extrabold text-white">{user.name[0].toUpperCase()}</span>
              </Link>
            ) : (
              <button onClick={() => setAccount("login")} aria-label="Account" className="grid h-11 w-11 place-items-center rounded-md border border-ink/30 text-ink transition-colors hover:border-navy hover:text-navy"><User size={20} /></button>
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
            <Link to="/shop" className={`flex items-center gap-2.5 rounded-md px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-white transition-colors ${shopActive ? "bg-navy" : "bg-ink hover:bg-navy"}`}><Menu size={16} /> Shop by Category <ChevronDown size={14} /></Link>
            {shop && (
              <div className="absolute left-0 top-full z-40 w-64 overflow-hidden rounded-md border border-line bg-white py-1 shadow-xl">
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
                <button onClick={() => setAccount("login")} className="transition-colors hover:text-navy hover:underline">Login</button>
                <span className="h-3.5 w-px bg-line-dark" />
                <button onClick={() => setAccount("signup")} className="transition-colors hover:text-navy hover:underline">Sign Up</button>
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
              <><button onClick={() => { setMenu(false); setAccount("login"); }}>Login</button>
              <button onClick={() => { setMenu(false); setAccount("signup"); }}>Sign Up</button></>
            )}
          </div>
        </div>
      )}
      {account && <AccountModal mode={account} close={() => setAccount(null)} onDone={(who) => authed(who)} />}
    </header>
  );
}
