import { useState } from "react";
import { formatAUD } from "../../data/products";
import { imgFor } from "../../data/images";
import { useCatalog } from "../../store/catalog";
import { AdminTitle, Empty, Modal, td, th } from "./AdminLayout";

const STATUSES = ["In stock VIC", "Built to order", "Enquire"];
const blankForm = { sku: "", name: "", price: "", category: "accessories", sub: "", brand: "", fit: "", oem: "", status: "In stock VIC", lead: "", rating: "4.6", reviews: "12", badge: "", desc: "", specs: "" };

function specsToText(specs) {
  if (!specs) return "";
  return Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join("\n");
}
function textToSpecs(text) {
  const out = {};
  text.split("\n").forEach((line) => {
    const i = line.indexOf(":");
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  return out;
}

export default function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct, resetCatalog } = useCatalog();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [modal, setModal] = useState(null); // null | "add" | sku-being-edited
  const [form, setForm] = useState(blankForm);
  const [err, setErr] = useState("");

  const query = q.toLowerCase().trim();
  const list = products.filter((p) => {
    if (cat !== "All" && p.category !== cat) return false;
    if (!query) return true;
    return `${p.sku} ${p.name} ${p.brand || ""}`.toLowerCase().includes(query);
  });

  const openAdd = () => { setForm({ ...blankForm, category: categories[0]?.slug || "accessories" }); setErr(""); setModal("add"); };
  const openEdit = (p) => {
    setForm({
      sku: p.sku, name: p.name, price: p.price == null ? "" : String(p.price),
      category: p.category, sub: p.sub || "", brand: p.brand || "", fit: p.fit || "",
      oem: p.oem || "", status: p.price == null ? "Enquire" : (p.status || "In stock VIC"),
      lead: p.lead || "", rating: String(p.rating || 4.6), reviews: String(p.reviews || 12),
      badge: p.badge || "", desc: p.desc || "", specs: specsToText(p.specs),
    });
    setErr("");
    setModal(p.sku);
  };

  const save = (e) => {
    e.preventDefault();
    const patch = {
      name: form.name.trim(),
      price: form.price === "" ? null : Number(form.price),
      category: form.category,
      sub: form.sub.trim(),
      brand: form.brand.trim(),
      fit: form.fit.trim(),
      oem: form.oem.trim(),
      status: form.price === "" ? "Enquire" : form.status,
      lead: form.lead.trim(),
      rating: Number(form.rating) || 4.6,
      reviews: Number(form.reviews) || 0,
      badge: form.badge.trim(),
      desc: form.desc.trim(),
      specs: textToSpecs(form.specs),
    };
    if (!patch.name) { setErr("Name is required."); return; }
    if (form.price !== "" && !(patch.price > 0)) { setErr("Price must be above 0, or blank for enquiry-only."); return; }
    let r;
    if (modal === "add") r = addProduct({ sku: form.sku, ...patch });
    else { updateProduct(modal, patch); r = { ok: true }; }
    if (!r.ok) { setErr(r.msg); return; }
    setModal(null);
  };

  const input = "h-11 w-full rounded-md border border-line-dark bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold";
  const label = "mb-1 block text-xs font-bold";
  return (
    <div>
      <AdminTitle kicker="Catalog" title={`Products (${products.length})`} right={
        <div className="flex gap-2">
          <button onClick={() => { if (window.confirm("Reset catalogue to seed data? Admin edits will be lost.")) resetCatalog(); }} className="rounded border border-line-dark px-4 py-2 text-[13px] font-bold transition-colors hover:border-navy hover:text-navy">Reset</button>
          <button onClick={openAdd} className="rounded bg-gold px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-navy hover:text-white">+ Add Product</button>
        </div>
      } />
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU, brand…" className={`${input} min-w-52 flex-1`} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={input} aria-label="Category">
          <option>All</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
      {list.length === 0 ? <Empty text="No products match." /> : (
        <div className="overflow-x-auto border-2 border-ink bg-white">
          <table className="w-full min-w-[820px] border-collapse">
            <thead><tr><th className={th}>Product</th><th className={th}>Cat</th><th className={th}>Price</th><th className={th}>Status</th><th className={th}>Rating</th><th className={th}>Actions</th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.sku}>
                  <td className={td}>
                    <span className="flex items-center gap-2.5">
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-mist">{imgFor(p.sku) && <img src={imgFor(p.sku)} alt="" className="h-full w-full object-cover" />}</span>
                      <span><span className="block font-bold">{p.name}</span><span className="font-mono text-[11px] text-faint">{p.sku}{p.brand ? ` · ${p.brand}` : ""}</span></span>
                    </span>
                  </td>
                  <td className={td}>{p.category}</td>
                  <td className={td}><span className="tabular font-bold">{p.price == null ? "POA" : formatAUD(p.price)}</span></td>
                  <td className={td}>{p.price == null ? "Enquire" : p.status}</td>
                  <td className={td}>★ {p.rating} ({p.reviews})</td>
                  <td className={td}>
                    <span className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="font-bold text-navy underline">Edit</button>
                      <button onClick={() => { if (window.confirm(`Delete ${p.sku}?`)) deleteProduct(p.sku); }} className="font-bold text-red-600 underline">Delete</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 font-mono text-[11px] text-faint">PRODUCT IMAGES RESOLVE BY SKU — DROP A FILE AT PUBLIC/IMAGES/PRODUCTS/&lt;SKU&gt;.JPG TO CHANGE THE PHOTO.</p>
      {modal && (
        <Modal close={() => setModal(null)} wide>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">{modal === "add" ? "Add product" : `Edit ${modal}`}</p>
          <form onSubmit={save} className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={label}>SKU *</span><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} disabled={modal !== "add"} placeholder="GL-00000" className={`${input} disabled:bg-mist`} /></label>
            <label className="block"><span className={label}>Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-2"><span className={label}>Name *</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className={input} /></label>
            <label className="block"><span className={label}>Price (blank = enquiry only)</span><input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })} inputMode="decimal" placeholder="e.g. 293" className={input} /></label>
            <label className="block"><span className={label}>Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={input}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </label>
            <label className="block"><span className={label}>Sub line</span><input value={form.sub} onChange={(e) => setForm({ ...form, sub: e.target.value })} placeholder="e.g. Tail Lifts" className={input} /></label>
            <label className="block"><span className={label}>Brand</span><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Beauway" className={input} /></label>
            <label className="block sm:col-span-2"><span className={label}>Fitment</span><input value={form.fit} onChange={(e) => setForm({ ...form, fit: e.target.value })} placeholder="Suits…" className={input} /></label>
            <label className="block"><span className={label}>OEM cross</span><input value={form.oem} onChange={(e) => setForm({ ...form, oem: e.target.value })} className={input} /></label>
            <label className="block"><span className={label}>Lead time</span><input value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} placeholder="e.g. Ships in 24 hrs" className={input} /></label>
            <label className="block"><span className={label}>Rating (1–5)</span><input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value.replace(/[^\d.]/g, "").slice(0, 3) })} inputMode="decimal" className={input} /></label>
            <label className="block"><span className={label}>Reviews count</span><input value={form.reviews} onChange={(e) => setForm({ ...form, reviews: e.target.value.replace(/\D/g, "") })} inputMode="numeric" className={input} /></label>
            <label className="block"><span className={label}>Badge</span><input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. 2T Aluminium" className={input} /></label>
            <label className="block"><span className={label}>Description</span><textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} className="w-full rounded-md border border-line-dark bg-white px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-gold" /></label>
            <label className="block sm:col-span-2"><span className={label}>Specs (one Key: value per line)</span><textarea value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} rows={3} placeholder={"Capacity: 2000 kg\nPower: 24V"} className="w-full rounded-md border border-line-dark bg-white px-3 py-2.5 font-mono text-[13px] outline-none placeholder:text-faint focus:border-gold" /></label>
            {err && <p className="text-sm font-semibold text-red-600 sm:col-span-2">{err}</p>}
            <button className="rounded bg-gold py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white sm:col-span-2">{modal === "add" ? "Add Product" : "Save Changes"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
