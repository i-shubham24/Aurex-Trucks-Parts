import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Package, ArrowLeft, ShieldCheck, Truck, Boxes, Star, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../store/auth.jsx";
import { useShop } from "../store/shop.jsx";
import { LogoFull } from "../components/logo.jsx";
import { SafeImg } from "../components/ui.jsx";
import { HERO, TESTIMONIALS } from "../data/catalog.js";

const t = TESTIMONIALS[0];

export function PasswordField({ value, onChange, placeholder, inputClass }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <input
        value={value}
        onChange={onChange}
        required
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className={inputClass + " pr-11"}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#6B7280] hover:text-[#1A1A2E] hover:bg-black/5 transition"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </span>
  );
}

function AuthShell({ title, sub, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-white">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[#1A1A2E] text-white">
        <SafeImg src={HERO.primary} alt="" label="AUREX" className="absolute inset-0 w-full h-full object-cover opacity-25" wrapClass="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 grid-scrim opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/70 to-[#1A1A2E]/40" />
        <div className="absolute -right-24 top-1/3 w-96 h-96 rounded-full bg-[#E53E00]/20 blur-[120px]" />

        <Link to="/" className="relative w-fit">
          <LogoFull mono size={58} />
        </Link>

        <div className="relative">
          <h2 className="font-display font-bold text-[40px] leading-[1.05] tracking-[-0.02em] max-w-md">
            The parts desk that <span className="text-gradient">moves as fast</span> as your fleet.
          </h2>
          <div className="mt-8 space-y-4 max-w-sm">
            {[
              [Boxes, "60,000+ product lines ready to ship"],
              [Truck, "Dispatch in 1 to 2 business days Australia wide"],
              [ShieldCheck, "ADR compliant range with OEM cross references"],
            ].map(([Icon, txt]) => (
              <div key={txt} className="flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-[#FF6B35] shrink-0">
                  <Icon size={18} />
                </span>
                <span className="text-white/80 text-[14px] font-medium">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-5 max-w-md">
          <div className="flex gap-0.5">
            {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} className="fill-[#FFBB00] text-[#FFBB00]" />)}
          </div>
          <p className="text-white/85 text-[14px] mt-2.5 leading-relaxed">{t.quote}</p>
          <p className="text-white/50 text-[12px] mt-3 font-semibold">{t.name}, {t.role}</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-[#F1F2F4]">
          <Link to="/" className="lg:hidden">
            <LogoFull />
          </Link>
          <span className="hidden lg:block" />
          <Link to="/" className="flex items-center gap-2 text-[13px] font-semibold text-[#6B7280] hover:text-[#E53E00] transition">
            <ArrowLeft size={15} /> Back to store
          </Link>
        </div>

        <div className="flex-1 grid place-items-center px-6 sm:px-10 py-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <h1 className="font-display font-bold text-[32px] sm:text-[38px] tracking-[-0.02em] text-[#1A1A2E]">{title}</h1>
            <p className="text-[#6B7280] text-[15px] mt-2">{sub}</p>
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6">{footer}</div>}
          </motion.div>
        </div>

        <p className="px-6 sm:px-10 py-5 text-[12px] text-[#9CA3AF] border-t border-[#F1F2F4]">
          &copy; 2026 Aurex Truck Parts Australia. Demo auth only, data stays in this browser.
        </p>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-xl px-4 py-3.5 bg-[#F7F8FA] border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] focus:bg-white transition";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  return (
    <AuthShell
      title="Welcome back"
      sub="Log in to check out faster and track your orders."
      footer={<p className="text-sm text-[#6B7280]">New to Aurex? <Link to="/signup" className="text-[#E53E00] font-bold hover:underline">Create an account</Link></p>}
    >
      <form onSubmit={(e) => { e.preventDefault(); const r = login({ email, password }); if (!r.ok) setErr(r.msg); else nav("/account"); }} className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-[12px] font-bold text-[#6B7280]">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="you@company.com.au" className={inputClass} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[12px] font-bold text-[#6B7280]">Password</span>
          <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" inputClass={inputClass} />
        </label>
        {err && <p className="text-[13px] text-red-500 font-semibold">{err}</p>}
        <button className="mt-2 bg-[#E53E00] text-white rounded-xl py-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1A1A2E] active:scale-[0.99] transition shadow-primary">
          <LogIn size={16} /> Log in
        </button>
      </form>
    </AuthShell>
  );
}

export function SignupPage() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "", company: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <AuthShell
      title="Create your account"
      sub="Trade and fleet welcome. One login for quotes, checkout and tracking."
      footer={<p className="text-sm text-[#6B7280]">Already have an account? <Link to="/login" className="text-[#E53E00] font-bold hover:underline">Log in</Link></p>}
    >
      <form onSubmit={(e) => { e.preventDefault(); if (f.password.length < 6) { setErr("Password needs at least 6 characters."); return; } const r = signup(f); if (!r.ok) setErr(r.msg); else nav("/account"); }} className="grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={f.name} onChange={set("name")} required placeholder="Full name" className={inputClass} />
          <input value={f.phone} onChange={set("phone")} placeholder="Phone" className={inputClass} />
        </div>
        <input value={f.email} onChange={set("email")} required type="email" placeholder="Work email" className={inputClass} />
        <input value={f.company} onChange={set("company")} placeholder="Company or fleet, optional" className={inputClass} />
        <PasswordField value={f.password} onChange={set("password")} placeholder="Create password, min 6 characters" inputClass={inputClass} />
        {err && <p className="text-[13px] text-red-500 font-semibold">{err}</p>}
        <button className="mt-2 bg-[#1A1A2E] text-white rounded-xl py-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#E53E00] active:scale-[0.99] transition">
          <UserPlus size={16} /> Create account
        </button>
      </form>
    </AuthShell>
  );
}

export function AccountPage() {
  const { user, logout, myOrders } = useAuth();
  const { setCart, setDrawer } = useShop();
  const nav = useNavigate();
  const reorder = (o) => {
    setCart((c) => {
      const next = [...c];
      (o.items || []).forEach((i) => {
        const f = next.find((x) => x.sku === i.sku);
        if (f) f.qty += i.qty;
        else next.push({ ...i });
      });
      return next;
    });
    setDrawer(true);
  };
  if (!user) return (
    <div className="mx-auto max-w-xl px-4 py-14 text-center">
      <Package size={36} className="mx-auto text-[#E53E00]" />
      <h1 className="font-display font-bold text-3xl mt-4 text-[#1A1A2E]">Please log in</h1>
      <p className="text-[#6B7280] text-sm mt-2">Your account holds your details plus order history.</p>
      <button onClick={() => nav("/login")} className="mt-5 bg-[#E53E00] text-white rounded-lg px-7 py-3.5 text-sm font-bold hover:bg-[#1A1A2E] transition">Go to login</button>
    </div>
  );
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 grid lg:grid-cols-[300px_1fr] gap-6 items-start">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm lg:sticky lg:top-28">
        <span className="grid place-items-center w-14 h-14 rounded-full bg-[#1A1A2E] text-white font-display font-black text-xl">{user.name.charAt(0)}</span>
        <p className="font-display font-bold text-2xl text-[#1A1A2E] mt-3">{user.name}</p>
        <p className="text-[#6B7280] text-sm mt-1">{user.email}</p>
        <p className="text-[#9CA3AF] text-[13px] mt-1">{user.company || "Independent buyer"} {user.phone ? ", " + user.phone : ""}</p>
        <button onClick={() => { logout(); nav("/"); }} className="mt-5 w-full rounded-xl border border-[#E5E7EB] py-3 text-sm font-bold text-[#6B7280] hover:border-red-400 hover:text-red-500 transition">Log out</button>
        <Link to="/shop" className="mt-2 block text-center rounded-xl bg-[#E53E00] text-white py-3 text-sm font-bold hover:bg-[#1A1A2E] transition">Continue shopping</Link>
      </div>
      <div>
        <h1 className="font-display font-bold text-3xl text-[#1A1A2E]">Order history ({myOrders.length})</h1>
        <div className="mt-4 space-y-3">
          {myOrders.length === 0 && <p className="rounded-2xl border border-dashed border-[#E5E7EB] p-8 text-center text-[#9CA3AF] text-sm">No orders yet. Checkout creates an order you can track.</p>}
          {myOrders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap gap-2 items-center">
                <p className="font-bold text-[#1A1A2E]">{o.id}</p>
                <span className="text-[11px] font-bold bg-[#10B981] text-white rounded-lg px-3 py-1">{o.status}</span>
                <span className="ml-auto font-display font-bold text-lg text-[#1A1A2E]">${o.total.toFixed(2)}</span>
              </div>
              <p className="text-[12px] text-[#9CA3AF] mt-1.5">
                {new Date(o.placedAt).toLocaleString()} | {o.items.length} lines | {o.shipping} | {o.payment}
              </p>
              <Link to={`/order-success/${o.id}`} className="mt-3 inline-block text-[13px] font-bold text-[#E53E00]">View receipt</Link>
              <button onClick={() => reorder(o)} className="mt-3 ml-4 inline-block text-[13px] font-bold text-[#1A1A2E] underline">Reorder these lines</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
