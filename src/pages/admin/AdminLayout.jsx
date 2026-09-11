import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Boxes, LayoutGrid, Users, FileText, Tag, PenLine, Settings, LogOut, Menu, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../store/auth.jsx";

const ITEMS = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Orders", "/admin/orders", ShoppingCart],
  ["Products", "/admin/products", Boxes],
  ["Categories", "/admin/categories", LayoutGrid],
  ["Customers", "/admin/customers", Users],
  ["Quotes", "/admin/quotes", FileText],
  ["Deals", "/admin/deals", Tag],
  ["Content", "/admin/content", PenLine],
  ["Settings", "/admin/settings", Settings],
];

const ADMIN_EMAIL = "admin@aurex.com.au";
const ADMIN_PASS = "Admin123!";

function ensureAdmin() {
  try {
    const raw = localStorage.getItem("aurex_users");
    const users = raw ? JSON.parse(raw) : [];
    if (!users.some((u) => u.email === ADMIN_EMAIL)) {
      users.push({ name: "Store Admin", email: ADMIN_EMAIL, password: ADMIN_PASS, phone: "03 9000 0000", company: "Aurex HQ", createdAt: new Date().toISOString(), role: "admin" });
      localStorage.setItem("aurex_users", JSON.stringify(users));
    }
  } catch { /* noop */ }
}

export default function AdminLayout() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => { ensureAdmin(); }, []);
  const isAdmin = user && (user.email === ADMIN_EMAIL || user.role === "admin");

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#06080b] text-white grid place-items-center px-4">
        <form onSubmit={(e) => { e.preventDefault(); const r = login({ email, password }); if (!r.ok) setErr(r.msg + " Hint: admin@aurex.com.au / Admin123!"); else setErr(""); }} className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0d1218] p-8">
          <p className="text-[11px] font-black tracking-widest text-[#d9ff3d]">AUREX ADMIN PORTAL</p>
          <h1 className="font-display font-bold text-3xl mt-2">Staff sign in</h1>
          <p className="text-white/50 text-sm mt-1.5">Seeded demo login is prefilled. Manage orders, products, customers, deals and content.</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="mt-5 w-full rounded-2xl px-4 py-3.5 bg-black/40 border border-white/10 outline-none text-sm" />
          <span className="relative block mt-2.5">
            <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="Password (demo: Admin123!)" className="w-full rounded-2xl px-4 py-3.5 pr-11 bg-black/40 border border-white/10 outline-none text-sm" />
            <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/45 hover:text-white hover:bg-white/10 transition">
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          {err && <p className="mt-2.5 text-[13px] text-red-400 font-semibold">{err}</p>}
          <button className="mt-4 w-full bg-[#ff4d00] rounded-2xl py-4 text-sm font-black hover:bg-white hover:text-black transition">Enter admin portal</button>
          <Link to="/" className="mt-3 block text-center text-[13px] text-white/45 hover:text-white">Back to storefront</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080b] text-white flex">
      <aside className={`fixed lg:static z-50 h-screen w-[260px] shrink-0 bg-[#0d1218] border-r border-white/10 p-5 flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#ff4d00] font-black text-xl">A</span>
          <span><b className="block font-display">AUREX ADMIN</b><span className="text-[11px] text-white/40 font-bold">TRUCK PARTS AU</span></span>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden p-2 border border-white/10 rounded-lg"><X size={16} /></button>
        </div>
        <nav className="mt-6 grid gap-1 text-[14px] font-semibold">
          {ITEMS.map(([t, h, Icon]) => <NavLink key={t} to={h} end={h === "/admin"} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition ${isActive ? "bg-[#ff4d00] text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}><Icon size={17} />{t}</NavLink>)}
        </nav>
        <div className="mt-auto rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-[12px]">
          <p className="font-bold">{user.name}</p>
          <p className="text-white/45">{user.email}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/" className="text-center rounded-xl border border-white/15 py-2 font-bold">Storefront</Link>
            <button onClick={() => { logout(); nav("/"); }} className="rounded-xl border border-white/15 py-2 font-bold flex items-center justify-center gap-1.5 hover:border-red-400"><LogOut size={13} /> Out</button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-[#06080b]/90 backdrop-blur border-b border-white/10 px-4 sm:px-7 py-3.5 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 border border-white/10 rounded-lg"><Menu size={17} /></button>
          <p className="text-[13px] text-white/45">Admin <span className="mx-1">/</span> <span className="text-white font-bold">Portal</span></p>
          <Link to="/" className="ml-auto text-[13px] font-bold bg-white text-black rounded-full px-5 py-2.5 hover:bg-[#d9ff3d] transition">View store</Link>
        </header>
        <main className="p-4 sm:p-7 max-w-[1200px]"><Outlet /></main>
      </div>
    </div>
  );
}
