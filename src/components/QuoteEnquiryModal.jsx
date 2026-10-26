import { useState } from "react";
import { Mail, Phone, Copy, Check, X, ExternalLink, Send, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useNotification } from "../store/notification";
import { useCompany } from "../store/site";
import api from "../lib/api";

export default function QuoteEnquiryModal({ isOpen, onClose, product }) {
  const { notify } = useNotification();
  const COMPANY = useCompany();
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    name: "",
    emailOrPhone: "",
    company: "",
    qty: 1,
    postcode: "",
    notes: ""
  });

  if (!isOpen || !product) return null;

  const subject = `Quotation Enquiry - ${product.sku} ${product.name}`;
  const emailBody = `Hi Aurex Truck Parts Team,

I would like to request a commercial fleet quotation for:
Part Number: ${product.sku}
Product: ${product.name}
Quantity Required: ${form.qty || 1}
Company Name: ${form.company || "Trade Account / Private Fleet"}
Contact: ${form.name} (${form.emailOrPhone})
Delivery Postcode: ${form.postcode}

Please provide pricing and freight availability.

Thank you!`;

  const mailtoHref = `mailto:info@aurextruckparts.com.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=info@aurextruckparts.com.au&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

  const handleCopyEmail = () => {
    try {
      navigator.clipboard?.writeText("info@aurextruckparts.com.au");
      setCopied(true);
      notify.success({
        kicker: "EMAIL COPIED",
        title: "info@aurextruckparts.com.au",
        message: "Email address copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.emailOrPhone) {
      notify.error({
        title: "Required fields missing",
        message: "Please enter your name and contact phone or email."
      });
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/enquiries", {
        customerName: form.name,
        name: form.name,
        email: form.emailOrPhone.includes("@") ? form.emailOrPhone : "enquiry@aurextruckparts.com.au",
        phone: form.emailOrPhone,
        companyName: form.company,
        sku: product.sku,
        topic: `Quote Request: ${product.sku} - ${product.name}`,
        message: `Quantity: ${form.qty} | Delivery Postcode: ${form.postcode} | Notes: ${form.notes || "Standard quotation request"}`,
        partDetails: {
          sku: product.sku,
          partName: product.name,
          urgency: "HIGH"
        }
      });
      setSubmitted(true);
      notify.success({
        kicker: "QUOTE REQUEST RECEIVED",
        title: "Fast Response Within 4 Hours",
        message: `We will contact you shortly regarding ${product.sku}.`
      });
    } catch (err) {
      // It did not reach us: say so and point at the email / phone options above.
      const msg = err?.message || "We couldn't send your request.";
      setSubmitError(`${msg} Please email or call us instead.`);
      notify.error({
        title: "Quote request not sent",
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg rounded-xl border border-line bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-mist/60 px-5 py-3.5">
          <div className="min-w-0 pr-4">
            <span className="font-mono text-[11px] font-black uppercase tracking-wider text-navy">
              Commercial Fleet Quotation
            </span>
            <h3 className="truncate text-base font-extrabold text-ink">
              {product.sku} — {product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-steel transition-colors hover:bg-mist hover:text-ink"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 max-h-[85dvh] overflow-y-auto space-y-4">
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h4 className="text-lg font-extrabold text-ink">Quotation Request Received!</h4>
              <p className="text-sm text-steel max-w-md mx-auto">
                Thank you for your enquiry regarding <strong className="text-ink">{product.sku}</strong>. Our Campbellfield trade team will review stock and provide formal pricing within 4 business hours.
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-navy px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Contact & Email Actions */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <a
                  href={gmailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/60 px-3.5 py-2.5 text-xs font-bold text-red-800 transition-colors hover:bg-red-100 hover:border-red-300 shadow-xs"
                >
                  <ExternalLink size={14} className="text-red-600" />
                  <span>Open in Gmail Web →</span>
                </a>

                <a
                  href={mailtoHref}
                  className="flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-mist hover:border-steel shadow-xs"
                >
                  <Mail size={14} className="text-navy" />
                  <span>Open Default Email Client</span>
                </a>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-line bg-mist/40 p-3 text-xs">
                <div className="min-w-0 pr-2">
                  <span className="block text-[11px] text-steel">Direct Fleet Enquiry Email:</span>
                  <span className="font-mono font-bold text-ink">info@aurextruckparts.com.au</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 rounded border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-mist"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Instant Online RFQ Submission Form */}
              <form onSubmit={handleSubmit} className="border-t border-line pt-3.5 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-ink">
                  Or Send Quick Online Request:
                </p>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-steel mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded border border-line px-3 py-2 text-xs focus:border-navy focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-steel mb-1">Phone or Email *</label>
                    <input
                      type="text"
                      required
                      placeholder="0412 345 678 or name@fleet.com.au"
                      value={form.emailOrPhone}
                      onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
                      className="w-full rounded border border-line px-3 py-2 text-xs focus:border-navy focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-steel mb-1">Company / Fleet</label>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full rounded border border-line px-3 py-2 text-xs focus:border-navy focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-steel mb-1">Delivery Postcode</label>
                    <input
                      type="text"
                      placeholder="e.g. 3061 VIC"
                      value={form.postcode}
                      onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                      className="w-full rounded border border-line px-3 py-2 text-xs focus:border-navy focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-steel mb-1">Quantity Required</label>
                  <input
                    type="number"
                    min="1"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: parseInt(e.target.value, 10) || 1 })}
                    className="w-28 rounded border border-line px-3 py-1.5 text-xs focus:border-navy focus:outline-hidden"
                  />
                </div>

                {submitError && (
                  <p role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold py-3 text-sm font-extrabold text-ink transition-colors hover:bg-navy hover:text-white shadow-xs disabled:opacity-60"
                >
                  <Send size={15} />
                  <span>{submitting ? "Submitting Request…" : "Submit Quote Request Now →"}</span>
                </button>
              </form>

              {/* Direct Phone Call Footer */}
              <div className="border-t border-line pt-3 flex items-center justify-between text-xs text-steel">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  Melbourne Trade Counter Direct
                </span>
                <a
                  href={COMPANY.phoneHref}
                  className="font-bold text-navy hover:underline flex items-center gap-1"
                >
                  <Phone size={13} />
                  Call {COMPANY.phone}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
