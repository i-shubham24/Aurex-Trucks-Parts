import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { COMPANY } from "../data/company";

const Ctx = createContext(null);
const K = { settings: "aurex_settings_v1", promos: "aurex_promos_v1", enquiries: "aurex_enquiries_v1" };

const DEFAULT_SETTINGS = {
  storeName: "Aurex Truck Parts Australia",
  phone: COMPANY.phone,
  email: COMPANY.email,
  address: COMPANY.address,
  hours: COMPANY.hours,
  freeFreightOver: 500,
  standardFee: 24,
  expressFee: 39,
  abn: "ABN 12 345 678 901",
  announcement: "Free road freight over $500. Order by 2pm for same day dispatch.",
};
const DEFAULT_PROMOS = [
  { code: "WELCOME10", label: "First order", pct: 10, active: true },
  { code: "FLEET5", label: "5 plus units", pct: 5, active: false },
];
const SEED_ENQUIRIES = [
  { id: "ENQ-1001", name: "Mark D.", phone: "0400 111 222", email: "mark@lavertonfleet.com.au", topic: "Trailer Parts", message: "Need door locking gear plus hinges for 6 trailers. Can you confirm left/right?", status: "New", at: new Date(Date.now() - 86400000).toISOString() },
  { id: "ENQ-1002", name: "Sarah K.", phone: "0400 333 444", email: "sarah@brisbanehaul.com.au", topic: "Accessories", message: "Steel toolbox plus paddle latch and lock. Price with freight to Brisbane?", status: "Replied", at: new Date(Date.now() - 86400000 * 3).toISOString() },
];

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(() => read(K.settings, DEFAULT_SETTINGS));
  const [promos, setPromos] = useState(() => read(K.promos, DEFAULT_PROMOS));
  const [enquiries, setEnquiries] = useState(() => read(K.enquiries, SEED_ENQUIRIES));

  useEffect(() => { try { localStorage.setItem(K.settings, JSON.stringify(settings)); } catch { /* noop */ } }, [settings]);
  useEffect(() => { try { localStorage.setItem(K.promos, JSON.stringify(promos)); } catch { /* noop */ } }, [promos]);
  useEffect(() => { try { localStorage.setItem(K.enquiries, JSON.stringify(enquiries)); } catch { /* noop */ } }, [enquiries]);

  const addEnquiry = (e) => {
    const id = "ENQ-" + Math.floor(1000 + Math.random() * 9000);
    setEnquiries((l) => [{ ...e, id, status: "New", at: new Date().toISOString() }, ...l]);
    return id;
  };
  const setEnquiryStatus = (id, status) => setEnquiries((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));

  const value = useMemo(() => ({
    settings, setSettings, promos, setPromos, enquiries, addEnquiry, setEnquiryStatus,
    resetSite: () => { setSettings(DEFAULT_SETTINGS); setPromos(DEFAULT_PROMOS); },
  }), [settings, promos, enquiries]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
export { DEFAULT_SETTINGS };

/* Live company card: admin settings merged over seed defaults. */
export const useCompany = () => {
  const { settings } = useSite();
  return useMemo(() => ({
    name: settings.storeName,
    short: "Aurex",
    phone: settings.phone,
    phoneHref: "tel:" + String(settings.phone || "").replace(/\D/g, ""),
    email: settings.email,
    address: settings.address,
    hours: settings.hours,
  }), [settings]);
};
