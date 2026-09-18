import { useState } from "react";
import { Search, Trash2, Power } from "lucide-react";
import { useSite } from "../../store/site.jsx";

const readUsers = () => { try { const v = localStorage.getItem("aurex_users"); return v ? JSON.parse(v) : []; } catch { return []; } };

export function AdminCustomers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState(readUsers);
  const remove = (email) => { if (!confirm(`Delete ${email}?`)) return; const next = users.filter((u) => u.email !== email); setUsers(next); try { localStorage.setItem("aurex_users", JSON.stringify(next)); } catch {} };
  const list = users.filter((u) => q.trim() === "" || (u.name + " " + u.email + " " + (u.company || "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <h1 className="font-display font-bold text-3xl">Customers ({users.length})</h1>
      <p className="text-white/50 text-sm mt-1">Signup accounts from the storefront. Admins are tagged.</p>
      <div className="mt-4 flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 max-w-md"><Search size={15} className="text-white/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company..." className="flex-1 bg-transparent outline-none text-sm" /></div>
      <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0C1622] overflow-hidden"><div className="overflow-x-auto"><table className="sticky-col w-full text-sm min-w-[680px]">
        <thead><tr className="text-left text-[11px] text-white/35">{["NAME", "EMAIL", "COMPANY", "JOINED", ""].map((h) => <th key={h} className="px-4 py-3 font-black tracking-widest">{h}</th>)}</tr></thead>
        <tbody>{list.map((u) => <tr key={u.email} className="border-t border-white/[0.07]"><td className="px-4 py-3 font-bold">{u.name} {u.role === "admin" && <span className="ml-1 text-[10px] font-black bg-[#d9ff3d] text-black rounded-full px-2 py-0.5">ADMIN</span>}</td><td className="px-4 py-3 text-white/55">{u.email}</td><td className="px-4 py-3 text-white/55">{u.company || "-"}</td><td className="px-4 py-3 text-white/45 text-[13px]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td><td className="px-4 py-3">{u.role !== "admin" && <button onClick={() => remove(u.email)} className="p-2 border border-white/10 rounded-lg"><Trash2 size={14} /></button>}</td></tr>)}</tbody>
      </table></div></div>
    </div>
  );
}

export function AdminQuotes() {
  const { enquiries, setEnquiryStatus, quotes, setQuoteStatus } = useSite();
  const convert = (x) => {
    if (!x.items || x.items.length === 0) { alert("Quote has no lines to convert."); return; }
    const id = "AUX-" + Math.floor(1000 + Math.random() * 9000);
    const order = { id, email: x.email || "trade-counter", items: x.items, subtotal: x.total || 0, shipping: "Standard road", shippingFee: 0, payment: "Trade account", total: x.total || 0, status: "Packed in Campbellfield VIC", placedAt: new Date().toISOString() };
    try {
      const raw = localStorage.getItem("aurex_orders");
      const arr = raw ? JSON.parse(raw) : [];
      localStorage.setItem("aurex_orders", JSON.stringify([order, ...arr]));
    } catch { /* noop */ }
    setQuoteStatus(x.id, "Won");
  };
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div>
        <h1 className="font-display font-bold text-3xl">Enquiries ({enquiries.length})</h1>
        <p className="text-white/50 text-sm mt-1">Contact form inbox. New contact submissions appear here live.</p>
        <div className="mt-4 space-y-3">{enquiries.map((e) => (
          <div key={e.id} className="rounded-[20px] border border-white/10 bg-[#0C1622] p-5">
            <div className="flex gap-2 items-center"><b>{e.name}</b><span className={`text-[11px] font-black rounded-full px-2.5 py-1 ${e.status === "New" ? "bg-[#5B93D1] text-white" : "bg-white/10 text-white/60"}`}>{e.status}</span><span className="ml-auto text-[11px] text-white/35">{e.id}</span></div>
            <p className="text-[13px] text-white/55 mt-1.5">{e.truck}, {e.email}, {e.phone}</p>
            <p className="text-sm mt-2">{e.message}</p>
            <div className="mt-3 flex gap-2">{["New", "Replied", "Closed"].map((s) => <button key={s} onClick={() => setEnquiryStatus(e.id, s)} className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border ${e.status === s ? "bg-white text-black border-white" : "border-white/15 text-white/55"}`}>{s}</button>)}</div>
          </div>))}
        </div>
      </div>
      <div>
        <h1 className="font-display font-bold text-3xl">Quote carts ({quotes.length})</h1>
        <p className="text-white/50 text-sm mt-1">Saved from the Quote page send action.</p>
        <div className="mt-4 space-y-3">{quotes.length === 0 && <p className="rounded-[20px] border border-dashed border-white/15 p-8 text-center text-white/40 text-sm">No saved quotes yet.</p>}{quotes.map((x) => (
          <div key={x.id} className="rounded-[20px] border border-white/10 bg-[#0C1622] p-5">
            <div className="flex gap-2 items-center"><b>{x.id}</b><span className="text-[11px] font-black bg-white/10 rounded-full px-2.5 py-1">{x.status}</span><b className="ml-auto">${(x.total || 0).toFixed(2)}</b></div>
            <p className="text-[13px] text-white/55 mt-1.5">{x.email}, {(x.items || []).length} lines</p>
            <div className="mt-3 flex flex-wrap gap-2">{["New", "Quoted", "Won", "Lost"].map((s) => <button key={s} onClick={() => setQuoteStatus(x.id, s)} className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border ${x.status === s ? "bg-white text-black border-white" : "border-white/15 text-white/55"}`}>{s}</button>)}
              {(x.items || []).length > 0 && x.status !== "Won" && <button onClick={() => convert(x)} className="px-3.5 py-1.5 rounded-full text-[12px] font-black bg-[#d9ff3d] text-black">Convert to order</button>}
            </div>
          </div>))}
        </div>
      </div>
    </div>
  );
}

export function AdminDeals() {
  const { promos, setPromos, content, setContent } = useSite();
  const [code, setCode] = useState("");
  const [pct, setPct] = useState(10);
  const toggle = (c) => setPromos(promos.map((p) => (p.code === c ? { ...p, active: !p.active } : p)));
  const remove = (c) => setPromos(promos.filter((p) => p.code !== c));
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div>
        <h1 className="font-display font-bold text-3xl">Promo codes</h1>
        <p className="text-white/50 text-sm mt-1">Codes customers enter at checkout. Active codes show on Deals.</p>
        <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0C1622] p-5 grid sm:grid-cols-[1fr_120px_auto] gap-2.5">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE, e.g. WINTER15" className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none text-sm font-bold" />
          <input value={pct} onChange={(e) => setPct(Number(e.target.value))} type="number" min={1} max={90} placeholder="%" className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none text-sm" />
          <button onClick={() => { if (!code.trim()) return; setPromos([{ code: code.trim(), label: "Custom", pct, active: true }, ...promos]); setCode(""); }} className="rounded-xl bg-[#5B93D1] px-5 py-3 text-sm font-black">Add</button>
        </div>
        <div className="mt-4 space-y-2.5">{promos.map((p) => (
          <div key={p.code} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0C1622] p-4">
            <span className="font-black bg-white text-black rounded-lg px-3 py-1.5 text-sm">{p.code}</span>
            <span className="font-display font-bold text-xl">{p.pct}%</span>
            <span className="text-[13px] text-white/45">{p.label}</span>
            <button onClick={() => toggle(p.code)} className="ml-auto p-2 border border-white/10 rounded-lg" title="Toggle"><Power size={14} className={p.active ? "text-emerald-400" : "text-white/30"} /></button>
            <button onClick={() => remove(p.code)} className="p-2 border border-white/10 rounded-lg"><Trash2 size={14} /></button>
          </div>))}
        </div>
      </div>
      <div>
        <h1 className="font-display font-bold text-3xl">Homepage promo strip</h1>
        <p className="text-white/50 text-sm mt-1">Controls the discount banner text saved to the site.</p>
        <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0C1622] p-5 grid gap-3 text-sm">
          <input value={content.promoCode} onChange={(e) => setContent({ ...content, promoCode: e.target.value })} placeholder="Promo code" className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none" />
          <input value={content.promoText} onChange={(e) => setContent({ ...content, promoText: e.target.value })} placeholder="Promo text" className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none" />
          <p className="text-[12px] text-white/40">Saved instantly to this browser. Wire to storefront banner on next pass if needed.</p>
        </div>
      </div>
    </div>
  );
}

export function AdminContent() {
  const { content, setContent } = useSite();
  const set = (k) => (e) => setContent({ ...content, [k]: e.target.value });
  return (
    <div>
      <h1 className="font-display font-bold text-3xl">Homepage content</h1>
      <p className="text-white/50 text-sm mt-1">Edit hero plus deals copy. Saved instantly, ready to wire live.</p>
      <div className="mt-5 rounded-[22px] border border-white/10 bg-[#0C1622] p-6 grid sm:grid-cols-2 gap-3 text-sm">
        {[["heroKicker", "Hero kicker"], ["heroTitleA", "Hero line 1"], ["heroTitleB", "Hero line 2"], ["heroTitleC", "Hero line 3"], ["dealTitle", "Deals title"]].map(([k, l]) => (
          <label key={k} className="grid gap-1.5"><span className="text-[11px] font-black tracking-widest text-white/35">{l.toUpperCase()}</span><input value={content[k] || ""} onChange={set(k)} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none" /></label>
        ))}
        <label className="grid gap-1.5 sm:col-span-2"><span className="text-[11px] font-black tracking-widest text-white/35">HERO SUB</span><textarea value={content.heroSub} onChange={set("heroSub")} rows={3} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none" /></label>
        <label className="grid gap-1.5 sm:col-span-2"><span className="text-[11px] font-black tracking-widest text-white/35">DEALS SUB</span><textarea value={content.dealSub} onChange={set("dealSub")} rows={2} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none" /></label>
      </div>
    </div>
  );
}

export function AdminSettings() {
  const { settings, setSettings, resetSite } = useSite();
  const [saved, setSaved] = useState(false);
  
  const set = (k) => (e) => setSettings({ ...settings, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value });
  
  const handleSave = () => {
    // Already auto-saved to store, just provide UX feedback
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl">Store settings</h1>
      <p className="text-white/50 text-sm mt-1">Contact, freight rules and announcement bar.</p>
      <div className="mt-5 rounded-[22px] border border-white/10 bg-[#0C1622] p-6 grid sm:grid-cols-2 gap-3 text-sm">
        {[["storeName", "Store name"], ["phone", "Phone"], ["email", "Email"], ["address", "Address"], ["hours", "Hours"], ["abn", "ABN"]].map(([k, l]) => (
          <label key={k} className="grid gap-1.5"><span className="text-[11px] font-black tracking-widest text-white/35">{l.toUpperCase()}</span><input value={settings[k] || ""} onChange={set(k)} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none focus:border-[#5B93D1]/50 transition" /></label>
        ))}
        <label className="grid gap-1.5"><span className="text-[11px] font-black tracking-widest text-white/35">FREE FREIGHT OVER ($)</span><input type="number" value={settings.freeFreightOver} onChange={set("freeFreightOver")} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none focus:border-[#5B93D1]/50 transition" /></label>
        <label className="grid gap-1.5"><span className="text-[11px] font-black tracking-widest text-white/35">STANDARD FEE ($)</span><input type="number" value={settings.standardFee} onChange={set("standardFee")} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none focus:border-[#5B93D1]/50 transition" /></label>
        <label className="grid gap-1.5 sm:col-span-2"><span className="text-[11px] font-black tracking-widest text-white/35">ANNOUNCEMENT BAR</span><input value={settings.announcement} onChange={set("announcement")} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none focus:border-[#5B93D1]/50 transition" /></label>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button onClick={handleSave} className={`rounded-xl px-8 py-3.5 text-sm font-bold transition flex items-center gap-2 ${saved ? 'bg-[#10B981] text-white' : 'bg-[#5B93D1] text-white hover:bg-[#9AC1EE]'}`}>
          {saved ? "Settings Saved!" : "Save Settings"}
        </button>
        <button onClick={() => { if (confirm("Reset settings and content to defaults?")) resetSite(); }} className="rounded-xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition">Reset to defaults</button>
      </div>
    </div>
  );
}
