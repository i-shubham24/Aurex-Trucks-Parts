import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, Truck, User, Building2 } from "lucide-react";
import { useAuth } from "../store/auth";

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRx = /^0[45]\d{8}$|^0[2378]\d{8}$/;

function strength(pass) {
  let s = 0;
  if (pass.length >= 6) s++;
  if (pass.length >= 10) s++;
  if (/\d/.test(pass)) s++;
  if (/[A-Z]/.test(pass)) s++;
  if (/[^A-Za-z0-9]/.test(pass)) s++;
  return Math.min(s, 4);
}

function Field({ label, children, hint, error }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.12em] text-steel">
        {label}
        {hint && <span className="font-semibold normal-case tracking-normal text-faint">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-0.5 block text-[12px] font-semibold text-red-600">{error}</span>}
    </label>
  );
}

const inputCls = (bad) =>
  `flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-faint ${
    bad ? "border-red-400 ring-2 ring-red-100" : "border-line-dark focus:border-navy focus:ring-2 focus:ring-gold/40"
  }`;

export function AuthCard({ mode: initial = "login" }) {
  const { login, signup } = useAuth();
  const go = useNavigate();
  const [tab, setTab] = useState(initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [site, setSite] = useState("");
  const [err, setErr] = useState("");
  const [fieldErr, setFieldErr] = useState({});
  const [done, setDone] = useState(false);

  const pw = strength(pass);

  /* Fresh form on every switch — never carry values between login and signup. */
  const switchTab = (t) => {
    setTab(t);
    setName(""); setEmail(""); setPhone(""); setCompany(""); setPass("");
    setErr(""); setFieldErr({}); setShow(false);
  };

  const emailField = (
    <Field label="Email address" error={fieldErr.email}>
      <span className={inputCls(fieldErr.email)}>
        <Mail size={16} className="shrink-0 text-faint" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} placeholder="you@fleet.com.au" className="w-full bg-transparent outline-none" autoComplete="email" />
      </span>
    </Field>
  );

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    const fe = {};
    if (site) return;
    if (!emailRx.test(email.trim())) fe.email = "Enter a valid email address.";
    if (tab === "signup") {
      if (!name.trim()) fe.name = "Enter your full name.";
      if (!phone.trim()) fe.phone = "Mobile number is required.";
      else if (!phoneRx.test(phone.replace(/\s/g, ""))) fe.phone = "Enter a 10-digit AU mobile, e.g. 04XX XXX XXX.";
      if (pass.length < 6 || !/\d/.test(pass) || !/[A-Z]/.test(pass))
        fe.pass = "Min 6 chars, with 1 number + 1 uppercase.";
    } else if (!pass) {
      fe.pass = "Enter your password.";
    }
    setFieldErr(fe);
    if (Object.keys(fe).length) return;
    let r;
    if (tab === "signup") {
      r = signup({ name, email, password: pass, phone: phone.trim(), company: company.trim() });
    } else {
      r = login({ email, password: pass, remember });
    }
    if (!r.ok) {
      setErr(r.msg);
      return;
    }
    setDone(true);
    setTimeout(() => go(tab === "signup" ? "/profile" : "/orders"), 900);
  };

  if (done) {
    return (
      <div className="px-6 py-10 text-center sm:px-10">
        <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold text-2xl font-extrabold text-ink">
          <BadgeCheck size={26} />
        </p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{tab === "signup" ? "Account created" : "Welcome back"}</h2>
        <p className="mx-auto mt-1 max-w-xs text-[13px] text-steel">
          {tab === "signup" ? "Trade pricing is now unlocked on this device." : "You are logged in. Taking you to your orders…"}
        </p>
        <div className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-mist">
          <div className="h-full w-full origin-left animate-[loadbar_0.9s_ease_forwards] bg-navy" />
        </div>
        <style>{`@keyframes loadbar{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2.5 lg:hidden">
        <img src="/logo.png" alt="Aurex Truck Parts" className="h-9 w-auto" />
        <span className="h-7 w-px bg-line" aria-hidden="true" />
        <p className="text-[10px] font-bold uppercase leading-[1.5] tracking-[0.2em] text-navy">Trade<br />accounts</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-mist p-1">
          <button type="button" onClick={() => switchTab("login")} className={`rounded-full px-4 py-1 text-[13px] font-extrabold transition ${tab === "login" ? "bg-ink text-white shadow" : "text-steel hover:text-ink"}`}>Login</button>
          <button type="button" onClick={() => switchTab("signup")} className={`rounded-full px-4 py-1 text-[13px] font-extrabold transition ${tab === "signup" ? "bg-ink text-white shadow" : "text-steel hover:text-ink"}`}>Sign up</button>
        </div>
        <span className="hidden items-center gap-1.5 text-[11px] font-bold text-faint sm:flex"><ShieldCheck size={13} className="text-green-700" /> Secure 256-bit</span>
      </div>

      <h2 className="mt-2.5 text-xl font-extrabold leading-tight tracking-tight">
        {tab === "login" ? "Welcome back, driver." : "Create your trade account."}
      </h2>
      <p className="mt-0.5 text-[13px] text-steel">
        {tab === "login" ? "Log in for faster checkout, order tracking and trade pricing." : "Counter pricing, 30-day fleet terms and saved vehicles. Free to join."}
      </p>

      <form onSubmit={submit} className="mt-3 grid gap-2.5">
        <span className="hidden" aria-hidden="true"><input type="text" value={site} onChange={(e) => setSite(e.target.value)} tabIndex={-1} autoComplete="off" /></span>
        {tab === "signup" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" error={fieldErr.name}>
                <span className={inputCls(fieldErr.name)}>
                  <User size={16} className="shrink-0 text-faint" />
                  <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. Jack Carter" className="w-full bg-transparent outline-none" />
                </span>
              </Field>
              {emailField}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone *" error={fieldErr.phone}>
                <span className={inputCls(fieldErr.phone)}>
                  <Phone size={16} className="shrink-0 text-faint" />
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="04XX XXX XXX" maxLength={20} className="w-full bg-transparent outline-none" inputMode="tel" autoComplete="tel" />
                </span>
              </Field>
              <Field label="Company / fleet" hint="optional">
                <span className={inputCls(false)}>
                  <Building2 size={16} className="shrink-0 text-faint" />
                  <input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={80} placeholder="Carter Haulage" className="w-full bg-transparent outline-none" />
                </span>
              </Field>
            </div>
          </>
        ) : (
          emailField
        )}
        <Field label={tab === "signup" ? "Create password" : "Password"} hint={tab === "signup" ? "6+ chars · 1 number · 1 uppercase" : ""} error={fieldErr.pass}>
          <span className={inputCls(fieldErr.pass)}>
            <Lock size={16} className="shrink-0 text-faint" />
            <input required value={pass} onChange={(e) => setPass(e.target.value)} type={show ? "text" : "password"} maxLength={72} placeholder={tab === "signup" ? "Choose a strong password" : "Your password"} className="w-full bg-transparent outline-none" autoComplete={tab === "signup" ? "new-password" : "current-password"} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="shrink-0 rounded p-1 text-faint hover:bg-mist hover:text-ink">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </Field>

        {tab === "signup" && pass.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${i < pw ? (pw <= 1 ? "bg-red-500" : pw === 2 ? "bg-gold" : "bg-green-600") : "bg-line"}`} />
              ))}
            </div>
            <span className="text-[11px] font-bold text-steel">{pw <= 1 ? "Weak" : pw === 2 ? "Okay" : pw === 3 ? "Strong" : "Excellent"}</span>
          </div>
        )}

        {tab === "login" && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex cursor-pointer items-center gap-2 font-semibold text-steel">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#002049]" /> Remember me
            </label>
            <span className="font-semibold text-faint">Forgot password?</span>
          </div>
        )}

        {err && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">{err}</p>
        )}

        <button className="group flex h-10 items-center justify-center gap-2 rounded-lg bg-gold text-sm font-extrabold text-ink transition hover:bg-ink hover:text-white">
          {tab === "signup" ? "Create trade account" : "Log in"}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>

        <p className="text-center text-xs text-steel">
          {tab === "login" ? (
            <>New to Aurex? <button type="button" onClick={() => switchTab("signup")} className="font-extrabold text-navy underline">Create an account</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => switchTab("login")} className="font-extrabold text-navy underline">Log in</button></>
          )}
        </p>
      </form>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-6 text-white lg:flex">
      <img src="/images/web/hero-roadtrain.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="relative flex items-center gap-3">
        <img src="/logo.png" alt="Aurex Truck Parts" className="h-14 w-auto shrink-0 brightness-0 invert" />
        <span className="h-10 w-px shrink-0 bg-white/15" aria-hidden="true" />
        <p className="text-[11px] font-bold uppercase leading-[1.5] tracking-[0.2em] text-gold">Trade<br />accounts</p>
      </div>
      <div className="relative">
        <p className="max-w-xs text-[26px] font-extrabold leading-[1.1] tracking-tight">Counter pricing, unlocked for your fleet.</p>
        <ul className="mt-4 space-y-2 text-[13px] font-semibold text-gray-200">
          <li className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-gold/20 text-gold"><BadgeCheck size={12} /></span> ABN trade tiers at checkout</li>
          <li className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-gold/20 text-gold"><Truck size={12} /></span> 30-day terms + priority freight</li>
          <li className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-gold/20 text-gold"><ShieldCheck size={12} /></span> Saved vehicles + VIN fitment checks</li>
        </ul>
      </div>
    </div>
  );
}

export default function Auth({ mode = "login" }) {
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-mist px-4 py-3">
      <div className="w-full max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-steel hover:text-navy"><ArrowLeft size={15} /> Back to store</Link>
        <div className="mt-2 grid max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-2xl border border-line bg-white shadow-[0_24px_60px_rgba(0,32,73,0.12)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <BrandPanel />
          <AuthCard key={mode} mode={mode} />
        </div>
      </div>
    </main>
  );
}
