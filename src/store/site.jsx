import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { COMPANY } from "../data/company";
import { api } from "../lib/api";
import { getSettingsApi, updateSettingsApi, resetSettingsApi } from "../api/endpoints/settings.api";

const Ctx = createContext(null);

const DEFAULT_SETTINGS = {
  storeName: "Aurex Truck Parts",
  legalName: "Aurex Panels Pty Limited",
  phone: COMPANY.phone,
  email: COMPANY.email,
  address: COMPANY.address,
  hours: COMPANY.hours,
  freeFreightOver: 200,
  standardFee: 45,
  expressFee: 95,
  abn: "47 670 781 254",
  acn: "670 781 254",
  announcement: "",
  showAnnouncement: true,
};
const DEFAULT_PROMOS = []; // promo codes only ever come from the API

const SETTINGS_STORAGE_KEY = "aurex_site_settings";
const SETTINGS_SYNC_CHANNEL = "aurex_settings_channel";

function broadcastSettingsChange(nextSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("aurex:settings-updated", { detail: nextSettings }));
  } catch {}
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel(SETTINGS_SYNC_CHANNEL);
      bc.postMessage({ type: "SETTINGS_UPDATED", settings: nextSettings });
      bc.close();
    }
  } catch {}
}

/* ─────────────── API-backed provider ───────────────
   Seeded from cached settings / defaults, then live settings + active promos are pulled
   from the backend. Updates persist to database and propagate live across the application. */
function ApiSiteProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return cached ? { ...DEFAULT_SETTINGS, ...JSON.parse(cached) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [promos, setPromos] = useState(DEFAULT_PROMOS);
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const live = await getSettingsApi();
        if (live && typeof live === "object") {
          setSettings((prev) => {
            const next = { ...prev, ...live };
            try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next)); } catch {}
            return next;
          });
        }
      } catch {
        /* keep cached / defaults */
      }
      try {
        const { items } = await api.get("/promos/active");
        if (items) setPromos(items);
      } catch {
        /* keep defaults */
      }
    };

    fetchLive();

    const onSettingsUpdated = (e) => {
      if (e.detail) {
        setSettings((prev) => {
          const next = { ...prev, ...e.detail };
          try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
      }
    };
    window.addEventListener("aurex:settings-updated", onSettingsUpdated);

    const onStorage = (e) => {
      if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          setSettings((prev) => ({ ...prev, ...JSON.parse(e.newValue) }));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);

    let bc;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel(SETTINGS_SYNC_CHANNEL);
        bc.onmessage = (e) => {
          if (e.data?.type === "SETTINGS_UPDATED" && e.data?.settings) {
            setSettings((prev) => ({ ...prev, ...e.data.settings }));
          }
        };
      }
    } catch {}

    return () => {
      window.removeEventListener("aurex:settings-updated", onSettingsUpdated);
      window.removeEventListener("storage", onStorage);
      try { bc?.close(); } catch {}
    };
  }, []);

  // Resolves to the reference staff will see for this enquiry. Rejects if it did not reach
  // us, so a form can say so instead of showing a success screen.
  const addEnquiry = async (e) => {
    const isTailLift =
      e.enquiryType === "TAIL_LIFT" ||
      e.isTailLift ||
      (e.sku && /^ATP-TL/i.test(e.sku)) ||
      (e.topic && /tail\s*lift/i.test(e.topic));

    const endpoint = isTailLift ? "/enquiries/tail-lift" : "/enquiries";

    const res = await api.post(endpoint, {
      name: e.name,
      customerName: e.name,
      companyName: e.companyName || e.company || "",
      phone: e.phone || "",
      email: e.email,
      topic: e.topic,
      message: e.message,
      sku: e.sku || null,
      enquiryType: isTailLift ? "TAIL_LIFT" : (e.enquiryType || "GENERAL"),
      state: e.state || "VIC",
      preferredContact: e.preferredContact || "Phone Call",
      vehicleMakeModel: e.vehicleMakeModel || e.truckDetails?.makeModel || "",
      bodyType: e.bodyType || e.truckDetails?.bodyType || "",
      voltage: e.voltage || e.truckDetails?.voltage || "",
      bedHeight: e.bedHeight || e.truckDetails?.bedHeight || "",
      bodyWidth: e.bodyWidth || e.truckDetails?.bodyWidth || "",
      liftCapacity: e.liftCapacity || e.partDetails?.capacity || "",
      platformMaterial: e.platformMaterial || e.partDetails?.material || "",
      platformHeight: e.platformHeight || e.partDetails?.platformHeight || "",
      serviceType: e.serviceType || e.partDetails?.serviceType || "",
      options: e.options || {},
      vinOrNotes: e.vinOrNotes || "",
      ...(e.truckDetails ? { truckDetails: e.truckDetails } : {}),
      ...(e.partDetails ? { partDetails: e.partDetails } : {}),
      ...(e.tailLiftDetails ? { tailLiftDetails: e.tailLiftDetails } : {}),
    });
    const enquiry = res?.enquiry || res?.data?.enquiry || {};
    return enquiry.ref || enquiry.enquiryNumber || res?.ref || res?.enquiryNumber || null;
  };
  const setEnquiryStatus = (id, status) => {
    setEnquiries((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
    api.patch(`/enquiries/${id}/status`, { status }).catch(() => {});
  };

  const updateLiveSettings = async (newFields) => {
    const updated = await updateSettingsApi(newFields);
    const merged = { ...settings, ...newFields, ...(updated || {}) };
    setSettings(merged);
    broadcastSettingsChange(merged);
    return merged;
  };

  const resetLiveSettings = async () => {
    try {
      await resetSettingsApi();
    } catch {}
    setSettings(DEFAULT_SETTINGS);
    broadcastSettingsChange(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  };

  const value = useMemo(() => ({
    settings,
    setSettings,
    updateLiveSettings,
    resetLiveSettings,
    promos,
    setPromos,
    enquiries,
    setEnquiries,
    addEnquiry,
    setEnquiryStatus,
    resetSite: resetLiveSettings,
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
    name: settings.storeName || COMPANY.name,
    legalName: settings.legalName || COMPANY.legalName || "Aurex Panels Pty Limited",
    short: "Aurex",
    abn: settings.abn || COMPANY.abn || "47 670 781 254",
    acn: settings.acn || COMPANY.acn || "670 781 254",
    phone: settings.phone || COMPANY.phone,
    phoneHref: "tel:" + (String(settings.phone || COMPANY.phone || "").startsWith("+") ? "+" : "") + String(settings.phone || COMPANY.phone || "").replace(/\D/g, ""),
    email: settings.email || COMPANY.email,
    address: settings.address || COMPANY.address,
    hours: settings.hours || COMPANY.hours,
  }), [settings]);
};
