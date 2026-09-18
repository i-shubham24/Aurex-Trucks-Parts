import { useEffect, useState, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Boxes, LayoutGrid, Users, FileText, Tag, PenLine, Settings, LogOut, Menu, X, Eye, EyeOff, Search, Bell, ChevronDown, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "../../store/auth.jsx";
import logoBlue from "../../assets/aurex-logo-blue.png";

const MENU_GROUPS = [
  {
    title: "Overview",
    items: [
      ["Dashboard", "/admin", LayoutDashboard],
    ]
  },
  {
    title: "Sales",
    items: [
      ["Orders", "/admin/orders", ShoppingCart],
      ["Quotes", "/admin/quotes", FileText],
      ["Customers", "/admin/customers", Users],
    ]
  },
  {
    title: "Catalog",
    items: [
      ["Products", "/admin/products", Boxes],
      ["Categories", "/admin/categories", LayoutGrid],
      ["Deals", "/admin/deals", Tag],
    ]
  },
  {
    title: "System",
    items: [
      ["Content", "/admin/content", PenLine],
      ["Settings", "/admin/settings", Settings],
    ]
  }
];

const ADMIN_EMAIL = "admin@aurex.com.au";
const ADMIN_PASS = "Admin123!";

function ensureAdmin() {
  try {
    const raw = localStorage.getItem("aurex_users");
    const users = raw ? JSON.parse(raw) : [];
    const i = users.findIndex((u) => u.email === ADMIN_EMAIL);
    if (i === -1) {
      users.push({ name: "Store Admin", email: ADMIN_EMAIL, password: ADMIN_PASS, phone: "03 9000 0000", company: "Aurex HQ", createdAt: new Date().toISOString(), role: "admin" });
    } else {
      // Normalise legacy seeds so the documented credential always works.
      users[i] = { ...users[i], password: ADMIN_PASS, role: "admin" };
    }
    localStorage.setItem("aurex_users", JSON.stringify(users));
  } catch { /* noop */ }
}

export default function AdminLayout() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const nav = useNavigate();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => { ensureAdmin(); }, []);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = user && (user.email === ADMIN_EMAIL || user.role === "admin");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const r = login({ email, password });
    if (!r.ok) setErr(r.msg);
    else setErr("");
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#060B13] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 grid-scrim opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#134E8D]/10 to-transparent" />
        <div className="absolute -left-1/4 -top-1/4 w-[150%] h-[150%] blur-3xl opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5B93D1]/20 via-[#060B13]/0 to-transparent pointer-events-none" />
        
        <div className="w-full max-w-[420px] relative z-10">
          <div className="flex justify-center mb-8">
            <span className="bg-white px-3 py-2 inline-block"><img src={logoBlue} alt="Aurex" className="h-8 object-contain" /></span>
          </div>
          
          <form onSubmit={handleLogin} className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5B93D1] to-[#9AC1EE]" />
            
            <p className="text-[11px] font-black tracking-[0.2em] text-[#5B93D1] uppercase mb-2">Secure Gateway</p>
            <h1 className="font-display font-bold text-3xl text-white">Staff Login</h1>
            <p className="text-white/40 text-[13px] mt-2 mb-8 leading-relaxed">Access the Aurex Truck Parts administrative portal to manage orders and catalogue.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@aurex.com.au" className="w-full rounded-xl px-4 py-3.5 bg-black/40 border border-white/10 outline-none text-sm text-white focus:border-[#5B93D1]/50 transition" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <span className="relative block">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" className="w-full rounded-xl px-4 py-3.5 pr-11 bg-black/40 border border-white/10 outline-none text-sm text-white focus:border-[#5B93D1]/50 transition" />
                  <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </div>
            </div>

            {err && <p className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-400 font-semibold">{err}</p>}
            
            <button disabled={loading} className="mt-8 w-full bg-[#5B93D1] rounded-xl py-3.5 text-[14px] font-bold text-white hover:bg-[#9AC1EE] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : "Sign into portal"}
            </button>
            
            <Link to="/" className="mt-6 block text-center text-[12px] font-bold text-white/30 hover:text-white transition">← Back to storefront</Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B13] text-white flex">
      <aside className={`fixed lg:static z-50 h-screen w-[260px] shrink-0 bg-[#0C1622] border-r border-white/10 flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="bg-white px-2 py-1 inline-block"><img src={logoBlue} alt="Aurex" className="h-5 object-contain" /></span>
            <span className="text-[10px] font-black tracking-widest text-[#5B93D1] uppercase mt-1 border-l border-white/20 pl-3">Admin</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2 text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 grid gap-6 text-[14px] font-semibold">
          {MENU_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-black tracking-widest text-white/30 uppercase mb-2 px-3">{group.title}</p>
              <div className="grid gap-1">
                {group.items.map(([t, h, Icon]) => (
                  <NavLink key={t} to={h} end={h === "/admin"} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${isActive ? "bg-[#5B93D1]/10 text-[#5B93D1]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                    <Icon size={17} />{t}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-screen relative">
        <header className="shrink-0 z-40 bg-[#0C1622] border-b border-white/10 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white"><Menu size={20} /></button>
          
          <div className="flex-1 flex items-center gap-4">
            <div className="relative hidden md:block max-w-sm w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="text" readOnly onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'metaKey': true}))} placeholder="Search orders, products, or customers... (Cmd+K)" className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none cursor-text hover:bg-white/10 transition placeholder:text-white/30" />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <a href="/" target="_blank" rel="noreferrer" className="hidden sm:block text-[13px] font-bold text-white/60 hover:text-white transition">View Storefront</a>
            
            <div ref={notifRef} className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className={`relative p-2 rounded-lg transition ${showNotif ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}>
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#5B93D1] rounded-full ring-2 ring-[#0C1622]" />
              </button>
              
              {showNotif && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#12202F] border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                    <p className="font-bold text-sm">Notifications</p>
                    <button className="text-[11px] text-[#5B93D1] font-bold">Mark all read</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0"><FileText size={14} /></div>
                      <div>
                        <p className="text-[13px] text-white/90">New trade quote request from <b>Westside Freight</b>.</p>
                        <p className="text-[11px] text-white/40 mt-0.5">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0"><AlertTriangle size={14} /></div>
                      <div>
                        <p className="text-[13px] text-white/90">Stock alert: <b>Steel Hinges GL-13112</b> running low.</p>
                        <p className="text-[11px] text-white/40 mt-0.5">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-px bg-white/10 mx-1" />
            
            <div ref={profileRef} className="relative">
              <div onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-xl hover:bg-white/5 transition">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5B93D1] to-[#9AC1EE] flex items-center justify-center font-bold shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[13px] font-bold leading-tight group-hover:text-[#5B93D1] transition">{user.name}</p>
                  <p className="text-[11px] text-white/50">{user.role}</p>
                </div>
                <ChevronDown size={14} className={`text-white/40 group-hover:text-white transition ${showProfile ? 'rotate-180' : ''}`} />
              </div>
              
              {showProfile && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#12202F] border border-white/10 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-[12px] text-white/50 truncate">{user.email}</p>
                  </div>
                  <Link to="/admin/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition">
                    <Settings size={16} /> Preferences
                  </Link>
                  <button onClick={() => { logout(); nav("/"); }} className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition mt-1">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-7 bg-[#060B13]">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!open) return null;

  const results = q.length > 1 ? [
    { type: 'Page', title: 'Product Settings', url: '/admin/settings', icon: Settings },
    { type: 'Product', title: 'Steel Hinges (GL-13112)', url: '/admin/products', icon: Boxes },
    { type: 'Customer', title: 'Westside Freight (westside@gmail.com)', url: '/admin/customers', icon: Users },
    { type: 'Order', title: '#AUX-9021', url: '/admin/orders', icon: ShoppingCart },
  ].filter(r => r.title.toLowerCase().includes(q.toLowerCase()) || r.type.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-2xl bg-[#12202F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-white/10">
          <Search size={20} className="text-white/40 mr-3 shrink-0" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or search..." className="flex-1 bg-transparent outline-none text-white text-lg placeholder:text-white/30" />
          <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded ml-3 shrink-0">ESC</span>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.length > 1 ? (
            results.length > 0 ? (
              <div className="space-y-1">
                {results.map((r, i) => (
                  <button key={i} onClick={() => { nav(r.url); setOpen(false); setQ(""); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#5B93D1]/10 hover:text-[#5B93D1] transition text-left group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#5B93D1]/20"><r.icon size={16} /></div>
                    <div className="flex-1 truncate">
                      <p className="font-bold text-[14px] text-white">{r.title}</p>
                      <p className="text-[11px] text-white/40 uppercase tracking-wider font-black">{r.type}</p>
                    </div>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-[#5B93D1]" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-white/40 text-sm">No results found for "{q}"</div>
            )
          ) : (
            <div className="px-3 py-6">
              <p className="text-[11px] font-black tracking-widest text-white/30 uppercase mb-3 px-1">Quick Links</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Create New Promo", "/admin/deals", Tag],
                  ["View All Orders", "/admin/orders", ShoppingCart],
                  ["Store Settings", "/admin/settings", Settings],
                  ["Manage Customers", "/admin/customers", Users],
                ].map(([t, h, Icon]) => (
                  <button key={t} onClick={() => { nav(h); setOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition text-left">
                    <Icon size={16} className="text-white/40" />
                    <span className="text-[13px] font-bold text-white/70">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
