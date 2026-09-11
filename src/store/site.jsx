import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Disc3, Settings2, Cog, BatteryCharging, Filter, CircleDot, Lightbulb, Anchor, Container, Truck, Bolt, Lock, Wrench } from "lucide-react";
import { CATEGORIES as SEED_CATS } from "../data/catalog.js";

export const ICONS = { Disc3, Settings2, Cog, BatteryCharging, Filter, CircleDot, Lightbulb, Anchor, Container, Truck, Bolt, Lock, Wrench };
export const ICON_OPTIONS = Object.keys(ICONS);

const Ctx = createContext(null);
const K = { settings: "aurex_settings_v1", content: "aurex_content_v1", promos: "aurex_promos_v1", enquiries: "aurex_enquiries_v1", quotes: "aurex_quotes_v1", categories: "aurex_categories_v1" };

const seedCats = () => SEED_CATS.map((c) => ({ name: c.name, count: c.count, blurb: c.blurb, subs: [...(c.subs || [])], icon: Object.keys(ICONS).find((k) => ICONS[k] === c.icon) || "Cog", image: c.image || "" }));

const DEFAULT_SETTINGS = {
  storeName: "Aurex Truck Parts Australia",
  phone: "03 9000 0000",
  email: "sales@aurextruckparts.com.au",
  address: "41 Halley Court, Campbellfield VIC 3061",
  hours: "Mon to Fri 9am to 5pm, Sat 9am to 12pm",
  freeFreightOver: 500,
  standardFee: 24,
  expressFee: 39,
  abn: "ABN 00 000 000 000",
  announcement: "Free shipping over $500 • Dispatch in 1 to 2 days Australia wide",
};
const DEFAULT_CONTENT = {
  heroKicker: "VIN matched catalogue for Aussie fleets",
  heroTitleA: "Built to",
  heroTitleB: "keep rigs",
  heroTitleC: "earning.",
  heroSub: "Heavy truck plus trailer parts with OEM cross, ADR notes and VIC stock. Search once, quote once, fit once.",
  dealTitle: "One quote. Whole truck sorted.",
  dealSub: "Brakes plus filters plus lamps plus fasteners in one cart. Fitment checked before dispatch.",
  promoCode: "AUREX35",
  promoText: "First fleet order gets code AUREX35",
};
const DEFAULT_PROMOS = [
  { code: "AUREX35", label: "First fleet order", pct: 35, active: true },
  { code: "BRAKE10", label: "Brake week", pct: 10, active: true },
  { code: "FLEET5", label: "5 plus units", pct: 5, active: false },
];
const SEED_ENQUIRIES = [
  { id: "ENQ-1001", name: "Mark D.", phone: "0400 111 222", email: "mark@lavertonfleet.com.au", truck: "Kenworth T610 2022", message: "Need backing plates plus bearing kits for 6 trailers. Can you confirm fitment?", status: "New", at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "ENQ-1002", name: "Sarah K.", phone: "0400 333 444", email: "sarah@brisbanehaul.com.au", truck: "Isuzu FTR 2021", message: "Winch plus LED lamp kit for car trailer. Price with freight to Brisbane?", status: "Replied", at: new Date(Date.now() - 86400000 * 3).toISOString() },
];

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(() => read(K.settings, DEFAULT_SETTINGS));
  const [content, setContent] = useState(() => read(K.content, DEFAULT_CONTENT));
  const [promos, setPromos] = useState(() => read(K.promos, DEFAULT_PROMOS));
  const [enquiries, setEnquiries] = useState(() => read(K.enquiries, SEED_ENQUIRIES));
  const [quotes, setQuotes] = useState(() => read(K.quotes, []));
  const [categories, setCategories] = useState(() => {
    const stored = read(K.categories, null);
    const seeds = seedCats();
    if (!stored) return seeds;
    const names = new Set(stored.map((c) => c.name));
    return [...stored, ...seeds.filter((s) => !names.has(s.name))];
  });

  useEffect(() => { try { localStorage.setItem(K.settings, JSON.stringify(settings)); } catch {} }, [settings]);
  useEffect(() => { try { localStorage.setItem(K.content, JSON.stringify(content)); } catch {} }, [content]);
  useEffect(() => { try { localStorage.setItem(K.promos, JSON.stringify(promos)); } catch {} }, [promos]);
  useEffect(() => { try { localStorage.setItem(K.enquiries, JSON.stringify(enquiries)); } catch {} }, [enquiries]);
  useEffect(() => { try { localStorage.setItem(K.quotes, JSON.stringify(quotes)); } catch {} }, [quotes]);
  useEffect(() => { try { localStorage.setItem(K.categories, JSON.stringify(categories)); } catch {} }, [categories]);

  const addEnquiry = (e) => {
    const id = "ENQ-" + Math.floor(1000 + Math.random() * 9000);
    setEnquiries((l) => [{ ...e, id, status: "New", at: new Date().toISOString() }, ...l]);
    return id;
  };
  const setEnquiryStatus = (id, status) => setEnquiries((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
  const addQuote = (q) => {
    const id = "QT-" + Math.floor(1000 + Math.random() * 9000);
    setQuotes((l) => [{ ...q, id, status: "New", at: new Date().toISOString() }, ...l]);
    return id;
  };
  const setQuoteStatus = (id, status) => setQuotes((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
  const liveCategories = useMemo(() => categories.map((c) => ({ ...c, icon: ICONS[c.icon] || Cog })), [categories]);
  const updateCategory = (name, patch) => setCategories((l) => l.map((c) => (c.name === name ? { ...c, ...patch } : c)));
  const addCategory = (c) => {
    if (!c.name.trim() || categories.some((x) => x.name === c.name.trim())) return { ok: false, msg: "Name required and must be unique." };
    setCategories((l) => [...l, { ...c, name: c.name.trim() }]);
    return { ok: true };
  };
  const deleteCategory = (name) => setCategories((l) => l.filter((c) => c.name !== name));
  const resetCategories = () => setCategories(seedCats());

  const value = useMemo(() => ({
    settings, setSettings, content, setContent, promos, setPromos,
    enquiries, addEnquiry, setEnquiryStatus, quotes, addQuote, setQuoteStatus,
    categories, liveCategories, updateCategory, addCategory, deleteCategory, resetCategories,
    resetSite: () => { setSettings(DEFAULT_SETTINGS); setContent(DEFAULT_CONTENT); setPromos(DEFAULT_PROMOS); },
  }), [settings, content, promos, enquiries, quotes, categories]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useSite = () => useContext(Ctx);
export { DEFAULT_SETTINGS, DEFAULT_CONTENT };
