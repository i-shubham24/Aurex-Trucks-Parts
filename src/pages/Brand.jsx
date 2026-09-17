import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BRANDS } from "../data/catalog.js";
import { ProductCard } from "../components/ui.jsx";
import { useProducts } from "../store/products.jsx";

const MODELS = {
  BEAUWAY: ["2T Aluminium lifts", "1.5T Aluminium lift", "3T Steel lift", "12V power units"],
  GANLAND: ["Door locking gear", "Hinges", "Q track / F track", "Locks and handles", "Retainers", "Cargo control", "Steel toolbox"],
  CAIYUAN: ["Paddle latches", "Side door hinges", "Canvas stands", "Iron columns"],
  AUREX: ["Curated house range", "See shop filters for fitment"],
};

export default function BrandPage() {
  const { name } = useParams();
  const label = decodeURIComponent(name || "");
  const upper = label.toUpperCase();
  const known = BRANDS.includes(upper);
  const { products } = useProducts();
  const lines = products.filter((p) => (p.brand || "").toUpperCase() === upper);
  const models = MODELS[upper] || ["See shop filters for fitment"];

  return (
    <div className="bg-[#F7F8FA]">
      <div className="bg-[#1A1A2E] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <p className="text-[12px] font-semibold text-white/40">Home <span className="mx-1">/</span> <Link to="/brands" className="hover:text-white">Brands</Link> <span className="mx-1">/</span> {label}</p>
          <h1 className="font-display font-bold tracking-[-0.02em] text-[36px] sm:text-[52px] mt-2">{known ? label : "Brand"}</h1>
          <p className="text-white/55 text-[15px] mt-2 max-w-xl">{lines.length} lines in stock. Genuine and OE match parts with OEM crosses on every card.</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-[12px] font-black tracking-[0.2em] text-[#6B7280] uppercase">Supported models</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {models.map((m) => <Link key={m} to={`/shop?cat=All`} className="rounded-xl bg-white border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-bold hover:border-[#0B2F5C] transition">{m}</Link>)}
        </div>
        <h2 className="font-display font-bold text-2xl text-[#1A1A2E] mt-8">All {label} lines ({lines.length})</h2>
        {lines.length === 0
          ? <p className="mt-3 text-sm text-[#6B7280]">No lines under this badge yet. <Link to="/shop" className="text-[#0B2F5C] font-bold">Browse the full shop →</Link></p>
          : <div className="mt-5 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">{lines.map((p, i) => <ProductCard key={p.sku} p={p} index={i} />)}</div>}
        <Link to="/brands" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#1A1A2E] hover:text-[#0B2F5C]">← All brands <ArrowRight size={14} className="rotate-180" /></Link>
      </div>
    </div>
  );
}
