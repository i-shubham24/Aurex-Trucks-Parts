import { useState, useEffect, useMemo } from "react";
import {
  Phone,
  Mail,
  Copy,
  Check,
  Building2,
  User,
  Truck,
  Wrench,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Clock,
  Sparkles,
  X,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { useSite } from "../../store/site";
import { AdminTitle, Empty } from "./AdminLayout";
import { api, API_ON } from "../../lib/api";
import { useNotification } from "../../store/notification";
import SafeImage from "../../components/SafeImage";
import { imgFor } from "../../data/images";

const ENQ_STATUSES = ["New", "Replied", "Quoted", "Closed"];

const extractSku = (e) => {
  if (!e) return null;
  if (e.sku) return e.sku;
  if (e.partDetails?.sku) return e.partDetails.sku;
  if (e.partDetails?.product?.sku) return e.partDetails.product.sku;
  if (e.tailLiftDetails?.sku) return e.tailLiftDetails.sku;
  const text = `${e.topic || ""} ${e.message || ""}`;
  const match = text.match(/ATP-[A-Z0-9-]+/i);
  return match ? match[0].toUpperCase() : null;
};

const getProductImage = (e) => {
  if (!e) return null;
  const explicit =
    e.partDetails?.product?.images?.[0]?.url ||
    e.partDetails?.product?.imageUrl ||
    e.attachments?.[0]?.url;
  if (explicit) return explicit;
  const sku = extractSku(e);
  return sku ? imgFor(sku) : null;
};

export default function Enquiries() {
  const { enquiries: siteEnquiries, setEnquiryStatus: updateSiteEnquiry } = useSite();
  const { notify } = useNotification();
  const [list, setList] = useState(siteEnquiries);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, TAIL_LIFT, GENERAL
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, New, Replied, Quoted, Closed
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const modalProductImg = selectedEnquiry ? getProductImage(selectedEnquiry) : null;
  const selectedEnquirySku = selectedEnquiry ? extractSku(selectedEnquiry) : null;

  const fetchEnquiries = () => {
    if (API_ON) {
      setLoading(true);
      api.get("/enquiries")
        .then((res) => {
          const items = res?.items || res?.data?.items || [];
          if (Array.isArray(items)) {
            setList(items.map((e) => ({ ...e, id: e.ref || e.id || e.enquiryNumber, at: e.createdAt })));
          }
        })
        .catch((err) => {
          console.error("Failed to load enquiries:", err);
        })
        .finally(() => setLoading(false));
    } else {
      setList(siteEnquiries);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [siteEnquiries]);

  const setStatus = (id, s) => {
    setList((l) => l.map((x) => (x.id === id ? { ...x, status: s } : x)));
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => ({ ...prev, status: s }));
    }
    if (API_ON) {
      api.patch(`/enquiries/${id}/status`, { status: s })
        .then(() => {
          notify.success({
            title: "Status Updated",
            message: `Enquiry #${id} marked as "${s}".`,
          });
        })
        .catch(() => {});
    }
    updateSiteEnquiry(id, s);
  };

  const copyContact = (e) => {
    const text = `Customer: ${e.name}\nCompany: ${e.companyName || "N/A"}\nPhone: ${e.phone}\nEmail: ${e.email}\nRef: ${e.id}`;
    navigator.clipboard.writeText(text);
    setCopiedId(e.id);
    setTimeout(() => setCopiedId(null), 2500);
    notify.success({
      title: "Contact Copied",
      message: `Contact details for ${e.name} copied to clipboard.`,
    });
  };

  // Counts
  const tlCount = useMemo(
    () => list.filter((e) => e.enquiryType === "TAIL_LIFT" || (e.sku && /^ATP-TL/i.test(e.sku)) || /tail\s*lift/i.test(e.topic || "")).length,
    [list]
  );
  const genCount = list.length - tlCount;

  // Filtered List
  const filteredList = useMemo(() => {
    return list.filter((e) => {
      const isTL = e.enquiryType === "TAIL_LIFT" || (e.sku && /^ATP-TL/i.test(e.sku)) || /tail\s*lift/i.test(e.topic || "");

      if (activeTab === "TAIL_LIFT" && !isTL) return false;
      if (activeTab === "GENERAL" && isTL) return false;

      if (statusFilter !== "ALL" && (e.status || "New") !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tl = e.tailLiftDetails || {};
        const tk = e.truckDetails || {};
        const user = e.user || {};
        const match =
          (e.id || "").toLowerCase().includes(q) ||
          (e.name || "").toLowerCase().includes(q) ||
          (e.customerName || "").toLowerCase().includes(q) ||
          (e.email || "").toLowerCase().includes(q) ||
          (e.phone || "").toLowerCase().includes(q) ||
          (e.companyName || "").toLowerCase().includes(q) ||
          (e.sku || "").toLowerCase().includes(q) ||
          (e.topic || "").toLowerCase().includes(q) ||
          (tl.vehicleMakeModel || tk.makeModel || "").toLowerCase().includes(q) ||
          (user.firstName || "").toLowerCase().includes(q) ||
          (user.lastName || "").toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [list, activeTab, statusFilter, searchQuery]);

  return (
    <div>
      {/* Title & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminTitle
          kicker="Sales & Quotations"
          title={`Enquiries (${list.length})`}
        />
        <div className="flex rounded-lg border border-line bg-mist p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`rounded-md px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === "ALL" ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"
            }`}
          >
            All ({list.length})
          </button>
          <button
            onClick={() => setActiveTab("TAIL_LIFT")}
            className={`rounded-md px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === "TAIL_LIFT" ? "bg-navy text-white shadow-sm" : "text-steel hover:text-navy"
            }`}
          >
            🚛 Tail Lift Quotes ({tlCount})
          </button>
          <button
            onClick={() => setActiveTab("GENERAL")}
            className={`rounded-md px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === "GENERAL" ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"
            }`}
          >
            ✉️ General ({genCount})
          </button>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-3 shadow-xs">
        <div className="relative min-w-[240px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, email, company, ref ID or vehicle..."
            className="h-9 w-full rounded-md border border-line bg-mist/40 pl-9 pr-3 text-xs font-medium outline-none transition-colors focus:border-navy focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-steel">Status:</span>
          {["ALL", ...ENQ_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-navy text-white shadow-xs"
                  : "border border-line bg-mist/60 text-steel hover:border-ink hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main List: Small / Compact Rows with Main Line */}
      {loading && list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-white p-12 text-center">
          <p className="text-sm font-bold text-steel">Loading customer enquiries…</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="mt-4">
          <Empty
            text={
              list.length === 0
                ? "No enquiries received yet. Storefront contact and tail-lift quote forms will populate this feed."
                : "No enquiries match your search query and filters."
            }
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filteredList.map((e) => {
            const isTL = e.enquiryType === "TAIL_LIFT" || (e.sku && /^ATP-TL/i.test(e.sku)) || /tail\s*lift/i.test(e.topic || "");
            const tl = e.tailLiftDetails || {};
            const tk = e.truckDetails || {};
            const user = e.user;
            const customerName = e.name || e.customerName || (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Customer");
            const customerPhone = e.phone || user?.phone || "";
            const customerEmail = e.email || user?.email || "";
            const customerCompany = e.companyName || user?.companyName || "";
            const vehicleInfo = tl.vehicleMakeModel || tk.makeModel || "";
            const productImg = getProductImage(e);

            return (
              <div
                key={e.id}
                onClick={() => setSelectedEnquiry(e)}
                className={`group flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 bg-white px-3.5 py-2.5 shadow-xs transition-all hover:border-navy hover:bg-blue-50/30 hover:shadow-sm cursor-pointer ${
                  isTL ? "border-navy/40" : "border-line"
                }`}
              >
                {/* Main Line Content */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Product Image Thumbnail */}
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-line bg-mist shadow-2xs">
                    <SafeImage
                      src={productImg}
                      alt={e.topic || e.sku || "Product"}
                      className="h-full w-full object-cover"
                      fallbackIconSize={16}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                    {/* Reference ID */}
                    <span className="font-mono text-xs font-black text-navy shrink-0">
                      {e.id}
                    </span>

                    {/* Type Badge */}
                    {isTL ? (
                      <span className="rounded bg-navy px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider shrink-0">
                        Tail Lift
                      </span>
                    ) : (
                      <span className="rounded bg-mist border border-line px-2 py-0.5 text-[10px] font-bold uppercase text-steel shrink-0">
                        General
                      </span>
                    )}

                  {/* Customer Name & Company */}
                  <span className="font-bold text-sm text-ink truncate">
                    {customerName}
                  </span>
                  {customerCompany && (
                    <span className="text-xs font-medium text-steel truncate max-w-[150px]">
                      ({customerCompany})
                    </span>
                  )}

                  {/* Registered Account Indicator */}
                  {user && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-extrabold uppercase shrink-0">
                      ✓ User
                    </span>
                  )}

                  {user?.isTradeApproved && (
                    <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-extrabold uppercase shrink-0">
                      ★ Trade
                    </span>
                  )}

                  {/* Separator */}
                  <span className="text-line-dark hidden sm:inline">|</span>

                  {/* Phone */}
                  {customerPhone && (
                    <span className="text-xs font-semibold text-navy shrink-0 hidden sm:inline">
                      📞 {customerPhone}
                    </span>
                  )}

                  {/* Email */}
                  {customerEmail && (
                    <span className="text-xs text-steel truncate max-w-[180px] hidden md:inline">
                      ✉️ {customerEmail}
                    </span>
                  )}

                  {/* Vehicle or Topic Tag */}
                  {(vehicleInfo || e.sku) && (
                    <span className="rounded bg-mist px-2 py-0.5 text-[11px] font-medium text-ink truncate max-w-[200px] hidden lg:inline border border-line">
                      🚛 {vehicleInfo || e.sku}
                    </span>
                  )}
                </div>
              </div>

                {/* Right Side: Status Badge, Date, and View Button */}
                <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
                  {/* Status Pill */}
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase shrink-0 ${
                      e.status === "New"
                        ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                        : e.status === "Replied"
                        ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                        : e.status === "Quoted"
                        ? "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
                        : "bg-gray-100 text-gray-700 ring-1 ring-gray-300"
                    }`}
                  >
                    ● {e.status || "New"}
                  </span>

                  {/* Date */}
                  <span className="font-mono text-[11px] text-faint hidden sm:inline">
                    {e.at ? new Date(e.at).toLocaleDateString("en-AU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>

                  {/* View Details CTA */}
                  <span className="inline-flex items-center gap-1 rounded border border-line-dark bg-white px-2.5 py-1 text-xs font-bold text-steel group-hover:border-navy group-hover:bg-navy group-hover:text-white transition-colors">
                    <span>Details</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING MODAL WITH FULL DETAILS OF USER WHO PUT ENQUIRY */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-auto p-4 sm:p-6 animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedEnquiry(null)}
          />

          {/* Modal Container */}
          <div className="relative my-8 w-full max-w-3xl rounded-2xl border border-line-dark bg-white shadow-2xl overflow-hidden z-10">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-navy to-[#082855] px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black tracking-wider text-gold">
                  {selectedEnquiry.id}
                </span>
                {selectedEnquiry.enquiryType === "TAIL_LIFT" || (selectedEnquiry.sku && /^ATP-TL/i.test(selectedEnquiry.sku)) ? (
                  <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    Tail Lift Specification
                  </span>
                ) : (
                  <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    General Parts Enquiry
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-300">
                  {selectedEnquiry.at ? new Date(selectedEnquiry.at).toLocaleString("en-AU") : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="rounded-lg p-1 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-[78vh] overflow-y-auto p-6 space-y-5">
              {/* 1. USER & CONTACT DETAILS (HERO CARD) */}
              <div className="rounded-xl border border-navy/20 bg-gradient-to-br from-blue-50/80 via-slate-50 to-white p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-faint">
                      Customer Profile & Identity
                    </span>
                    <h2 className="mt-0.5 text-xl font-black text-ink">
                      {selectedEnquiry.name || selectedEnquiry.customerName || "Customer"}
                    </h2>
                    {selectedEnquiry.companyName && (
                      <p className="flex items-center gap-1.5 text-xs font-bold text-navy mt-0.5">
                        <Building2 size={13} /> {selectedEnquiry.companyName}
                      </p>
                    )}

                    {/* Account Status Badges */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {selectedEnquiry.user ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                          <ShieldCheck size={12} /> Registered Aurex Account
                        </span>
                      ) : (
                        <span className="rounded bg-mist border border-line px-2 py-0.5 text-[10px] font-bold uppercase text-steel">
                          Guest Submission
                        </span>
                      )}

                      {selectedEnquiry.user?.isTradeApproved && (
                        <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-ink shadow-xs">
                          ★ Trade Approved Account
                        </span>
                      )}

                      {selectedEnquiry.user?.role && selectedEnquiry.user.role !== "CUSTOMER" && (
                        <span className="rounded bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy">
                          Role: {selectedEnquiry.user.role}
                        </span>
                      )}

                      {selectedEnquiry.state && (
                        <span className="rounded bg-white border border-line px-2 py-0.5 text-[10px] font-bold text-steel">
                          📍 {selectedEnquiry.state}
                        </span>
                      )}

                      {selectedEnquiry.preferredContact && (
                        <span className="rounded bg-white border border-line px-2 py-0.5 text-[10px] font-bold text-steel">
                          💬 Prefers {selectedEnquiry.preferredContact}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Contact Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {selectedEnquiry.phone && (
                      <a
                        href={`tel:${selectedEnquiry.phone.replace(/[\s()-]/g, "")}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-gold hover:text-ink cursor-pointer"
                      >
                        <Phone size={14} />
                        <span>Call: {selectedEnquiry.phone}</span>
                      </a>
                    )}

                    {selectedEnquiry.email && (
                      <a
                        href={`mailto:${selectedEnquiry.email}?subject=Aurex Truck Parts - Regarding Enquiry ${selectedEnquiry.id}&body=Hi ${selectedEnquiry.name || "Customer"},%0D%0A%0D%0AThank you for reaching out to Aurex Truck Parts regarding ${encodeURIComponent(selectedEnquiry.topic || selectedEnquiry.sku || "your quote request")}.%0D%0A%0D%0A`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-navy/30 bg-white px-4 py-2.5 text-xs font-extrabold text-navy shadow-sm transition-all hover:bg-navy hover:text-white cursor-pointer"
                      >
                        <Mail size={14} />
                        <span>Email: {selectedEnquiry.email}</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => copyContact(selectedEnquiry)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line-dark bg-white px-3 py-2 text-xs font-bold text-steel hover:text-ink cursor-pointer"
                      title="Copy customer details"
                    >
                      {copiedId === selectedEnquiry.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedId === selectedEnquiry.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Additional user registration info if available */}
                {selectedEnquiry.user && (
                  <div className="mt-3 pt-3 border-t border-line/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-steel">
                    <div>
                      <span className="text-[10px] font-bold text-faint uppercase block">Account Holder:</span>
                      <span className="font-semibold text-ink">
                        {[selectedEnquiry.user.firstName, selectedEnquiry.user.lastName].filter(Boolean).join(" ") || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-faint uppercase block">Account Email:</span>
                      <span className="font-mono text-ink">{selectedEnquiry.user.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-faint uppercase block">Account Phone:</span>
                      <span className="font-mono text-ink">{selectedEnquiry.user.phone || selectedEnquiry.phone || "—"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. PRODUCT VISUAL PREVIEW & IDENTIFICATION */}
              <div className="rounded-xl border border-line bg-white p-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Product Image */}
                  <div className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-xl border border-line bg-mist shadow-xs flex items-center justify-center">
                    <SafeImage
                      src={modalProductImg}
                      alt={selectedEnquiry.topic || selectedEnquiry.sku || "Product"}
                      className="h-full w-full object-cover"
                      fallbackIconSize={32}
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {selectedEnquirySku && (
                        <span className="rounded bg-navy text-white px-2.5 py-0.5 font-mono text-xs font-black">
                          SKU: {selectedEnquirySku}
                        </span>
                      )}
                      <span className="rounded bg-mist border border-line px-2 py-0.5 text-[10px] font-bold uppercase text-steel">
                        {selectedEnquiry.enquiryType === "TAIL_LIFT" || (selectedEnquirySku && /^ATP-TL/i.test(selectedEnquirySku))
                          ? "Commercial Tail Lift System"
                          : "Heavy Vehicle Component"}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-base sm:text-lg font-black text-ink leading-snug">
                      {selectedEnquiry.tailLiftDetails?.selectedModel ||
                        selectedEnquiry.partDetails?.partName ||
                        selectedEnquiry.topic ||
                        "Equipment System"}
                    </h3>

                    <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                      {selectedEnquiry.tailLiftDetails?.liftCapacity && (
                        <span className="rounded bg-mist px-2.5 py-1 font-semibold text-ink border border-line">
                          ⚖️ Capacity: <strong>{selectedEnquiry.tailLiftDetails.liftCapacity}</strong>
                        </span>
                      )}
                      {selectedEnquiry.tailLiftDetails?.platformMaterial && (
                        <span className="rounded bg-mist px-2.5 py-1 font-semibold text-ink border border-line">
                          🛡️ Platform: <strong>{selectedEnquiry.tailLiftDetails.platformMaterial}</strong>
                        </span>
                      )}
                      {selectedEnquiry.tailLiftDetails?.voltage && (
                        <span className="rounded bg-mist px-2.5 py-1 font-semibold text-navy border border-line">
                          ⚡ Voltage: <strong>{selectedEnquiry.tailLiftDetails.voltage}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. TECHNICAL SPECIFICATIONS SECTION */}
              {selectedEnquiry.tailLiftDetails ? (
                <div className="rounded-xl border border-line bg-mist/50 p-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-navy">
                      <Truck size={14} className="text-primary" /> Tail Lift Technical Specification
                    </span>
                    {selectedEnquiry.sku && (
                      <span className="rounded bg-white border border-line px-2 py-0.5 font-mono text-xs font-bold text-steel">
                        SKU: {selectedEnquiry.sku}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="rounded-lg bg-white p-3 border border-line">
                      <span className="text-[10px] font-bold text-faint uppercase block">Selected Model</span>
                      <span className="font-bold text-ink">
                        {selectedEnquiry.tailLiftDetails.selectedModel || selectedEnquiry.topic || "Tail Lift"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-line">
                      <span className="text-[10px] font-bold text-faint uppercase block">Vehicle Make & Model</span>
                      <span className="font-extrabold text-ink">
                        {selectedEnquiry.tailLiftDetails.vehicleMakeModel || selectedEnquiry.truckDetails?.makeModel || "Not specified"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-line">
                      <span className="text-[10px] font-bold text-faint uppercase block">Body Type</span>
                      <span className="font-bold text-ink">
                        {selectedEnquiry.tailLiftDetails.bodyType || "Pantech / Dry Freight Box"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-line">
                      <span className="text-[10px] font-bold text-faint uppercase block">Operating Voltage</span>
                      <span className="font-extrabold text-navy">
                        {selectedEnquiry.tailLiftDetails.voltage || "24V DC"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-line">
                      <span className="text-[10px] font-bold text-faint uppercase block">Lifting Capacity</span>
                      <span className="font-extrabold text-navy">
                        {selectedEnquiry.tailLiftDetails.liftCapacity || "2000 kg"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-line">
                      <span className="text-[10px] font-bold text-faint uppercase block">Platform Material</span>
                      <span className="font-bold text-ink">
                        {selectedEnquiry.tailLiftDetails.platformMaterial || "Aluminium"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-line">
                      <span className="text-[10px] font-bold text-faint uppercase block">Bed Height / Width</span>
                      <span className="font-bold text-ink">
                        {selectedEnquiry.tailLiftDetails.bedHeight || "Standard Bed"} · {selectedEnquiry.tailLiftDetails.bodyWidth || "2450 mm"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-line sm:col-span-2">
                      <span className="text-[10px] font-bold text-faint uppercase block">Service / Supply Scope</span>
                      <span className="font-extrabold text-ink">
                        {selectedEnquiry.tailLiftDetails.serviceType || "Supply Only (Freighted to Workshop)"}
                      </span>
                    </div>
                  </div>

                  {/* Addon Options */}
                  {selectedEnquiry.tailLiftDetails.options &&
                    typeof selectedEnquiry.tailLiftDetails.options === "object" &&
                    Object.values(selectedEnquiry.tailLiftDetails.options).some(Boolean) && (
                      <div className="mt-3 pt-3 border-t border-line">
                        <span className="text-[10px] font-bold text-faint uppercase block mb-1.5">
                          Selected Hardware & Safety Addons:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEnquiry.tailLiftDetails.options.footControls && (
                            <span className="rounded bg-navy/10 px-2.5 py-1 text-xs font-bold text-navy">
                              Dual Platform Foot Controls
                            </span>
                          )}
                          {selectedEnquiry.tailLiftDetails.options.rollStops && (
                            <span className="rounded bg-navy/10 px-2.5 py-1 text-xs font-bold text-navy">
                              Roll-Stop Cart Barriers
                            </span>
                          )}
                          {selectedEnquiry.tailLiftDetails.options.flashingLights && (
                            <span className="rounded bg-navy/10 px-2.5 py-1 text-xs font-bold text-navy">
                              Corner Flashing LED Safety Lights
                            </span>
                          )}
                          {selectedEnquiry.tailLiftDetails.options.remotePendant && (
                            <span className="rounded bg-navy/10 px-2.5 py-1 text-xs font-bold text-navy">
                              Handheld Remote Pendant
                            </span>
                          )}
                          {selectedEnquiry.tailLiftDetails.options.bumperBar && (
                            <span className="rounded bg-navy/10 px-2.5 py-1 text-xs font-bold text-navy">
                              Rear Underrun Bumper Bar
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-mist/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-faint uppercase block">Enquiry Topic</span>
                      <span className="font-extrabold text-navy text-sm">
                        {selectedEnquiry.topic || "General Enquiry"}
                      </span>
                    </div>
                    {selectedEnquiry.sku && (
                      <span className="rounded bg-white border border-line px-2.5 py-1 font-mono text-xs font-bold text-steel">
                        SKU: {selectedEnquiry.sku}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 3. MESSAGE & VIN DIRECTIVES */}
              {selectedEnquiry.message && (
                <div>
                  <span className="text-[10px] font-bold text-faint uppercase block mb-1">
                    Customer Message & Directives
                  </span>
                  <div className="rounded-xl border border-line bg-white p-4 font-mono text-xs text-ink leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                    {selectedEnquiry.message}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer: Status Updater & Close */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-mist/60 px-6 py-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-steel mr-1">Status:</span>
                {ENQ_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(selectedEnquiry.id, s)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      selectedEnquiry.status === s
                        ? "border-navy bg-navy text-white shadow-xs"
                        : "border-line bg-white text-steel hover:border-navy hover:text-navy"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-lg border border-line-dark bg-white px-4 py-2 text-xs font-bold text-steel hover:bg-mist cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
