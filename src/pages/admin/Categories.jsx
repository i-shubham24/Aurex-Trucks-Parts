import { useState } from "react";
import { useCatalog } from "../../store/catalog";
import { AdminTitle, Modal, td, th } from "./AdminLayout";

export default function Categories() {
  const { categories, updateCategory, addCategory, deleteCategory, resetCategories } = useCatalog();
  const [modal, setModal] = useState(null); // null | "add" | slug
  const [form, setForm] = useState({ name: "", tag: "", blurb: "" });
  const [err, setErr] = useState("");

  const openAdd = () => { setForm({ name: "", tag: "", blurb: "" }); setErr(""); setModal("add"); };
  const openEdit = (c) => { setForm({ name: c.name, tag: c.tag || "", blurb: c.blurb || "" }); setErr(""); setModal(c.slug); };
  const save = (e) => {
    e.preventDefault();
    let r;
    if (modal === "add") r = addCategory(form);
    else { updateCategory(modal, { name: form.name.trim(), tag: form.tag.trim(), blurb: form.blurb.trim() }); r = { ok: true }; }
    if (!r.ok) { setErr(r.msg); return; }
    setModal(null);
  };

  const input = "h-11 w-full rounded-md border border-line-dark bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold";
  const label = "mb-1 block text-xs font-bold";
  return (
    <div>
      <AdminTitle kicker="Catalog" title={`Categories (${categories.length})`} right={
        <div className="flex gap-2">
          <button onClick={() => { if (window.confirm("Reset categories to seed data?")) resetCategories(); }} className="rounded border border-line-dark px-4 py-2 text-[13px] font-bold transition-colors hover:border-navy hover:text-navy">Reset</button>
          <button onClick={openAdd} className="rounded bg-gold px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-navy hover:text-white">+ Add Category</button>
        </div>
      } />
      <div className="overflow-x-auto border-2 border-ink bg-white">
        <table className="w-full min-w-[680px] border-collapse">
          <thead><tr><th className={th}>Category</th><th className={th}>Slug</th><th className={th}>Lines</th><th className={th}>Tag</th><th className={th}>Actions</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.slug}>
                <td className={td}><span className="block font-bold">{c.name}</span><span className="block max-w-md text-xs text-steel">{c.blurb}</span></td>
                <td className={td}><span className="font-mono text-[12px]">/shop/{c.slug}</span></td>
                <td className={td}><span className="tabular font-bold">{c.count}</span></td>
                <td className={td}>{c.tag || "—"}</td>
                <td className={td}>
                  <span className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="font-bold text-navy underline">Edit</button>
                    <button onClick={() => { if (window.confirm(`Delete ${c.name}? Its products stay but lose this shelf.`)) deleteCategory(c.slug); }} className="font-bold text-red-600 underline">Delete</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal close={() => setModal(null)}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">{modal === "add" ? "Add category" : `Edit /shop/${modal}`}</p>
          <form onSubmit={save} className="mt-3 grid gap-3">
            <label className="block"><span className={label}>Name *</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lighting" className={input} /></label>
            <label className="block"><span className={label}>Tag</span><input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. New" className={input} /></label>
            <label className="block"><span className={label}>Blurb</span><textarea value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} rows={3} className="w-full rounded-md border border-line-dark bg-white px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-gold" /></label>
            {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
            <button className="rounded bg-gold py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white">{modal === "add" ? "Add Category" : "Save Changes"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
