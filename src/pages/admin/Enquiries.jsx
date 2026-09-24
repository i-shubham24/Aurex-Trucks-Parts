import { useSite } from "../../store/site";
import { AdminTitle, Empty } from "./AdminLayout";

const ENQ = ["New", "Replied", "Closed"];

export default function Enquiries() {
  const { enquiries, setEnquiryStatus } = useSite();
  return (
    <div>
      <AdminTitle kicker="Sales" title={`Enquiries (${enquiries.length})`} />
      {enquiries.length === 0 ? <Empty text="No enquiries yet. The contact form feeds this list." /> : (
        <div className="grid gap-3">
          {enquiries.map((e) => (
            <div key={e.id} className="border-2 border-ink bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-sm font-extrabold">{e.id}</p>
                <span className={`px-2 py-0.5 text-[11px] font-bold ${e.status === "New" ? "bg-gold/25 text-ink" : e.status === "Replied" ? "bg-green-100 text-green-800" : "bg-mist text-faint"}`}>{e.status}</span>
                <span className="ml-auto font-mono text-[11px] text-faint">{e.at ? new Date(e.at).toLocaleString("en-AU") : ""}</span>
              </div>
              <p className="mt-2 text-sm"><span className="font-bold">{e.name}</span> <span className="text-steel">· {e.phone} · {e.email} · {e.topic}</span></p>
              <p className="mt-1 text-sm leading-6 text-steel">{e.message}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {ENQ.map((s) => (
                  <button key={s} onClick={() => setEnquiryStatus(e.id, s)}
                    className={`border px-3 py-1.5 text-[12px] font-bold transition-colors ${e.status === s ? "border-navy bg-navy text-white" : "border-line-dark hover:border-navy hover:text-navy"}`}>{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
