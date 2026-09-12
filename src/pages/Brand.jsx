import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BRANDS } from "../data/catalog.js";
import { ProductCard, Reveal } from "../components/ui.jsx";
import { useProducts } from "../store/products.jsx";

const MODELS = {
  VOLVO: ["FH 2014 on", "FH 2021 on", "FM 2014 on", "FMX"],
  SCANIA: ["R450 plus R500", "R 2017 on", "P Series", "G Series"],
  KENWORTH: ["T610", "T909", "K200", "T360"],
  MACK: ["Anthem MP8", "Granite", "Trident"],
  HINO: ["500 GH", "500 FM", "300 Series"],
  ISUZU: ["FSR plus FTR", "F Series 6HK1", "N Series"],
  FUSO: ["Canter 4P10", "Fighter", "HD"],
  "UD TRUCKS": ["Quon GH8", "Croner"],
  BPW: ["Trailer axles 10 stud", "Air suspension"],
  "SAF HOLLAND": ["Fifth wheels", "Trailer axles"],
  NARVA: ["24V lighting range", "Wiring plus beacons"],
  DONALDSON: ["Filtration range", "Air plus lube"],
  KYB: ["Truck shocks range"],
  KOYO: ["Bearings range"],
  WABCO: ["Air brake range"],
  BENDIX: ["Brake friction range"],
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
          {models.map((m) => <Link key={m} to={`/shop?cat=All`} className="rounded-xl bg-white border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-bold hover:border-[#E53E00] transition">{m}</Link>)}
        </div>
        <h2 className="font-display font-bold text-2xl text-[#1A1A2E] mt-8">All {label} lines ({lines.length})</h2>
        {lines.length === 0
          ? <p className="mt-3 text-sm text-[#6B7280]">No lines under this badge yet. <Link to="/shop" className="text-[#E53E00] font-bold">Browse the full shop →</Link></p>
          : <div className="mt-5 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">{lines.map((p, i) => <ProductCard key={p.sku} p={p} index={i} />)}</div>}
        <Link to="/brands" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#1A1A2E] hover:text-[#E53E00]">← All brands <ArrowRight size={14} className="rotate-180" /></Link>
      </div>
    </div>
  );
}
