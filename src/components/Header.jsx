import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronDown, ClipboardList, LogIn, LogOut, Menu,
  PackageSearch, Phone, Search, ShoppingCart, User, UserPlus, X,
} from "lucide-react";
import { useCompany } from "../store/site";
import { useSite } from "../store/site";
import { useCart } from "../store/cart";
import { useAuth } from "../store/auth";
import { formatAUD } from "../data/products";
import { imgFor } from "../data/images";
import SafeImage from "./SafeImage";
import useLockBody from "../utils/useLockBody";
import { useCategories } from "../hooks/api/useCategories";
import { useProducts } from "../hooks/api/useProducts";

const iconBtn =
  "group/tip relative grid h-11 w-11 shrink-0 place-items-center rounded-md text-ink transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";
const panel = "menu-in overflow-hidden rounded-lg border border-line bg-white shadow-[0_24px_60px_rgba(17,17,17,0.14)]";
const menuItem = "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-mist hover:text-navy";

/* Icon-only controls still need a name: shown on hover / keyboard focus (desktop). */
function Tip({ children }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100 lg:block">
      {children}
    </span>
  );
}

function SearchBox({ onDone, autoFocus = false }) {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [focus, setFocus] = useState(false);
  const go = useNavigate();

  // Debounced so a fast typist doesn't fire one catalogue request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setTerm(q.trim()), 220);
    return () => clearTimeout(id);
  }, [q]);

  const { data } = useProducts({ search: term, limit: 6 }, { enabled: term.length > 1 });
  const matches = term.length > 1 ? data?.products || [] : [];

  const submit = (e) => {
    e.preventDefault();
    setFocus(false);
    if (onDone) onDone();
    go(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  };

  return (
    <div className="relative w-full">
      <form onSubmit={submit} role="search" className="relative flex w-full items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 200)}
          autoFocus={autoFocus}
          aria-label="Search the catalogue"
          placeholder="Search by part number, OEM, or keyword"
          className="h-11 w-full min-w-0 rounded-md border border-line-dark bg-mist pl-4 pr-12 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink focus:bg-white"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded bg-gold text-ink transition-colors hover:bg-navy hover:text-white"
        >
          <Search size={17} />
        </button>
      </form>

      {focus && matches.length > 0 && (
        <div className={`absolute left-0 right-0 top-full z-50 mt-2 ${panel}`}>
          {matches.map((p) => {
            const imgSrc = p.images?.[0]?.url || p.imageUrl || imgFor(p.sku);
            return (
              <button
                key={p.sku || p.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setFocus(false);
                  setQ("");
                  if (onDone) onDone();
                  go(`/product/${p.sku}`);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-mist"
              >
                <span className="h-9 w-9 shrink-0 overflow-hidden rounded bg-mist">
                  <SafeImage src={imgSrc} alt="" className="h-full w-full object-cover" fallbackIconSize={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{p.name}</span>
                  <span className="font-mono text-[11px] text-faint">{p.sku}</span>
                </span>
                <span className="tabular shrink-0 text-[13px] font-extrabold text-primary">
                  {p.price === null ? "POA" : formatAUD(p.price)}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={submit}
            className="block w-full border-t border-line bg-mist px-3 py-2.5 text-center text-[13px] font-bold transition-colors hover:text-navy"
          >
            See all results →
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { count, setOpen: setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const { data: categories = [] } = useCategories();
  const COMPANY = useCompany();
  const { settings } = useSite();
  const loc = useLocation();

  const [open, setOpen] = useState(null); // dropdown: "categories" | "account" | null
  const [drawer, setDrawer] = useState(false); // mobile menu
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const sentinelRef = useRef(null);
  const closeTimer = useRef(null);

  useLockBody(drawer);

  const totalLines = useMemo(
    () => categories.reduce((sum, c) => sum + (c.count || c.productCount || 0), 0),
    [categories]
  );

  /* The bar is taller than the part that sticks (lg:-top-11), so its height never
     changes and the page can't jump; `scrolled` only re-centres the row and
     shrinks the logo inside that fixed box. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > (sentinelRef.current?.offsetTop || 0) + 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [notice, settings.announcement]);

  const closeAll = () => {
    setOpen(null);
    setDrawer(false);
    setSearching(false);
  };
  useEffect(closeAll, [loc.pathname, loc.search, loc.hash]);

  useEffect(() => {
    if (!open && !searching && !drawer) return;
    const onKey = (e) => { if (e.key === "Escape") closeAll(); };
    const onDown = (e) => { if (headerRef.current && !headerRef.current.contains(e.target)) closeAll(); };
    const onResize = () => { if (window.innerWidth >= 1024) setDrawer(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open, searching, drawer]);

  /* Dropdowns open on mouse hover, and toggle on tap / Enter so they work without a mouse. */
  const hover = (name) => ({
    onPointerEnter: (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(closeTimer.current);
      setOpen(name);
    },
    onPointerLeave: (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => setOpen((v) => (v === name ? null : v)), 140);
    },
  });
  const press = (name) => (e) => {
    const mouse = e.nativeEvent.pointerType === "mouse"; // hover already opened it
    setSearching(false);
    setDrawer(false);
    setOpen((v) => (v === name && !mouse ? null : name));
  };

  const at = (path) => loc.pathname === path;
  const navCls = (active) =>
    `u-slide flex items-center gap-1 px-3 py-2 text-[15px] font-bold transition-colors hover:text-navy ${active ? "active text-navy" : "text-ink"}`;
  const firstName = (user?.name || "").trim().split(" ")[0];

  return (
    <>
      {notice && settings.announcement && (
        <div className="flex items-center justify-center gap-3 bg-ink px-4 py-1.5 text-center">
          <p className="truncate text-[12px] font-semibold text-white">{settings.announcement}</p>
          <button
            onClick={() => setNotice(false)}
            aria-label="Dismiss announcement"
            className="shrink-0 text-gray-400 transition-colors hover:text-gold"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden="true" />

      <header
        ref={headerRef}
        className={`sticky top-0 z-40 border-b border-line bg-white transition-shadow duration-300 lg:-top-11 ${
          scrolled ? "shadow-[0_8px_24px_rgba(17,17,17,0.07)]" : ""
        }`}
      >
        <div
          className={`mx-auto flex h-[68px] max-w-7xl items-center gap-2 px-4 transition-[padding] duration-300 lg:h-28 lg:gap-8 ${
            scrolled ? "lg:pt-11" : ""
          }`}
        >
          <Link to="/" aria-label="Aurex Truck Parts, home" className="shrink-0">
            <img
              src="/logo-header.webp"
              alt="Aurex Truck Parts"
              width="371"
              height="288"
              className={`h-14 w-auto transition-[height] duration-300 ${scrolled ? "lg:h-[52px]" : "lg:h-24"}`}
            />
          </Link>

          <nav aria-label="Main" className="hidden items-stretch gap-0.5 self-stretch lg:flex">
            <div className="flex items-center">
              <Link to="/shop" className={navCls(at("/shop"))}>Shop All</Link>
            </div>

            <div className="relative flex items-center" {...hover("categories")}>
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open === "categories"}
                aria-controls="nav-categories"
                onClick={press("categories")}
                className={navCls(loc.pathname.startsWith("/shop/"))}
              >
                Categories
                <ChevronDown size={15} className={`transition-transform duration-200 ${open === "categories" ? "rotate-180" : ""}`} />
              </button>
              {open === "categories" && (
                <div id="nav-categories" className="absolute -left-24 top-full z-50 w-[min(46rem,calc(100vw-2rem))] pt-2">
                  <div className={panel}>
                    <div className="grid grid-cols-3 gap-3 p-4">
                      {categories.map((c) => {
                        const src = c.image?.url || c.imageUrl;
                        return (
                          <Link
                            key={c.slug || c.id}
                            to={`/shop/${c.slug}`}
                            className="card-zoom overflow-hidden rounded-md border border-line bg-mist transition-colors hover:border-gold"
                          >
                            <span className="block aspect-[16/10] overflow-hidden bg-pale">
                              {src && <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />}
                            </span>
                            <span className="block px-3 py-2.5">
                              <span className="block text-[15px] font-extrabold leading-tight">{c.name}</span>
                              <span className="tabular mt-1 block text-[12px] font-semibold text-steel">
                                {c.count ?? c.productCount ?? 0} lines{c.tag ? ` · ${c.tag}` : ""}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-line bg-mist px-4 py-3">
                      <Link to="/shop" className="flex items-center gap-1.5 text-sm font-extrabold transition-colors hover:text-navy">
                        Shop all {totalLines || ""} products <ArrowRight size={15} />
                      </Link>
                      <a href={COMPANY.phoneHref} className="tabular text-[13px] font-bold text-steel transition-colors hover:text-navy">
                        Can't find a part? {COMPANY.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <Link to="/about" className={navCls(at("/about"))}>About</Link>
            </div>
            <div className="flex items-center">
              <Link to="/contact" className={navCls(at("/contact"))}>Contact</Link>
            </div>
          </nav>

          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="ml-auto max-w-md">
              <SearchBox />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 self-stretch lg:gap-1.5">
            <button
              type="button"
              aria-label={searching ? "Close search" : "Search the catalogue"}
              aria-expanded={searching}
              onClick={() => {
                setOpen(null);
                setDrawer(false);
                setSearching((v) => !v);
              }}
              className={`${iconBtn} lg:hidden`}
            >
              {searching ? <X size={21} /> : <Search size={21} />}
            </button>

            <a href={COMPANY.phoneHref} aria-label={`Call ${COMPANY.phone}`} className={`${iconBtn} max-sm:hidden`}>
              <Phone size={20} />
              <Tip>Call {COMPANY.phone}</Tip>
            </a>

            <div className="flex items-center self-stretch sm:relative" {...hover("account")}>
              <button
                type="button"
                aria-label={user ? `Account menu for ${user.name}` : "Account menu"}
                aria-haspopup="true"
                aria-expanded={open === "account"}
                aria-controls="nav-account"
                onClick={press("account")}
                className={iconBtn}
              >
                {user ? (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-sm font-extrabold leading-none text-ink">
                    {(user.name || user.email || "A")[0].toUpperCase()}
                  </span>
                ) : (
                  <User size={21} />
                )}
              </button>
              {open === "account" && (
                <div id="nav-account" className="absolute right-4 top-full z-50 w-64 pt-2 sm:right-0">
                  <div className={`${panel} py-1.5`}>
                    {user ? (
                      <>
                        <p className="border-b border-line px-4 pb-2.5 pt-1.5">
                          <span className="block truncate text-sm font-extrabold">Hi, {firstName || "there"}</span>
                          <span className="block truncate text-[12px] text-steel">{user.email}</span>
                        </p>
                        <Link to="/profile" className={menuItem}><User size={17} className="shrink-0 text-faint" /> My profile</Link>
                        <Link to="/orders" className={menuItem}><ClipboardList size={17} className="shrink-0 text-faint" /> My orders</Link>
                        <Link to="/track" className={menuItem}><PackageSearch size={17} className="shrink-0 text-faint" /> Track an order</Link>
                        <button type="button" onClick={() => { closeAll(); logout(); }} className={`${menuItem} w-full border-t border-line`}>
                          <LogOut size={17} className="shrink-0 text-faint" /> Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className={menuItem}><LogIn size={17} className="shrink-0 text-faint" /> Log in</Link>
                        <Link to="/signup" className={menuItem}><UserPlus size={17} className="shrink-0 text-faint" /> Create an account</Link>
                        <Link to="/track" className={`${menuItem} border-t border-line`}><PackageSearch size={17} className="shrink-0 text-faint" /> Track an order</Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => { closeAll(); setCartOpen(true); }}
              aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart, empty"}
              className="group/tip relative grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ink text-white transition-colors hover:bg-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="tabular absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-extrabold text-ink ring-2 ring-white">
                  {count}
                </span>
              )}
              <Tip>Cart</Tip>
            </button>

            <button
              type="button"
              aria-label={drawer ? "Close menu" : "Open menu"}
              aria-expanded={drawer}
              aria-controls="nav-mobile"
              onClick={() => {
                setOpen(null);
                setSearching(false);
                setDrawer((v) => !v);
              }}
              className={`${iconBtn} lg:hidden`}
            >
              {drawer ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {searching && (
          <div className="border-t border-line px-4 py-2.5 lg:hidden">
            <SearchBox autoFocus onDone={() => setSearching(false)} />
          </div>
        )}

        {drawer && (
          <nav
            id="nav-mobile"
            aria-label="Mobile"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-68px)] overflow-y-auto overscroll-contain border-t border-line bg-white px-4 pb-5 shadow-[0_24px_40px_rgba(17,17,17,0.16)] lg:hidden"
          >
            <Link to="/shop" className="flex items-center justify-between border-b border-line py-3 pt-4 text-[15px] font-bold">
              Shop All <span className="tabular font-mono text-[12px] text-faint">{totalLines || ""}</span>
            </Link>

            <p className="pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-faint">Categories</p>
            {categories.map((c) => (
              <Link key={c.slug || c.id} to={`/shop/${c.slug}`} className="flex items-center justify-between border-b border-line py-3 text-[15px] font-bold pl-3 font-semibold">
                {c.name} <span className="tabular font-mono text-[12px] text-faint">{c.count ?? c.productCount ?? 0}</span>
              </Link>
            ))}

            <Link to="/about" className="flex items-center justify-between border-b border-line py-3 text-[15px] font-bold">About</Link>
            <Link to="/contact" className="flex items-center justify-between border-b border-line py-3 text-[15px] font-bold">Contact</Link>

            <a href={COMPANY.phoneHref} className="tabular mt-5 flex items-center justify-center gap-2 border border-ink py-3.5 text-[15px] font-bold text-ink">
              <Phone size={17} /> Call {COMPANY.phone}
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
