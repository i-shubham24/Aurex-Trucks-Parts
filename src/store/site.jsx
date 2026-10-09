import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { COMPANY } from "../data/company";
import { api } from "../lib/api";

const Ctx = createContext(null);

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
  announcement: "",
};
const DEFAULT_PROMOS = []; // promo codes only ever come from the API


/* ─────────────── API-backed provider ───────────────
   Seeded from defaults (no flash), then settings + active promos are pulled
   from the backend. Enquiries submit to the API; the admin enquiry list loads
   when the viewer is an admin. NOTE: in-app admin settings/promo edits persist
   through the dedicated truck-parts-admin app — use that for admin in API mode. */
function ApiSiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [promos, setPromos] = useState(DEFAULT_PROMOS);
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    (async () => {
      try { const { settings } = await api.get("/settings"); if (settings) setSettings((s) => ({ ...s, ...settings })); } catch { /* keep defaults */ }
      try { const { items } = await api.get("/promos/active"); if (items) setPromos(items); } catch { /* keep defaults */ }
    })();
  }, []);

  // Resolves to the reference staff will see for this enquiry. Rejects if it did not reach
  // us, so a form can say so instead of showing a success screen.
  const addEnquiry = async (e) => {
    const res = await api.post("/enquiries", {
      name: e.name, customerName: e.name, companyName: e.companyName || "",
      phone: e.phone || "", email: e.email, topic: e.topic, message: e.message, sku: e.sku || null,
      ...(e.truckDetails ? { truckDetails: e.truckDetails } : {}),
      ...(e.partDetails ? { partDetails: e.partDetails } : {}),
    });
    const enquiry = res?.enquiry || res?.data?.enquiry || {};
    return enquiry.ref || enquiry.enquiryNumber || null;
  };
  const setEnquiryStatus = (id, status) => {
    setEnquiries((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
    api.patch(`/enquiries/${id}/status`, { status }).catch(() => {});
  };

  const value = useMemo(() => ({
    settings, setSettings, promos, setPromos, enquiries, setEnquiries, addEnquiry, setEnquiryStatus,
    resetSite: () => { setSettings(DEFAULT_SETTINGS); setPromos(DEFAULT_PROMOS); },
  }), [settings, promos, enquiries]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function SiteProvider({ children }) {
  return <ApiSiteProvider>{children}</ApiSiteProvider>;
}

export const useSite = () => {
  const ctx = useContext(Ctx);
  if (!ctx && import.meta.env?.DEV) console.error("[site] useSite rendered without SiteProvider.");
  return ctx ?? {
    settings: DEFAULT_SETTINGS, setSettings: () => {}, promos: [], setPromos: () => {},
    enquiries: [], addEnquiry: () => null, setEnquiryStatus: () => {}, resetSite: () => {},
  };
};
export { DEFAULT_SETTINGS };

/* Live company card: admin settings merged over seed defaults. */
export const useCompany = () => {
  const { settings } = useSite();
  return useMemo(() => ({
    name: settings.storeName,
    short: "Aurex",
    phone: settings.phone,
    phoneHref: "tel:" + (String(settings.phone || "").startsWith("+") ? "+" : "") + String(settings.phone || "").replace(/\D/g, ""),
    email: settings.email,
    address: settings.address,
    hours: settings.hours,
  }), [settings]);
};
