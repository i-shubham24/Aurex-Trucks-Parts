import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send, ArrowRight } from "lucide-react";
import { useCompany } from "../store/site";
import { useSite } from "../store/site";
import { useNotification } from "../store/notification";
import ThemeSelect from "../components/ThemeSelect";

export default function Contact() {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get("topic") || "Tail Lifts";
  const { addEnquiry } = useSite();
  const { notify } = useNotification();
  const COMPANY = useCompany();
  const [sent, setSent] = useState(false);
  const [sentDetails, setSentDetails] = useState({ name: "", email: "", topic: "", ref: "" });
  const [form, setForm] = useState({ name: "", phone: "", email: "", topic: initialTopic, msg: "" });
  const [errs, setErrs] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const input = (bad) => `h-11 w-full rounded-md border bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold ${bad ? "border-red-500" : "border-line-dark"}`;
  const send = (e) => {
    e.preventDefault();
    const fe = {};
    if (form.name.trim().length < 2) fe.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) fe.email = "Enter a valid email address.";
    if (!/^0[45]\d{8}$|^0[2378]\d{8}$|^\+61\d{9}$/.test(form.phone.replace(/[\s()-]/g, ""))) fe.phone = "Enter a 10-digit AU number, e.g. 04XX XXX XXX.";
    if (form.msg.trim().length < 10) fe.msg = "Tell us a little more (10+ characters).";
    setErrs(fe);
    if (Object.keys(fe).length) return;
    const cleanName = form.name.trim();
    const firstName = cleanName.split(" ")[0] || "there";
    const refCode = `ATP-ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
    addEnquiry({ name: cleanName, phone: form.phone.trim(), email: form.email.trim().toLowerCase(), topic: form.topic, message: form.msg.trim().slice(0, 2000) });
    setSentDetails({ name: cleanName, email: form.email.trim(), topic: form.topic, ref: refCode });
    setForm({ name: "", phone: "", email: "", topic: "Tail Lifts", msg: "" });
    setSent(true);
    notify.success({
      kicker: "ENQUIRY SUBMITTED",
      title: "Contact Form Submitted Successfully!",
      message: `Thanks ${firstName}! Our Campbellfield parts desk will review your details and respond within 4 business hours.`,
      icon: "mail",
      duration: 5000,
      sound: true,
    });
  };
  const err = (k) => errs[k] && <span className="mt-1 block text-[12px] font-semibold text-red-600">{errs[k]}</span>;

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Contact</span></p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">Get It Sorted in One Call.</h1>
        <p className="mt-2 max-w-xl text-[15px] text-steel">Send your VIN, photos and measurements for an exact price within 4 business hours.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href={COMPANY.phoneHref} className="group rounded-md border border-line bg-white p-5 transition-colors hover:border-gold">
            <Phone size={20} className="text-primary transition-colors group-hover:text-navy" />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-faint">Phone</p>
            <p className="tabular mt-0.5 text-lg font-extrabold">{COMPANY.phone}</p>
          </a>
          <a href={`mailto:${COMPANY.email}`} className="group rounded-md border border-line bg-white p-5 transition-colors hover:border-gold">
            <Mail size={20} className="text-primary transition-colors group-hover:text-navy" />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-faint">Email</p>
            <p className="mt-0.5 text-[15px] font-extrabold">{COMPANY.email}</p>
          </a>
          <div className="rounded-md border border-line bg-white p-5">
            <MapPin size={20} className="text-primary" />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-faint">Counter</p>
            <p className="mt-0.5 text-[15px] font-extrabold leading-snug">{COMPANY.address}</p>
          </div>
          <div className="rounded-md border border-line bg-white p-5">
            <Clock size={20} className="text-primary" />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-faint">Trading Hours</p>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-1">
                <span className="font-semibold text-steel">Mon – Fri</span>
                <span className="font-extrabold tabular text-ink">9:00 AM – 5:00 PM</span>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-1">
                <span className="font-semibold text-steel">Saturday</span>
                <span className="font-extrabold tabular text-ink">9:00 AM – 12:00 PM</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-faint pt-0.5">
                <span>Sunday</span>
                <span className="font-bold">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pt-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {sent ? (
          <div className="rounded-xl border border-line bg-white p-8 text-center shadow-md">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-md bg-gold text-ink shadow-sm">
              <CheckCircle2 size={36} className="text-ink" />
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-ink md:text-3xl">
              Thank You! Your Enquiry Has Been Received.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-steel max-w-lg mx-auto">
              Our Campbellfield parts and engineering desk will review your details and get back to you within 4 business hours.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-mist px-4 py-2 font-mono text-xs font-bold text-steel border border-line">
              <span>REFERENCE NUMBER:</span>
              <span className="font-extrabold text-navy">{sentDetails.ref}</span>
            </div>
            <div className="mt-6 mx-auto max-w-md rounded-lg border border-line bg-mist/60 p-4 text-left text-xs">
              <div className="flex justify-between py-1 border-b border-line">
                <span className="text-faint font-bold">NAME:</span>
                <span className="font-bold text-ink">{sentDetails.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span className="text-faint font-bold">EMAIL:</span>
                <span className="font-bold text-ink">{sentDetails.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-faint font-bold">TOPIC:</span>
                <span className="font-bold text-navy">{sentDetails.topic}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/shop" className="rounded-md bg-gold px-6 py-2.5 text-xs font-extrabold text-ink hover:bg-navy hover:text-white transition-colors">
                Browse All Products →
              </Link>
              <button
                onClick={() => setSent(false)}
                className="rounded-md border border-line-dark px-5 py-2.5 text-xs font-bold text-steel hover:border-ink hover:text-ink transition-colors"
              >
                Send Another Message
              </button>
            </div>
            <p className="mt-5 text-xs text-faint">
              Need immediate parts matching? Call our trade desk directly on <a href={COMPANY.phoneHref} className="font-bold text-navy hover:underline">{COMPANY.phone}</a>.
            </p>
          </div>
        ) : (
          <form className="rounded-md border border-line bg-mist p-5 md:p-7" onSubmit={send}>
            <p className="text-lg font-extrabold">Request a Quote</p>
            <p className="mt-1 text-[13px] text-steel">For trailer parts, photos and measurements get you an exact price fastest.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="mb-1 block text-xs font-bold">Full name *</span><input required value={form.name} onChange={set("name")} placeholder="Jane Citizen" maxLength={80} className={input(errs.name)} />{err("name")}</label>
              <label className="block"><span className="mb-1 block text-xs font-bold">Phone *</span><input required value={form.phone} onChange={set("phone")} placeholder="04XX XXX XXX" maxLength={20} inputMode="tel" className={input(errs.phone)} />{err("phone")}</label>
            </div>
            <label className="mt-3 block"><span className="mb-1 block text-xs font-bold">Email *</span><input required type="email" value={form.email} onChange={set("email")} placeholder="you@company.com.au" maxLength={120} className={input(errs.email)} />{err("email")}</label>
            <label className="mt-3 block"><span className="mb-1 block text-xs font-bold">Topic</span>
              <ThemeSelect value={form.topic} onChange={(v) => setForm({ ...form, topic: v })} options={["Tail Lifts", "Trailer Parts", "Accessories", "Trade Account", "Something else"]} label="Topic" />
            </label>
            <label className="mt-3 block"><span className="mb-1 block text-xs font-bold">What do you need? *</span><textarea required value={form.msg} onChange={set("msg")} rows={5} maxLength={2000} placeholder="Body type, SKU, sizes, VIN if critical" className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-gold ${errs.msg ? "border-red-500" : "border-line-dark"}`} />{err("msg")}</label>
            <button className="mt-4 flex items-center gap-2 rounded bg-gold px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white"><Send size={15} /> Send Enquiry</button>
          </form>
        )}

        <aside className="h-fit rounded-md bg-ink p-6 text-white lg:sticky lg:top-44">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Before you send</p>
          <ul className="mt-3 space-y-2.5 text-sm text-gray-200">
            <li>• Photos beat part names. Snap the fitting.</li>
            <li>• Left and right are from the driver's seat.</li>
            <li>• Measure profiles in millimetres.</li>
            <li>• VIN checks are free on critical jobs.</li>
          </ul>
          <div className="mt-5 border-t border-gray-700 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Prefer to talk?</p>
            <a href={COMPANY.phoneHref} className="tabular mt-1 block text-xl font-extrabold text-gold">{COMPANY.phone}</a>
          </div>
        </aside>
      </section>
    </main>
  );
}
