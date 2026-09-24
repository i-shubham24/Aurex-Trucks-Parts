import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useCompany } from "../store/site";
import { useSite } from "../store/site";

export default function Contact() {
  const { addEnquiry } = useSite();
  const COMPANY = useCompany();
  const [sent, setSent] = useState(false);
  const [sentName, setSentName] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", topic: "Tail Lifts", msg: "" });
  const [errs, setErrs] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const input = (bad) => `h-11 w-full rounded-md border bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold ${bad ? "border-red-500" : "border-line-dark"}`;
  const send = (e) => {
    e.preventDefault();
    const fe = {};
    if (form.name.trim().length < 2) fe.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) fe.email = "Enter a valid email address.";
    if (!/^0[45]\d{8}$|^0[2378]\d{8}$/.test(form.phone.replace(/\s/g, ""))) fe.phone = "Enter a 10-digit AU number, e.g. 04XX XXX XXX.";
    if (form.msg.trim().length < 10) fe.msg = "Tell us a little more (10+ characters).";
    setErrs(fe);
    if (Object.keys(fe).length) return;
    addEnquiry({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim().toLowerCase(), topic: form.topic, message: form.msg.trim().slice(0, 2000) });
    setSentName(form.name.trim().split(" ")[0] || "there");
    setForm({ name: "", phone: "", email: "", topic: "Tail Lifts", msg: "" });
    setSent(true);
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
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-faint">Hours</p>
            <p className="mt-0.5 text-[15px] font-extrabold leading-snug">{COMPANY.hours}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pt-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="rounded-md border border-line bg-mist p-5 md:p-7" onSubmit={send}>
          <p className="text-lg font-extrabold">Request a Quote</p>
          <p className="mt-1 text-[13px] text-steel">For trailer parts, photos and measurements get you an exact price fastest.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="mb-1 block text-xs font-bold">Full name *</span><input required value={form.name} onChange={set("name")} placeholder="Jane Citizen" maxLength={80} className={input(errs.name)} />{err("name")}</label>
            <label className="block"><span className="mb-1 block text-xs font-bold">Phone *</span><input required value={form.phone} onChange={set("phone")} placeholder="04XX XXX XXX" maxLength={20} inputMode="tel" className={input(errs.phone)} />{err("phone")}</label>
          </div>
          <label className="mt-3 block"><span className="mb-1 block text-xs font-bold">Email *</span><input required type="email" value={form.email} onChange={set("email")} placeholder="you@company.com.au" maxLength={120} className={input(errs.email)} />{err("email")}</label>
          <label className="mt-3 block"><span className="mb-1 block text-xs font-bold">Topic</span>
            <select value={form.topic} onChange={set("topic")} className={input}>
              <option>Tail Lifts</option><option>Trailer Parts</option><option>Accessories</option><option>Trade Account</option><option>Something else</option>
            </select>
          </label>
          <label className="mt-3 block"><span className="mb-1 block text-xs font-bold">What do you need? *</span><textarea required value={form.msg} onChange={set("msg")} rows={5} maxLength={2000} placeholder="Body type, SKU, sizes, VIN if critical" className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-gold ${errs.msg ? "border-red-500" : "border-line-dark"}`} />{err("msg")}</label>
          <button className="mt-4 flex items-center gap-2 rounded bg-gold px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-navy hover:text-white"><Send size={15} /> Send Enquiry</button>
          {sent && <p className="mt-3 rounded-md border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800">Thanks {sentName}. We received your enquiry and will reply within 4 business hours.</p>}
        </form>
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
