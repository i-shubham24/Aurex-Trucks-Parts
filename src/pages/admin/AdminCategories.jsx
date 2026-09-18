import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useSite, ICON_OPTIONS, ICONS } from "../../store/site.jsx";

const inp = "rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none text-sm w-full";
const lab = "text-[11px] font-black tracking-widest text-white/35";

export default function AdminCategories() {
  const { categories, liveCategories, updateCategory, addCategory, deleteCategory, resetCategories } = useSite();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", count: 50, blurb: "", subs: "", icon: "Cog", image: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => { setForm({ name: "", count: 50, blurb: "", subs: "", icon: "Cog", image: "" }); setEditing(null); setErr(""); setModal(true); };
  const openEdit = (c) => { setForm({ name: c.name, count: c.count, blurb: c.blurb, subs: (c.subs || []).join(", "), icon: c.icon, image: c.image || "" }); setEditing(c.name); setErr(""); setModal(true); };
  const save = () => {
    const payload = { count: Number(form.count) || 0, blurb: form.blurb.trim(), subs: String(form.subs).split(",").map((s) => s.trim()).filter(Boolean), icon: form.icon, image: form.image.trim() };
    if (editing) { updateCategory(editing, payload); }
    else {
      const r = addCategory({ name: form.name, ...payload });
      if (!r.ok) { setErr(r.msg); return; }
    }
    setModal(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="font-display font-bold text-3xl">Categories ({categories.length})</h1><p className="text-white/50 text-sm mt-1">Name, description, icon, image and sub groups. Live across Home, Shop and nav instantly.</p></div>
        <div className="ml-auto flex gap-2"><button onClick={() => { if (confirm("Reset categories to seed data?")) resetCategories(); }} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold">Reset</button><button onClick={openNew} className="rounded-full bg-[#5B93D1] px-5 py-2.5 text-sm font-black flex items-center gap-1.5"><Plus size={15} /> Add category</button></div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {liveCategories.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.name} className="rounded-[22px] border border-white/10 bg-[#0C1622] overflow-hidden">
              {c.image ? <img src={c.image} alt="" className="h-28 w-full object-cover" loading="lazy" /> : <div className="h-16 bg-white/[0.03]" />}
              <div className="p-5">
                <div className="flex items-center gap-3"><span className="grid place-items-center w-11 h-11 rounded-xl bg-white/5 border border-white/10"><Icon size={20} /></span><div><p className="font-display font-bold text-lg">{c.name}</p><p className="text-[11px] text-white/35 font-bold">{c.count} lines</p></div></div>
                <p className="text-[13px] text-white/50 mt-2.5 min-h-[36px]">{c.blurb || "No description yet."}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{(c.subs || []).map((s) => <span key={s} className="text-[11px] bg-white/5 border border-white/10 rounded-full px-2.5 py-1">{s}</span>)}</div>
                <div className="mt-4 flex gap-2"><button onClick={() => openEdit(c)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5 hover:border-[#d9ff3d]"><Pencil size={14} /> Edit</button><button onClick={() => { if (confirm(`Delete ${c.name}? Products in it stay but lose their filter.`)) deleteCategory(c.name); }} className="rounded-xl border border-white/10 px-4 py-2.5 hover:border-red-400"><Trash2 size={14} /></button></div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/75" onClick={() => setModal(false)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-xl rounded-[24px] border border-white/10 bg-[#0C1622] p-6 max-h-[88vh] overflow-auto">
              <div className="flex items-center"><p className="font-display font-bold text-2xl">{editing ? `Edit ${editing}` : "Add category"}</p><button onClick={() => setModal(false)} className="ml-auto p-2 border border-white/10 rounded-lg"><X size={16} /></button></div>
              <div className="mt-4 grid gap-3 text-sm">
                {!editing && <label className="grid gap-1.5"><span className={lab}>NAME (UNIQUE)</span><input value={form.name} onChange={set("name")} placeholder="e.g. Air Conditioning" className={inp} /></label>}
                <label className="grid gap-1.5"><span className={lab}>DESCRIPTION</span><textarea value={form.blurb} onChange={set("blurb")} rows={2} placeholder="Short shopper facing line, e.g. Compressors, condensers plus regas kits" className={inp} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5"><span className={lab}>LINE COUNT</span><input value={form.count} onChange={set("count")} type="number" min={0} className={inp} /></label>
                  <label className="grid gap-1.5"><span className={lab}>ICON (LIVE PREVIEW)</span>
                    <span className="flex gap-2"><select value={form.icon} onChange={set("icon")} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none flex-1">{ICON_OPTIONS.map((n) => <option key={n}>{n}</option>)}</select><span className="grid place-items-center w-[52px] rounded-xl bg-white/5 border border-white/10">{(() => { const I = ICONS[form.icon] || ICONS.Cog; return <I size={20} />; })()}</span></span>
                  </label>
                </div>
                <label className="grid gap-1.5"><span className={lab}>IMAGE URL (OPTIONAL)</span><input value={form.image} onChange={set("image")} placeholder="https://..." className={inp} /></label>
                {form.image && <img src={form.image} alt="preview" className="h-28 w-full object-cover rounded-xl border border-white/10" loading="lazy" />}
                <label className="grid gap-1.5"><span className={lab}>SUB GROUPS (COMMA SEPARATED)</span><input value={form.subs} onChange={set("subs")} placeholder="Compressors, Condensers, Regas kits" className={inp} /></label>
              </div>
              {err && <p className="mt-3 text-[13px] text-red-400 font-semibold">{err}</p>}
              <button onClick={save} className="mt-4 w-full bg-[#5B93D1] rounded-2xl py-3.5 text-sm font-black hover:bg-white hover:text-black transition">{editing ? "Save changes" : "Add category"}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
