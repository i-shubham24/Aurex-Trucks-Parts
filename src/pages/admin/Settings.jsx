import { useState, useEffect } from "react";
import {
  Building2, Phone, Mail, MapPin, Clock, FileText,
  Megaphone, Truck, DollarSign, Zap, CheckCircle2,
  AlertCircle, RotateCcw, Save, ShieldCheck, Sparkles, ExternalLink,
  Eye, EyeOff
} from "lucide-react";
import { useSite, DEFAULT_SETTINGS } from "../../store/site";
import { useNotification } from "../../store/notification";
import { AdminTitle } from "./AdminLayout";
import { getSettingsApi } from "../../api/endpoints/settings.api";

export default function Settings() {
  const { settings, updateLiveSettings, resetLiveSettings } = useSite();
  const { notify } = useNotification();

  const [form, setForm] = useState(settings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingAnnouncement, setTogglingAnnouncement] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const handleToggleAnnouncement = async () => {
    const nextState = !(form.showAnnouncement !== false);
    setForm((f) => ({ ...f, showAnnouncement: nextState }));
    setSaved(false);
    setErr("");
    setTogglingAnnouncement(true);

    try {
      const payload = {
        ...form,
        showAnnouncement: nextState,
      };
      await updateLiveSettings(payload);
      notify.success({
        kicker: "STOREFRONT BANNER",
        title: nextState ? "Banner Visible on Site" : "Banner Hidden from Site",
        message: nextState
          ? "Top announcement banner is now live across the customer storefront."
          : "Top announcement banner is now completely hidden from the storefront.",
        icon: nextState ? "check" : "eye-off",
        sound: true,
      });
    } catch (e) {
      setForm((f) => ({ ...f, showAnnouncement: !nextState }));
      setErr(e.message || "Failed to update banner visibility on the server.");
      notify.error({
        kicker: "ERROR",
        title: "Could Not Update Banner",
        message: e.message || "Failed to update banner visibility on the server.",
      });
    } finally {
      setTogglingAnnouncement(false);
    }
  };

  // Load latest settings directly from backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const live = await getSettingsApi();
        if (active && live && typeof live === "object") {
          setForm((prev) => ({ ...prev, ...live }));
        }
      } catch (e) {
        console.warn("[Settings] Could not fetch remote settings, using local store:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Keep form in sync if site settings change externally
  useEffect(() => {
    if (!saving) {
      setForm((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleChange = (key, type) => (e) => {
    const val = type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
    setErr("");
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to restore factory default store settings? This will update the live site and database.")) {
      try {
        setSaving(true);
        const defaults = await resetLiveSettings();
        setForm(defaults);
        setSaved(true);
        notify.success({
          kicker: "SETTINGS RESTORED",
          title: "Factory Defaults Restored",
          message: "Store contact info and freight thresholds have been reset.",
          icon: "check",
          sound: true,
        });
      } catch (error) {
        setErr(error.message || "Failed to reset settings.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErr("");
    setSaved(false);

    // Validation
    const cleanEmail = String(form.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErr("Store email address is invalid.");
      return;
    }

    const cleanPhone = String(form.phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 8) {
      setErr("Store phone number looks too short.");
      return;
    }

    if (Number(form.freeFreightOver) < 0 || Number(form.standardFee) < 0 || Number(form.expressFee) < 0) {
      setErr("Freight fees and thresholds must be 0 or greater.");
      return;
    }

    const payload = {
      storeName: String(form.storeName || "").trim(),
      phone: String(form.phone || "").trim(),
      email: cleanEmail,
      address: String(form.address || "").trim(),
      hours: String(form.hours || "").trim(),
      abn: String(form.abn || "").trim(),
      announcement: String(form.announcement || "").trim(),
      showAnnouncement: form.showAnnouncement !== false,
      freeFreightOver: Math.max(0, Number(form.freeFreightOver) || 0),
      standardFee: Math.max(0, Number(form.standardFee) || 0),
      expressFee: Math.max(0, Number(form.expressFee) || 0),
    };

    setSaving(true);
    try {
      await updateLiveSettings(payload);
      setSaved(true);
      notify.success({
        kicker: "SETTINGS UPDATED",
        title: "Settings Saved Successfully!",
        message: "Live storefront, customer checkout, header, footer, and tax invoices updated.",
        icon: "check",
        sound: true,
      });
    } catch (e2) {
      setErr(e2.message || "Failed to update settings on server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminTitle
        kicker="System Configuration"
        title="Store & Freight Settings"
        sub="Manage live commercial contact details, top announcements, and automated freight calculations."
        right={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live DB Synchronized
            </span>
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-line-dark bg-white px-3.5 py-2 text-xs font-bold text-steel transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
            >
              <RotateCcw size={14} /> Reset Defaults
            </button>
          </div>
        }
      />

      {/* Alert Notices */}
      {err && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 animate-in fade-in">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{err}</span>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>Settings saved live to database! All storefront components, invoices, and checkout rates are updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Contact & Business Identity */}
        <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="border-b border-line bg-mist/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-navy" />
              <h2 className="text-base font-extrabold text-ink">Store Contact & Business Identity</h2>
            </div>
            <p className="mt-0.5 text-xs text-steel">
              These details appear in the header, footer, contact page, and formal Australian tax invoices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 md:gap-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink">
                <Building2 size={14} className="text-faint" /> Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.storeName || ""}
                onChange={handleChange("storeName", "text")}
                placeholder="Aurex Truck Parts"
                className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink">
                <Phone size={14} className="text-faint" /> Trade Desk Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.phone || ""}
                onChange={handleChange("phone", "text")}
                placeholder="+61 414 730 467"
                className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink">
                <Mail size={14} className="text-faint" /> Support & Enquiry Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email || ""}
                onChange={handleChange("email", "text")}
                placeholder="info@aurextruckparts.com.au"
                className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink">
                <FileText size={14} className="text-faint" /> Australian Business Number (ABN)
              </label>
              <input
                type="text"
                value={form.abn || ""}
                onChange={handleChange("abn", "text")}
                placeholder="ABN 47 670 781 254"
                className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink">
                <MapPin size={14} className="text-faint" /> Warehouse & Depot Address
              </label>
              <input
                type="text"
                value={form.address || ""}
                onChange={handleChange("address", "text")}
                placeholder="77 Capital Link Drive, Campbellfield VIC 3061"
                className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink">
                <Clock size={14} className="text-faint" /> Trade Counter & Operating Hours
              </label>
              <input
                type="text"
                value={form.hours || ""}
                onChange={handleChange("hours", "text")}
                placeholder="Mon-Fri 7:00 AM - 5:00 PM AEST"
                className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Storefront Top Announcement Banner */}
        <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="border-b border-line bg-mist/60 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-navy" />
                <h2 className="text-base font-extrabold text-ink">Storefront Top Announcement</h2>
              </div>
              <p className="mt-0.5 text-xs text-steel">
                Displays as a prominent top banner across every storefront page to broadcast warehouse notices or promotions.
              </p>
            </div>

            {/* Show / Hide Toggle Button */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-steel">Banner Status:</span>
              <button
                type="button"
                onClick={handleToggleAnnouncement}
                disabled={togglingAnnouncement || saving}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold transition-all cursor-pointer shadow-xs border disabled:opacity-60 ${
                  form.showAnnouncement !== false
                    ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                title="Click to toggle banner visibility immediately on the storefront"
              >
                {togglingAnnouncement ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : form.showAnnouncement !== false ? (
                  <Eye size={15} />
                ) : (
                  <EyeOff size={15} />
                )}
                {form.showAnnouncement !== false ? "Visible (Click to Hide)" : "Hidden (Click to Show)"}
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-ink">
                  Announcement Message
                </label>
                <button
                  type="button"
                  onClick={handleToggleAnnouncement}
                  disabled={togglingAnnouncement || saving}
                  className="text-xs font-bold text-navy hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  {togglingAnnouncement ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                  ) : form.showAnnouncement !== false ? (
                    <>
                      <EyeOff size={13} className="text-steel" /> Hide from site
                    </>
                  ) : (
                    <>
                      <Eye size={13} className="text-emerald-600" /> Show on site
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={form.announcement || ""}
                onChange={handleChange("announcement", "text")}
                placeholder="Campbellfield VIC Warehouse Open - Trade Counters Mon-Fri 7am-5pm | Same-day dispatch Australia-wide"
                className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            {/* Live Storefront Preview */}
            <div className="rounded-xl border border-line bg-mist/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-faint flex items-center gap-1.5">
                  <Sparkles size={13} className="text-gold" /> Live Storefront Banner Preview
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold">
                  {form.showAnnouncement !== false && form.announcement ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live & Visible
                    </span>
                  ) : form.showAnnouncement === false ? (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Hidden by Admin
                    </span>
                  ) : (
                    <span className="text-steel">Hidden (Empty Message)</span>
                  )}
                </span>
              </div>
              {form.showAnnouncement !== false && form.announcement ? (
                <div className="bg-[#001738] border border-gold/30 rounded-lg px-4 py-2.5 text-center text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse shrink-0" />
                  <span className="truncate">{form.announcement}</span>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-line-dark p-3 text-center text-xs text-steel bg-white/70">
                  {form.showAnnouncement === false
                    ? "Banner is currently hidden by admin toggle switch. Click 'Visible (Click to Hide)' or 'Show on site' above to turn it on."
                    : "No announcement banner will be shown to visitors (message is empty)."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Shipping & Freight Rates */}
        <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="border-b border-line bg-mist/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-navy" />
              <h2 className="text-base font-extrabold text-ink">Shipping & Freight Thresholds</h2>
            </div>
            <p className="mt-0.5 text-xs text-steel">
              Automated freight calculations used by the checkout, cart drawer, and product estimate widgets.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 md:gap-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink">
                <Truck size={14} className="text-faint" /> Free Freight Over ($)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-steel">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.freeFreightOver ?? 200}
                  onChange={handleChange("freeFreightOver", "number")}
                  className="h-11 w-full rounded-lg border border-line bg-white pl-8 pr-3.5 text-sm font-bold text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-faint">Orders with goods total above this amount receive free road delivery.</p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink">
                <DollarSign size={14} className="text-faint" /> Standard Road Freight Fee ($)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-steel">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.standardFee ?? 45}
                  onChange={handleChange("standardFee", "number")}
                  className="h-11 w-full rounded-lg border border-line bg-white pl-8 pr-3.5 text-sm font-bold text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-faint">Standard commercial road rate for orders under free freight threshold.</p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink">
                <Zap size={14} className="text-faint" /> Express Courier Fee ($)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-steel">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.expressFee ?? 95}
                  onChange={handleChange("expressFee", "number")}
                  className="h-11 w-full rounded-lg border border-line bg-white pl-8 pr-3.5 text-sm font-bold text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-faint">Priority express air/road courier flat rate.</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-steel">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Changes propagate in real time across customer browsers and database.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-extrabold text-ink transition hover:bg-navy hover:text-white shadow-xs cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
