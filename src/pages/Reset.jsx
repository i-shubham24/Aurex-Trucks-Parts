import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Lock, Mail, ShieldCheck } from "lucide-react";
import { api, API_ON } from "../lib/api";
import { useNotification } from "../store/notification";

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls = (bad) =>
  `flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-faint ${
    bad ? "border-red-400 ring-2 ring-red-100" : "border-line-dark focus:border-navy focus:ring-2 focus:ring-gold/40"
  }`;

function Shell({ children }) {
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-mist px-4 py-3">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-[13px] font-bold text-steel hover:text-navy"><ArrowLeft size={15} /> Back to login</Link>
        <div className="mt-2 rounded-2xl border border-line bg-white p-6 shadow-[0_24px_60px_rgba(0,32,73,0.12)] sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}

export default function Reset() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const emailParam = params.get("email") || "";
  const isReset = Boolean(token);

  const { notify } = useNotification();
  const go = useNavigate();

  const [email, setEmail] = useState(emailParam);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Request a reset link
  const requestLink = async (e) => {
    e.preventDefault();
    setErr("");
    if (!emailRx.test(email.trim())) { setErr("Enter a valid email address."); return; }
    if (!API_ON) { setErr("Password reset is available once the store is connected to the server."); return; }
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() }, { auth: false });
      setDone(true);
    } catch (e2) {
      setErr(e2.message || "Could not send the reset link.");
    } finally {
      setBusy(false);
    }
  };

  // Set a new password with the token
  const setNewPassword = async (e) => {
    e.preventDefault();
    setErr("");
    if (pass.length < 8 || !/\d/.test(pass) || !/[A-Z]/.test(pass)) { setErr("Min 8 chars, with 1 number and 1 uppercase."); return; }
    if (pass !== confirm) { setErr("Passwords do not match."); return; }
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { email: emailParam, token, password: pass }, { auth: false });
      notify.success({ kicker: "PASSWORD UPDATED", title: "Password changed", message: "You can now log in with your new password.", icon: "login", sound: true });
      setTimeout(() => go("/login"), 1200);
      setDone(true);
    } catch (e2) {
      setErr(e2.message || "This reset link is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  };

  if (done && !isReset) {
    return (
      <Shell>
        <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold text-ink"><BadgeCheck size={26} /></p>
        <h1 className="mt-3 text-center text-2xl font-extrabold tracking-tight">Check your inbox</h1>
        <p className="mx-auto mt-1 max-w-xs text-center text-[13px] text-steel">If an account exists for <b>{email.trim()}</b>, a password reset link is on its way. It expires in 1 hour.</p>
        <Link to="/login" className="mt-5 block rounded-lg bg-gold py-3 text-center text-sm font-extrabold text-ink transition hover:bg-ink hover:text-white">Back to login</Link>
      </Shell>
    );
  }

  if (isReset) {
    return (
      <Shell>
        <div className="flex items-center gap-2 text-[11px] font-bold text-faint"><ShieldCheck size={13} className="text-green-700" /> SECURE RESET</div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Set a new password</h1>
        <p className="mt-0.5 text-[13px] text-steel">For {emailParam || "your account"}. Choose something strong.</p>
        <form onSubmit={setNewPassword} className="mt-4 grid gap-2.5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-steel">New password</span>
            <span className={inputCls(false)}><Lock size={16} className="shrink-0 text-faint" /><input value={pass} onChange={(e) => setPass(e.target.value)} type="password" maxLength={72} placeholder="New password" className="w-full bg-transparent outline-none" autoComplete="new-password" /></span>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-steel">Confirm password</span>
            <span className={inputCls(false)}><Lock size={16} className="shrink-0 text-faint" /><input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" maxLength={72} placeholder="Re-enter password" className="w-full bg-transparent outline-none" autoComplete="new-password" /></span>
          </label>
          {err && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">{err}</p>}
          <button disabled={busy} className="group flex h-10 items-center justify-center gap-2 rounded-lg bg-gold text-sm font-extrabold text-ink transition hover:bg-ink hover:text-white disabled:opacity-60">
            {busy ? "Saving…" : "Update password"} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center gap-2 text-[11px] font-bold text-faint"><ShieldCheck size={13} className="text-green-700" /> ACCOUNT RECOVERY</div>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Forgot your password?</h1>
      <p className="mt-0.5 text-[13px] text-steel">Enter your account email and we'll send a reset link.</p>
      <form onSubmit={requestLink} className="mt-4 grid gap-2.5">
        <label className="block">
          <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-steel">Email address</span>
          <span className={inputCls(false)}><Mail size={16} className="shrink-0 text-faint" /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={120} placeholder="you@fleet.com.au" className="w-full bg-transparent outline-none" autoComplete="email" /></span>
        </label>
        {err && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">{err}</p>}
        <button disabled={busy} className="group flex h-10 items-center justify-center gap-2 rounded-lg bg-gold text-sm font-extrabold text-ink transition hover:bg-ink hover:text-white disabled:opacity-60">
          {busy ? "Sending…" : "Send reset link"} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
        <p className="text-center text-xs text-steel">Remembered it? <Link to="/login" className="font-extrabold text-navy underline">Log in</Link></p>
      </form>
    </Shell>
  );
}
