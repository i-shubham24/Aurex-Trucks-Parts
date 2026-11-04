import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Copy, Check, ArrowRight, Phone, Mail, Clock, ShoppingBag } from "lucide-react";
import { useCompany } from "../store/site";
import { useNotification } from "../store/notification";

export default function ThankYou() {
  const location = useLocation();
  const state = location.state || {};
  const COMPANY = useCompany();
  const { notify } = useNotification();
  const [copied, setCopied] = useState(false);

  const {
    name = "",
    email = "",
    phone = "",
    topic = "",
    ref = "",
    sku = "",
    type = "general",
  } = state;

  // Push standard form_submission event to dataLayer for GTM / conversion tracking
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "form_submission",
        conversion_type: type === "tail-lift" ? "tail_lift_quote" : "contact_quote",
        enquiry_ref: ref || "",
        enquiry_topic: topic || sku || "General",
        page_location: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }
  }, [type, ref, topic, sku]);

  const copyRef = () => {
    if (!ref) return;
    try {
      navigator.clipboard?.writeText(ref);
      setCopied(true);
      notify.success({
        kicker: "COPIED",
        title: "Reference Number Copied",
        message: ref,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <main className="min-h-[75vh] bg-[#fafafa] py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4">
        {/* Breadcrumb */}
        <p className="text-center text-xs text-faint">
          <Link to="/" className="hover:text-navy hover:underline">Home</Link>
          {" "}/{" "}
          <span className="font-semibold text-ink">Thank You</span>
        </p>

        {/* Hero Card */}
        <div className="mt-6 rounded-2xl border border-line bg-white p-6 text-center shadow-lg sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 sm:h-20 sm:w-20">
            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-tight text-ink sm:text-4xl">
            Thank You! Your Enquiry Has Been Received.
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-steel sm:text-base">
            {name ? `Thanks, ${name.split(" ")[0]}! ` : ""}Our Campbellfield VIC technical & sales desk is reviewing your specifications and will respond with an exact quote within 4 business hours.
          </p>

          {/* Reference Number Badge */}
          {ref && (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-navy/20 bg-navy/5 px-4 py-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-faint">Reference ID:</span>
              <span className="font-mono text-sm font-black text-navy">{ref}</span>
              <button
                type="button"
                onClick={copyRef}
                title="Copy reference number"
                className="ml-1 inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-bold text-steel shadow-sm hover:text-ink cursor-pointer border border-line"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}

          {/* Enquiry Summary Card */}
          {(name || email || topic || sku) && (
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-line bg-mist/70 p-4 text-left text-xs">
              <p className="mb-2 font-mono text-[10px] font-extrabold uppercase tracking-wider text-faint">
                Submission Summary
              </p>
              <div className="space-y-1.5 divide-y divide-line/60">
                {name && (
                  <div className="flex justify-between pt-1.5">
                    <span className="text-faint font-semibold">Contact Name:</span>
                    <span className="font-bold text-ink">{name}</span>
                  </div>
                )}
                {email && (
                  <div className="flex justify-between pt-1.5">
                    <span className="text-faint font-semibold">Email:</span>
                    <span className="font-bold text-ink">{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex justify-between pt-1.5">
                    <span className="text-faint font-semibold">Phone:</span>
                    <span className="font-bold text-ink">{phone}</span>
                  </div>
                )}
                {(topic || sku) && (
                  <div className="flex justify-between pt-1.5">
                    <span className="text-faint font-semibold">Enquiry Subject:</span>
                    <span className="font-bold text-navy">{topic || `SKU ${sku}`}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* What Happens Next Steps */}
          <div className="mt-8 border-t border-line pt-8 text-left">
            <h2 className="text-center font-mono text-xs font-bold uppercase tracking-[0.18em] text-faint">
              What Happens Next
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-navy text-xs font-black text-white">1</span>
                  <span className="text-xs font-extrabold text-ink">Fitment Check</span>
                </div>
                <p className="mt-2 text-xs text-steel">
                  We verify your vehicle make, body dimensions and mounting specs against OEM schematics.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-navy text-xs font-black text-white">2</span>
                  <span className="text-xs font-extrabold text-ink">Exact Quote</span>
                </div>
                <p className="mt-2 text-xs text-steel">
                  An itemised quotation with trade pricing and express freight options will be emailed to you.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-navy text-xs font-black text-white">3</span>
                  <span className="text-xs font-extrabold text-ink">Fast Dispatch</span>
                </div>
                <p className="mt-2 text-xs text-steel">
                  Orders confirmed by 2pm dispatch same-day from Campbellfield VIC to workshops across Australia.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-xs font-black uppercase tracking-wider text-ink transition-colors hover:bg-navy hover:text-white"
            >
              <ShoppingBag size={14} />
              Browse All Parts
            </Link>
            <Link
              to="/tail-lift-enquiry"
              className="inline-flex items-center gap-2 rounded-lg border border-line-dark bg-white px-5 py-3 text-xs font-bold text-ink transition-colors hover:border-gold hover:text-navy"
            >
              Tail Lift Engineering
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg px-4 py-3 text-xs font-bold text-steel transition-colors hover:text-ink"
            >
              Return Home <ArrowRight size={13} />
            </Link>
          </div>

          {/* Immediate Contact Note */}
          <div className="mt-8 border-t border-line/60 pt-6">
            <p className="text-xs text-steel">
              Need immediate technical advice or urgent stock pickup? Call our trade counter:
            </p>
            <a
              href={COMPANY.phoneHref}
              className="mt-1.5 inline-flex items-center gap-2 font-mono text-base font-black text-navy hover:underline"
            >
              <Phone size={15} className="text-gold" />
              {COMPANY.phone}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
