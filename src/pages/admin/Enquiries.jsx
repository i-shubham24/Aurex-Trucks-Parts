import { useState, useEffect } from "react";
import { useSite } from "../../store/site";
import { AdminTitle, Empty } from "./AdminLayout";
import { api, API_ON } from "../../lib/api";

const ENQ = ["New", "Replied", "Closed"];

export default function Enquiries() {
  const { enquiries: siteEnquiries, setEnquiryStatus: updateSiteEnquiry } = useSite();
  const [list, setList] = useState(siteEnquiries);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, TAIL_LIFT, GENERAL

  useEffect(() => {
    if (API_ON) {
      setLoading(true);
      api.get("/enquiries")
        .then((res) => {
          const items = res?.items || res?.data?.items || [];
          if (Array.isArray(items)) {
            setList(items.map((e) => ({ ...e, id: e.ref || e.id || e.enquiryNumber, at: e.createdAt })));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setList(siteEnquiries);
    }
  }, [siteEnquiries]);

  const setStatus = (id, s) => {
    setList((l) => l.map((x) => (x.id === id ? { ...x, status: s } : x)));
    if (API_ON) {
      api.patch(`/enquiries/${id}/status`, { status: s }).catch(() => {});
    }
    updateSiteEnquiry(id, s);
  };

  const filteredList = list.filter((e) => {
    const isTL = e.enquiryType === "TAIL_LIFT" || (e.sku && /^ATP-TL/i.test(e.sku)) || /tail\s*lift/i.test(e.topic || "");
    if (activeTab === "TAIL_LIFT") return isTL;
    if (activeTab === "GENERAL") return !isTL;
    return true;
  });

  const tlCount = list.filter((e) => e.enquiryType === "TAIL_LIFT" || (e.sku && /^ATP-TL/i.test(e.sku)) || /tail\s*lift/i.test(e.topic || "")).length;
  const genCount = list.length - tlCount;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminTitle kicker="Sales" title={`Enquiries (${list.length})`} />
        <div className="flex rounded-md border border-line bg-mist p-0.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`rounded px-3 py-1.5 transition-colors ${activeTab === "ALL" ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"}`}
          >
            All ({list.length})
          </button>
          <button
            onClick={() => setActiveTab("TAIL_LIFT")}
            className={`rounded px-3 py-1.5 transition-colors ${activeTab === "TAIL_LIFT" ? "bg-navy text-white shadow-sm" : "text-steel hover:text-navy"}`}
          >
            Tail Lifts ({tlCount})
          </button>
          <button
            onClick={() => setActiveTab("GENERAL")}
            className={`rounded px-3 py-1.5 transition-colors ${activeTab === "GENERAL" ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"}`}
          >
            General ({genCount})
          </button>
        </div>
      </div>

      {loading && list.length === 0 ? (
        <p className="mt-4 text-sm font-semibold text-steel">Loading enquiries…</p>
      ) : filteredList.length === 0 ? (
        <Empty text={list.length === 0 ? "No enquiries yet. The contact and tail-lift enquiry forms feed this list." : "No enquiries match this filter."} />
      ) : (
        <div className="mt-4 grid gap-3">
          {filteredList.map((e) => {
            const isTL = e.enquiryType === "TAIL_LIFT" || (e.sku && /^ATP-TL/i.test(e.sku)) || /tail\s*lift/i.test(e.topic || "");
            const tl = e.tailLiftDetails || {};
            const tk = e.truckDetails || {};

            return (
              <div key={e.id} className={`border-2 bg-white p-4 ${isTL ? "border-navy/60" : "border-ink"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm font-extrabold">{e.id}</p>
                  {isTL && (
                    <span className="rounded bg-navy px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase">
                      Tail Lift Quote
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-[11px] font-bold ${e.status === "New" ? "bg-gold/25 text-ink" : e.status === "Replied" ? "bg-green-100 text-green-800" : "bg-mist text-faint"}`}>
                    {e.status}
                  </span>
                  {e.sku && (
                    <span className="font-mono text-[11px] font-semibold text-steel">
                      SKU: {e.sku}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[11px] text-faint">{e.at ? new Date(e.at).toLocaleString("en-AU") : ""}</span>
                </div>

                <p className="mt-2 text-sm">
                  <span className="font-bold">{e.name}</span>
                  {e.companyName && <span className="font-semibold text-ink"> ({e.companyName})</span>}
                  <span className="text-steel"> · {e.phone} · {e.email} · {e.topic}</span>
                </p>

                {(tl.vehicleMakeModel || tk.makeModel || tl.liftCapacity || tl.serviceType) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {(tl.vehicleMakeModel || tk.makeModel) && (
                      <span className="rounded bg-mist px-2 py-0.5 font-medium text-ink">
                        🚛 Vehicle: <strong>{tl.vehicleMakeModel || tk.makeModel}</strong>
                      </span>
                    )}
                    {tl.liftCapacity && (
                      <span className="rounded bg-mist px-2 py-0.5 font-medium text-ink">
                        ⚖️ Capacity: <strong>{tl.liftCapacity}</strong>
                      </span>
                    )}
                    {tl.voltage && (
                      <span className="rounded bg-mist px-2 py-0.5 font-medium text-ink">
                        ⚡ Voltage: <strong>{tl.voltage}</strong>
                      </span>
                    )}
                    {tl.serviceType && (
                      <span className="rounded bg-mist px-2 py-0.5 font-medium text-ink">
                        🔧 Service: <strong>{tl.serviceType}</strong>
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-2 text-sm leading-6 whitespace-pre-line text-steel">{e.message}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {ENQ.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(e.id, s)}
                      className={`border px-3 py-1.5 text-[12px] font-bold transition-colors ${e.status === s ? "border-navy bg-navy text-white" : "border-line-dark hover:border-navy hover:text-navy"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
