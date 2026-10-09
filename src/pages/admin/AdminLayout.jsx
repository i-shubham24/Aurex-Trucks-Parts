import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Menu, Package, ShoppingCart, Tags, Users, MailQuestion, Megaphone, Settings, X, LogOut } from "lucide-react";
import { useAuth, ADMIN_EMAIL } from "../../store/auth";

const GROUPS = [
  { label: "Overview", links: [{ to: "/admin", end: true, label: "Dashboard", Icon: LayoutDashboard }] },
  {
    label: "Sales",
    links: [
      { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
      { to: "/admin/enquiries", label: "Enquiries", Icon: MailQuestion },
      { to: "/admin/customers", label: "Customers", Icon: Users },
    ],
  },
  {
    label: "Catalog",
    links: [
      { to: "/admin/products", label: "Products", Icon: Package },
      { to: "/admin/categories", label: "Categories", Icon: Tags },
      { to: "/admin/marketing", label: "Marketing", Icon: Megaphone },
    ],
  },
  { label: "System", links: [{ to: "/admin/settings", label: "Settings", Icon: Settings }] },
];

export function AdminTitle({ kicker, title, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">{kicker}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">{title}</h1>
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div className="border-2 border-ink bg-white p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-faint">{label}</p>
      <p className="tabular mt-1 text-2xl font-extrabold md:text-3xl">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-steel">{sub}</p>}
    </div>
  );
}

export const th = "border-b-2 border-ink bg-mist px-3 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-steel";
export const td = "border-b border-line px-3 py-2.5 text-[13px] align-top";

export function Modal({ close, children, wide }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-auto p-4">
      <div className="absolute inset-0 bg-black/55" onClick={close} />
      <div className={`popup-in relative my-8 w-full ${wide ? "max-w-3xl" : "max-w-xl"} border-2 border-ink bg-white shadow-2xl`}>
        <button onClick={close} aria-label="Close" className="absolute right-3 top-3 text-faint hover:text-ink"><X size={20} /></button>
        <div className="p-5 md:p-6">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ text }) {
  return <p className="border border-dashed border-line-dark bg-mist p-8 text-center text-sm text-steel">{text}</p>;
}

function StaffLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const input = "h-12 w-full rounded-lg border border-white/15 bg-white/5 px-4 text-[15px] text-white outline-none placeholder:text-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/30";
  const go = async (e) => {
    e.preventDefault();
    setErr("");
    const r = await login({ email, password });
    if (!r?.ok) setErr(r?.msg || "Login failed. Check your email and password.");
  };
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0e14] px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#12161f] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 bg-ink px-6 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold font-mono text-[12px] font-extrabold text-ink">AX</span>
          <div>
            <p className="text-[15px] font-extrabold leading-none text-white">Aurex Staff Console</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Separate system · Restricted</p>
          </div>
          <span className="ml-auto rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-red-300 ring-1 ring-red-500/30">Staff only</span>
        </div>
        <div className="p-6 sm:p-7">
          <h1 className="text-[22px] font-extrabold tracking-tight text-white">Staff login</h1>
          <p className="mt-1 text-[13px] text-gray-400">This console is isolated from the public storefront. Customer logins do not work here.</p>
          <form onSubmit={go} className="mt-5 grid gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-400">Staff email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@aurex.com.au" className={input} autoComplete="username" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-400">Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className={input} autoComplete="current-password" />
            </label>
            {err && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] font-semibold text-red-300">{err}</p>}
            <button className="rounded-lg bg-gold py-3 text-sm font-extrabold text-ink transition hover:bg-white">Unlock console →</button>
          </form>
          <p className="mt-4 text-center text-[12px] text-gray-500">Separate staff URL. It is never linked from the public shop header, footer or account screens.</p>
        </div>
      </div>
    </main>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const go = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user || !user.isAdmin) return <StaffLogin />;
  const nav = (
    <nav>
      {GROUPS.map((g) => (
        <div key={g.label} className="mt-5 first:mt-0">
          <p className="px-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">{g.label}</p>
          <div className="mt-1.5 grid gap-0.5">
            {g.links.map(({ to, end, label, Icon }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-colors ${isActive ? "bg-gold text-ink" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
  return (
    <div className="min-h-screen bg-mist lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden bg-ink text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 p-4">
          <Link to="/admin" className="inline-block rounded bg-white px-2 py-1"><img src="/logo.jpeg" alt="Aurex staff console" className="h-8 w-auto" /></Link>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Staff Console · Separate</p>
        </div>
        <div className="flex-1 overflow-auto p-2">{nav}</div>
        <div className="border-t border-white/10 p-4 text-sm">
          <p className="truncate font-bold text-white">{user.name}</p>
          <p className="truncate font-mono text-[11px] text-gray-400">{user.email}</p>
          <button
            onClick={() => { logout(); go("/admin"); }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-red-600/90 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-red-600 shadow-sm"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex flex-col">
        {/* Top header bar for desktop & mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 shadow-xs md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(!open)} aria-label="Menu" className="grid h-9 w-9 place-items-center rounded border border-line-dark lg:hidden">{open ? <X size={18} /> : <Menu size={18} />}</button>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-extrabold text-ink">Staff Console <span className="hidden sm:inline font-mono text-xs font-normal text-faint">· Internal Management</span></p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" target="_blank" className="hidden text-xs font-bold text-steel hover:text-navy underline sm:inline-flex">Storefront ↗</Link>
            <div className="hidden h-4 w-px bg-line sm:block" />
            <div className="text-right">
              <p className="text-xs font-extrabold text-ink">{user.name}</p>
              <p className="hidden font-mono text-[10px] text-faint md:block">{user.email}</p>
            </div>
            <button
              onClick={() => { logout(); go("/admin"); }}
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition-colors hover:bg-red-700 active:scale-95"
              title="Log out of Staff Console"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </header>
        {open && <div className="border-b border-line bg-ink p-2 text-white lg:hidden">{nav}</div>}
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6"><Outlet /></div>
      </div>
    </div>
  );
}

