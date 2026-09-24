import { useState } from "react";
import { useSite, DEFAULT_SETTINGS } from "../../store/site";
import { AdminTitle } from "./AdminLayout";

const FIELDS = [
  ["storeName", "Store name", "text"],
  ["phone", "Phone", "text"],
  ["email", "Email", "text"],
  ["address", "Address", "text"],
  ["hours", "Hours", "text"],
  ["abn", "ABN", "text"],
  ["announcement", "Announcement", "text"],
  ["freeFreightOver", "Free freight over ($)", "number"],
  ["standardFee", "Standard fee ($)", "number"],
  ["expressFee", "Express fee ($)", "number"],
];

export default function Settings() {
  const { settings, setSettings, resetSite } = useSite();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => {
    const v = e.target.value;
    setForm({ ...form, [k]: e.target.type === "number" ? Number(v) : v });
    setSaved(false);
  };
  const save = (e) => {
    e.preventDefault();
    setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email || "").trim())) { setErr("Store email is invalid."); return; }
    if (String(form.phone || "").replace(/\D/g, "").length < 8) { setErr("Store phone looks too short."); return; }
    for (const k of ["freeFreightOver", "standardFee", "expressFee"]) {
      if (!(Number(form[k]) >= 0)) { setErr("Freight fees must be 0 or more."); return; }
    }
    setSettings({
      ...form,
      email: String(form.email).trim(),
      phone: String(form.phone).trim(),
      freeFreightOver: Math.max(0, Number(form.freeFreightOver) || 0),
      standardFee: Math.max(0, Number(form.standardFee) || 0),
      expressFee: Math.max(0, Number(form.expressFee) || 0),
    });
    setSaved(true);
  };
  const input = "h-11 w-full rounded-md border border-line-dark bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold";
  const label = "mb-1 block text-xs font-bold";
  return (
    <div>
      <AdminTitle kicker="System" title="Settings" right={
        <button onClick={() => { if (window.confirm("Reset all site settings?")) { resetSite(); setForm(DEFAULT_SETTINGS); } }} className="rounded border border-line-dark px-4 py-2 text-[13px] font-bold transition-colors hover:border-navy hover:text-navy">Reset to defaults</button>
      } />
      <form onSubmit={save} className="grid gap-3 border-2 border-ink bg-white p-5 sm:grid-cols-2">
        {FIELDS.map(([k, l, t]) => (
          <label key={k} className="block"><span className={label}>{l}</span>
            <input type={t} value={form[k]} onChange={set(k)} className={input} />
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button className="rounded bg-gold px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Save Settings</button>
          {saved && <p className="text-sm font-semibold text-green-700">Saved. Freight fees and invoice ABN apply live.</p>}
          {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
        </div>
      </form>
      <p className="mt-2 font-mono text-[11px] text-faint">FREIGHT FEES FEED CHECKOUT INSTANTLY. CONTACT FIELDS APPLY AFTER A RELOAD — HEADER, FOOTER AND CONTACT READ THEM LIVE.</p>
    </div>
  );
}
