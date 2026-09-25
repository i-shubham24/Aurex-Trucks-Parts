import { useState } from "react";
import { Power, Trash2 } from "lucide-react";
import { useSite } from "../../store/site";
import { AdminTitle } from "./AdminLayout";

export default function Marketing() {
  const { promos, setPromos } = useSite();
  const [code, setCode] = useState("");
  const [pct, setPct] = useState("");
  const [err, setErr] = useState("");

  const add = (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) { setErr("Code is required."); return; }
    if (promos.some((p) => p.code === c)) { setErr("That code already exists."); return; }
    const n = Number(pct);
    if (!(n > 0 && n <= 90)) { setErr("Percent must be 1–90."); return; }
    setPromos((l) => [...l, { code: c, label: "Custom", pct: n, active: true }]);
    setCode("");
    setPct("");
    setErr("");
  };

  const input = "h-11 rounded-md border border-line-dark bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold";
  return (
    <div>
      <AdminTitle kicker="Catalog" title="Marketing & Promos" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border-2 border-ink bg-white">
          <p className="border-b-2 border-ink px-4 py-2.5 text-sm font-extrabold">Promo codes</p>
          {promos.length === 0 && <p className="p-4 text-sm text-steel">No codes. Add one below.</p>}
          {promos.map((p) => (
            <div key={p.code} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
              <span className="bg-ink px-2.5 py-1 font-mono text-[12px] font-bold text-gold">{p.code}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{p.label}</span>
                <span className="tabular text-xs text-steel">{p.pct}% off · {p.active ? "Active" : "Paused"}</span>
              </span>
              <button onClick={() => setPromos((l) => l.map((x) => (x.code === p.code ? { ...x, active: !x.active } : x)))}
                aria-label="Toggle active" className={`grid h-9 w-9 place-items-center border transition-colors ${p.active ? "border-navy bg-navy text-white" : "border-line-dark text-faint hover:border-navy hover:text-navy"}`}>
                <Power size={15} />
              </button>
              <button onClick={() => { if (window.confirm(`Delete ${p.code}?`)) setPromos((l) => l.filter((x) => x.code !== p.code)); }}
                aria-label="Delete" className="grid h-9 w-9 place-items-center border border-line-dark text-steel transition-colors hover:border-red-500 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <div className="h-fit border-2 border-ink bg-white p-4">
          <p className="text-sm font-extrabold">Add code</p>
          <form onSubmit={add} className="mt-2 grid gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" className={`${input} font-mono`} />
            <input value={pct} onChange={(e) => setPct(e.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" placeholder="% off" className={input} />
            {err && <p className="text-[13px] font-semibold text-red-600">{err}</p>}
            <button className="rounded bg-gold py-2.5 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">Add Promo</button>
          </form>
          <p className="mt-3 border-t border-line pt-3 text-xs leading-5 text-steel">Active codes apply at checkout. The highest-percent active code also feeds the homepage welcome popup.</p>
        </div>
      </div>
    </div>
  );
}

