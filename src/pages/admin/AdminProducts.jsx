import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, ImageIcon } from "lucide-react";
import { useProducts } from "../../store/products.jsx";
import { useSite } from "../../store/site.jsx";
import { BRANDS } from "../../data/catalog.js";
import { IMG_OVERRIDES } from "../../data/productImages.js";

const img = (id, w = 320) => `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;
const PRESETS = [
  ["Red semi truck", "1519003722824-194d4455a60c"],
  ["Blue semi truck", "1601584115197-04ecc0da31d7"],
  ["Warehouse", "1504307651254-35680f356dfd"],
  ["Engine bay", "1449965408869-eaa3f722e40d"],
  ["Engine belt", "1486262715619-67b85e0b08d3"],
  ["Workshop crew", "1581092160607-ee22621dd758"],
  ["Engine work", "1581092918056-0c4c3acd3789"],
  ["Under vehicle", "1530046339160-ce3e530c7d2f"],
  ["Dark workshop", "1615906655593-ad0386982a0f"],
  ["Service bay", "1504222490345-c075b6008014"],
  ["Wrench", "1619642751034-765dfdf7c58e"],
  ["Headlight", "1626668893632-6f3a4466d22f"],
  ["Taillight", "1493238792000-8113da705763"],
];
const STOCKS = ["In stock VIC", "Low stock", "Built to order", "Out of stock"];
const BADGES = ["New", "Best Seller", "Deal", "ADR", "Kit", "Fleet Pick", "Value", "Workshop", "Heavy Duty", "OEM Spec"];

const empty = { sku: "", name: "", price: "", oldPrice: "", onSale: false, cat: "Trailer Parts", brand: "Ganland", badge: "New", fit: "", stock: "In stock VIC", oem: "", rating: 4.5, reviews: 0, desc: "", specs: "", image: "", preset: PRESETS[2][1], useCustom: false };
const inp = "rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none text-sm w-full";
const lab = "text-[11px] font-black tracking-widest text-white/35";

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, resetCatalog } = useProducts();
  const { liveCategories } = useSite();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");

  const brandOptions = useMemo(() => Array.from(new Set([...BRANDS.map((b) => b.charAt(0) + b.slice(1).toLowerCase()), ...products.map((p) => p.brand).filter(Boolean)])), [products]);
  const list = useMemo(() => products.filter((p) => {
    const okC = cat === "All" || p.cat === cat;
    const okQ = q.trim() === "" || (p.name + " " + p.sku + " " + (p.brand || "")).toLowerCase().includes(q.toLowerCase());
    return okC && okQ;
  }), [products, q, cat]);

  const previewImg = form.useCustom ? form.image : img(form.preset);
  const openNew = () => { setForm(empty); setErr(""); setModal("new"); };
  const openEdit = (p) => {
    const isPreset = PRESETS.some(([, id]) => p.image && p.image.includes(id));
    const isLocal = Object.values(IMG_OVERRIDES).includes(p.image);
    setForm({ ...empty, ...p, price: p.price == null ? "" : String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : "", onSale: !!p.oldPrice, specs: (p.specs || []).join(", "), image: (isPreset || !p.image) ? "" : p.image, useCustom: !isPreset && !!(p.image || "") || isLocal, preset: PRESETS.find(([, id]) => p.image && p.image.includes(id))?.[1] || PRESETS[2][1] });
    setErr(""); setModal("edit");
  };
  const save = () => {
    const payload = {
      ...form,
      price: form.price === "" || form.price == null ? null : Number(form.price) || 0,
      oldPrice: form.onSale && form.oldPrice ? Number(form.oldPrice) : null,
      rating: Math.min(5, Math.max(1, Number(form.rating) || 4.5)),
      reviews: Math.max(0, Number(form.reviews) || 0),
      specs: String(form.specs).split(",").map((s) => s.trim()).filter(Boolean),
      image: form.useCustom ? form.image.trim() : img(form.preset),
      imgCustom: true,
    };
    delete payload.onSale; delete payload.preset; delete payload.useCustom;
    if (!payload.name.trim()) { setErr("Name is required."); return; }
    if (modal === "new") { const r = addProduct(payload); if (!r.ok) { setErr(r.msg); return; } }
    else updateProduct(form.sku, payload);
    setModal(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="font-display font-bold text-3xl">Products ({products.length})</h1><p className="text-white/50 text-sm mt-1">Pickers over typing. Edits go live on the storefront instantly.</p></div>
        <div className="ml-auto flex gap-2"><button onClick={() => { if (confirm("Reset catalogue to seed data?")) resetCatalog(); }} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold">Reset</button><button onClick={openNew} className="rounded-full bg-[#ff4d00] px-5 py-2.5 text-sm font-black flex items-center gap-1.5"><Plus size={15} /> Add product</button></div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 flex-1 min-w-[220px]"><Search size={15} className="text-white/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU, brand..." className="flex-1 bg-transparent outline-none text-sm" /></div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold outline-none">{["All", ...liveCategories.map((c) => c.name)].map((c) => <option key={c} className="text-black">{c}</option>)}</select>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0d1218] overflow-hidden">
        <div className="overflow-x-auto"><table className="sticky-col w-full text-sm min-w-[860px]">
          <thead><tr className="text-left text-[11px] text-white/35">{["", "SKU", "PRODUCT", "CAT", "PRICE", "STOCK", "ACTIONS"].map((h) => <th key={h} className="px-4 py-3 font-black tracking-widest">{h}</th>)}</tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.sku} className="border-t border-white/[0.07] hover:bg-white/[0.02]">
              <td className="px-4 py-2.5">{p.image ? <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover" loading="lazy" /> : <span className="grid place-items-center w-12 h-12 rounded-lg bg-white/5 text-white/25"><ImageIcon size={18} /></span>}</td>
              <td className="px-2 py-3 font-bold text-[12px]">{p.sku}</td>
              <td className="px-4 py-3"><b className="block max-w-[300px] truncate">{p.name}</b><span className="text-[11px] text-white/35">{p.brand}, {p.reviews} rev</span></td>
              <td className="px-4 py-3 text-white/60 text-[13px]">{p.cat}</td>
              <td className="px-4 py-3 font-bold">${p.price == null ? "POA" : p.price.toFixed(2)}{p.oldPrice && <span className="block text-[11px] line-through text-white/30 font-medium">${p.oldPrice.toFixed(2)}</span>}</td>
              <td className="px-4 py-3"><span className="text-[11px] font-black bg-white/10 rounded-full px-2.5 py-1">{p.stock}</span></td>
              <td className="px-4 py-3"><span className="flex gap-1.5"><button onClick={() => openEdit(p)} className="p-2 border border-white/10 rounded-lg hover:border-[#d9ff3d]"><Pencil size={14} /></button><button onClick={() => { if (confirm(`Delete ${p.sku}?`)) deleteProduct(p.sku); }} className="p-2 border border-white/10 rounded-lg hover:border-red-400"><Trash2 size={14} /></button></span></td>
            </tr>))}
          </tbody>
        </table></div>
        {list.length === 0 && <p className="p-6 text-white/40 text-sm">No products match.</p>}
      </div>

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/75" onClick={() => setModal(null)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-3xl rounded-[24px] border border-white/10 bg-[#0d1218] p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-center gap-4">
                <div>{previewImg ? <img src={previewImg} alt="preview" className="w-20 h-20 rounded-2xl object-cover border border-white/10" /> : <span className="grid place-items-center w-20 h-20 rounded-2xl bg-white/5 text-white/25"><ImageIcon size={26} /></span>}</div>
                <div><p className="font-display font-bold text-2xl">{modal === "new" ? "Add product" : `Edit ${form.sku}`}</p><p className="text-[13px] text-white/45">Live preview on the left. Image picker below.</p></div>
                <button onClick={() => setModal(null)} className="ml-auto p-2 border border-white/10 rounded-lg"><X size={16} /></button>
              </div>

              <p className={`${lab} mt-5 mb-1.5`}>IMAGE</p>
              <div className="rounded-2xl border border-white/10 p-4 grid sm:grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm">
                  <span className="text-[12px] font-bold text-white/50">Photo library (verified)</span>
                  <select value={form.preset} disabled={form.useCustom} onChange={(e) => setForm({ ...form, preset: e.target.value })} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none disabled:opacity-40">{PRESETS.map(([l, id]) => <option key={id} value={id}>{l}</option>)}</select>
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="text-[12px] font-bold text-white/50">Or on-site white-background shot</span>
                  <select value={Object.values(IMG_OVERRIDES).includes(form.image) ? form.image : ""} onChange={(e) => setForm({ ...form, image: e.target.value, useCustom: true })} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none">
                    <option value="">Pick from local library ({Object.keys(IMG_OVERRIDES).length} lines)</option>
                    {Object.entries(IMG_OVERRIDES).map(([sku, path]) => {
                      const nm = products.find((p) => p.sku === sku)?.name || sku;
                      return <option key={sku} value={path}>{sku} - {nm.slice(0, 42)}</option>;
                    })}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="text-[12px] font-bold text-white/50">Or custom image URL</span>
                  <input value={form.useCustom && !Object.values(IMG_OVERRIDES).includes(form.image) ? form.image : ""} onChange={(e) => setForm({ ...form, image: e.target.value, useCustom: true })} placeholder="https://..." className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none" />
                </label>
                <label className="sm:col-span-2 flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={form.useCustom} onChange={(e) => setForm({ ...form, useCustom: e.target.checked })} className="w-4 h-4 accent-[#ff4d00]" /> Use custom URL instead of library photo
                  {form.useCustom && form.image === "" && <button type="button" onClick={() => setForm({ ...form, useCustom: false })} className="text-[12px] underline text-white/50">back to library</button>}
                </label>
              </div>

              <p className={`${lab} mt-5 mb-1.5`}>BASICS</p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} disabled={modal === "edit"} placeholder="SKU, e.g. AX-NEW-100" className={inp} />
                <label className="grid gap-1"><span className="text-[12px] font-bold text-white/50">Brand (live list)</span>
                  <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none">{brandOptions.map((b) => <option key={b}>{b}</option>)}</select>
                </label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className={`${inp} sm:col-span-2`} />
                <input value={form.fit} onChange={(e) => setForm({ ...form, fit: e.target.value })} placeholder="Fitment line, e.g. Suits Volvo FH" className={`${inp} sm:col-span-2`} />
                <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Short description" className={`${inp} sm:col-span-2`} />
              </div>

              <p className={`${lab} mt-5 mb-1.5`}>CLASSIFICATION</p>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <label className="grid gap-1"><span className="text-[12px] font-bold text-white/50">Category (live)</span>
                  <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none">{liveCategories.map((c) => <option key={c.name}>{c.name}</option>)}</select>
                </label>
                <label className="grid gap-1"><span className="text-[12px] font-bold text-white/50">Badge</span>
                  <select value={BADGES.includes(form.badge) ? form.badge : "Custom"} onChange={(e) => setForm({ ...form, badge: e.target.value === "Custom" ? "" : e.target.value })} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none">{[...BADGES, "Custom"].map((b) => <option key={b}>{b}</option>)}</select>
                </label>
                {!BADGES.includes(form.badge) && <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Custom badge" className={inp} />}
                <label className="grid gap-1"><span className="text-[12px] font-bold text-white/50">Stock status</span>
                  <select value={STOCKS.includes(form.stock) ? form.stock : STOCKS[0]} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-xl px-4 py-3 bg-black/40 border border-white/10 outline-none">{STOCKS.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
                <input value={form.oem} onChange={(e) => setForm({ ...form, oem: e.target.value })} placeholder="OEM cross" className={inp} />
                <label className="grid gap-1"><span className="text-[12px] font-bold text-white/50">Rating (1 to 5)</span>
                  <input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} type="number" min={1} max={5} step={0.1} className={inp} />
                </label>
                <label className="grid gap-1"><span className="text-[12px] font-bold text-white/50">Reviews</span>
                  <input value={form.reviews} onChange={(e) => setForm({ ...form, reviews: e.target.value })} type="number" min={0} className={inp} />
                </label>
              </div>

              <p className={`${lab} mt-5 mb-1.5`}>PRICING</p>
              <div className="rounded-2xl border border-white/10 p-4 grid sm:grid-cols-2 gap-3 text-sm">
                <label className="grid gap-1"><span className="text-[12px] font-bold text-white/50">Price (AUD)</span>
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" min={0} step={0.01} className={inp} />
                </label>
                <div className="grid gap-1">
                  <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer pt-6">
                    <input type="checkbox" checked={form.onSale} onChange={(e) => setForm({ ...form, onSale: e.target.checked })} className="w-4 h-4 accent-[#ff4d00]" /> On sale (shows was price plus Deals entry)
                  </label>
                </div>
                {form.onSale && (
                  <label className="grid gap-1"><span className="text-[12px] font-bold text-white/50">Was price (AUD)</span>
                    <input value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} type="number" min={0} step={0.01} className={inp} />
                  </label>
                )}
              </div>

              <p className={`${lab} mt-5 mb-1.5`}>SPECS (COMMA SEPARATED)</p>
              <input value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} placeholder="27mm steel, 200L plus 200R" className={`${inp}`} />
              {err && <p className="mt-3 text-[13px] text-red-400 font-semibold">{err}</p>}
              <button onClick={save} className="mt-4 w-full bg-[#ff4d00] rounded-2xl py-3.5 text-sm font-black hover:bg-white hover:text-black transition">{modal === "new" ? "Add to catalogue" : "Save changes"}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
