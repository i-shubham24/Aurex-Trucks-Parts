import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Phone,
  Send,
} from "lucide-react";
import { useCompany, useSite } from "../store/site";
import { useNotification } from "../store/notification";
import { imgFor } from "../data/images";
import ThemeSelect from "../components/ThemeSelect";
import { useProducts } from "../hooks/api/useProducts";
import { apiClient } from "../api/client";

export default function TailLiftEnquiry() {
  const [searchParams] = useSearchParams();
  const requestedSku = searchParams.get("sku") || "";
  const { data: productsData } = useProducts({ category: "tail-lifts", limit: 50 });
  const tailLiftProducts = productsData?.products || [];
  const { addEnquiry } = useSite();
  const { notify } = useNotification();
  const COMPANY = useCompany();

  const initialProduct = tailLiftProducts.find((p) => p.sku === requestedSku) || tailLiftProducts[0];

  const [selectedSku, setSelectedSku] = useState(initialProduct ? initialProduct.sku : "");
  const selectedProduct = tailLiftProducts.find((p) => p.sku === (requestedSku || selectedSku)) || initialProduct;

  // Form State
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    state: "VIC",
    preferredContact: "Phone Call",
    vehicleMakeModel: "",
    bodyType: "Pantech / Dry Freight Box",
    voltage: "24V DC (Standard Heavy Truck)",
    bedHeight: "",
    bodyWidth: "2450 mm",
    liftCapacity: selectedProduct ? (selectedProduct.specs?.Capacity || "2000 kg") : "2000 kg",
    platformMaterial: selectedProduct ? (selectedProduct.specs?.Material || "Aluminium") : "Aluminium",
    platformHeight: "2400 mm",
    options: {
      footControls: true,
      rollStops: false,
      flashingLights: true,
      remotePendant: false,
      bumperBar: true,
    },
    serviceType: "Supply Only (Freighted to Workshop)",
    vinOrNotes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [errors, setErrors] = useState({});

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleOption = (optKey) => {
    setForm((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [optKey]: !prev.options[optKey],
      },
    }));
  };

  const handleProductChange = (sku) => {
    setSelectedSku(sku);
    const hit = tailLiftProducts.find((p) => p.sku === sku);
    if (hit) {
      setForm((prev) => ({
        ...prev,
        liftCapacity: hit.specs?.Capacity || prev.liftCapacity,
        platformMaterial: hit.specs?.Material || prev.platformMaterial,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fe = {};

    if (!form.name.trim() || form.name.trim().length < 2) fe.name = "Enter your full name.";
    if (!form.company.trim()) fe.company = "Enter your company or trading name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) fe.email = "Enter a valid email address.";
    if (!/^0[45]\d{8}$|^0[2378]\d{8}$|^\+61\d{9}$/.test(form.phone.replace(/[\s()-]/g, ""))) {
      fe.phone = "Enter a valid 10-digit Australian phone number.";
    }
    if (!form.vehicleMakeModel.trim()) fe.vehicleMakeModel = "Specify vehicle make & model (e.g., Isuzu FSR, Hino 500, UD Croner).";

    setErrors(fe);
    if (Object.keys(fe).length > 0) {
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    const refCode = `ATP-TL-${Math.floor(100000 + Math.random() * 900000)}`;

    const selectedOptionsList = Object.entries(form.options)
      .filter(([, v]) => v)
      .map(([k]) => {
        const labels = {
          footControls: "Platform Foot Controls",
          rollStops: "Roll-Stop Cart Barriers",
          flashingLights: "Corner Flashing LED Safety Lights",
          remotePendant: "Handheld Remote Pendant",
          bumperBar: "Rear Underrun Bumper Bar",
        };
        return labels[k] || k;
      })
      .join(", ");

    const compiledMessage = `
[TAIL LIFT ENGINEERING ENQUIRY - REF: ${refCode}]
Selected Model: ${selectedProduct ? selectedProduct.name : "Custom Tail Lift"} (SKU: ${selectedProduct?.sku || selectedSku})
Capacity: ${form.liftCapacity} | Platform Material: ${form.platformMaterial} | Platform Height: ${form.platformHeight}
Company: ${form.company.trim()} | Location: ${form.state} | Preferred Contact: ${form.preferredContact}
Vehicle Make/Model: ${form.vehicleMakeModel.trim()}
Body Type: ${form.bodyType} | Voltage: ${form.voltage}
Bed Height: ${form.bedHeight || "Not specified"} | Body Width: ${form.bodyWidth}
Selected Options: ${selectedOptionsList || "Standard configuration"}
Service: ${form.serviceType}
Notes / VIN: ${form.vinOrNotes.trim() || "None provided"}
    `.trim();

    // Send to backend API
    apiClient
      .post("/enquiries", {
        customerName: form.name.trim(),
        name: form.name.trim(),
        companyName: form.company.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        topic: `Tail Lift Enquiry - ${selectedProduct?.sku || selectedSku || "General"}`,
        message: compiledMessage,
        truckDetails: {
          makeModel: form.vehicleMakeModel.trim(),
          bodyType: form.bodyType,
          voltage: form.voltage,
          bedHeight: form.bedHeight,
          bodyWidth: form.bodyWidth,
        },
        partDetails: {
          partName: selectedProduct?.name || "Tail Lift",
          sku: selectedProduct?.sku || selectedSku,
          capacity: form.liftCapacity,
          material: form.platformMaterial,
          serviceType: form.serviceType,
        },
      })
      .catch((err) => {
        console.warn("Backend enquiry sync notice:", err);
      });

    addEnquiry({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      topic: "Tail Lifts",
      message: compiledMessage,
    });

    setReferenceId(refCode);
    setSubmitting(false);
    setSubmitted(true);
    window.scrollTo({ top: 100, behavior: "smooth" });

    notify.success({
      kicker: "TAIL LIFT ENQUIRY RECEIVED",
      title: "Quote Request Submitted!",
      message: `Thanks ${form.name.split(" ")[0]}! Our tail lift engineering team will review your vehicle specs and contact you within a few hours.`,
      icon: "truck",
      duration: 6000,
      sound: true,
    });
  };

  const inputClass = (bad) =>
    `h-11 w-full rounded-md border bg-white px-3 text-sm outline-none placeholder:text-faint transition-colors focus:border-gold ${
      bad ? "border-red-500 ring-1 ring-red-500/20" : "border-line-dark focus:border-gold"
    }`;

  const errSpan = (k) => errors[k] && <span className="mt-1 block text-[12px] font-semibold text-red-600">{errors[k]}</span>;

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-[12px] text-faint">
            <Link to="/" className="hover:text-navy hover:underline">Home</Link> /{" "}
            <Link to="/shop/tail-lifts" className="hover:text-navy hover:underline">Tail Lifts</Link> /{" "}
            <span className="font-semibold text-ink">Quotation Enquiry</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
                Tail Lift Quotation Enquiry
              </h1>
            </div>

            <div className="flex flex-col items-start gap-2 rounded-md border border-line bg-mist p-4 text-left sm:items-end sm:text-right">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-steel">
                <Clock size={14} className="text-primary" /> Response Time
              </span>
              <p className="text-lg font-extrabold text-navy">Within 4 Business Hours</p>
              <a href={COMPANY.phoneHref} className="flex items-center gap-1.5 text-xs font-bold text-steel hover:text-navy">
                <Phone size={13} className="text-primary" /> Or call {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        {submitted ? (
          /* ── Dedicated Thank You Screen ── */
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-line bg-white shadow-lg">
            <div className="border-b border-line bg-gradient-to-r from-navy to-[#082b5e] p-8 text-center text-white">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-md bg-gold text-ink shadow-md">
                <CheckCircle2 size={36} className="text-ink" />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight md:text-3xl">
                Thank You! Your Tail Lift Enquiry Has Been Received.
              </h2>
              <p className="mt-2 text-[15px] text-gray-200">
                Our tail lift engineering and technical team will review your specifications and get back to you within a few hours.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-1.5 font-mono text-xs font-bold tracking-wider text-gold backdrop-blur-sm">
                <span>ENQUIRY REFERENCE:</span>
                <span className="font-extrabold text-white">{referenceId}</span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="rounded-lg border border-line bg-mist p-5">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy">Submission Summary</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-xs font-bold text-faint uppercase">Contact Person:</span>
                    <p className="font-extrabold text-ink">{form.name} ({form.company})</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-faint uppercase">Phone & Email:</span>
                    <p className="font-extrabold text-ink">{form.phone}</p>
                    <p className="text-xs text-steel">{form.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-faint uppercase">Tail Lift Selected:</span>
                    <p className="font-extrabold text-ink">{selectedProduct?.name || "Custom Cantilever Lift"}</p>
                    <p className="font-mono text-xs text-steel">SKU: {selectedProduct?.sku}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-faint uppercase">Vehicle & Body:</span>
                    <p className="font-extrabold text-ink">{form.vehicleMakeModel}</p>
                    <p className="text-xs text-steel">{form.bodyType} · {form.voltage}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-faint uppercase">Lifting Capacity & Material:</span>
                    <p className="font-extrabold text-ink">{form.liftCapacity} — {form.platformMaterial}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-faint uppercase">Service Mode:</span>
                    <p className="font-extrabold text-ink">{form.serviceType}</p>
                  </div>
                </div>
              </div>

              {/* Immediate Call Notice */}
              <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-gold bg-gold/15 p-5 sm:flex-row">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-gold text-ink">
                    <Phone size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-ink">Need urgent sizing or immediate fleet consultation?</p>
                    <p className="text-xs text-steel">Our Campbellfield engineering trade counter is standing by.</p>
                  </div>
                </div>
                <a
                  href={COMPANY.phoneHref}
                  className="whitespace-nowrap rounded-md bg-ink px-5 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-navy"
                >
                  Call {COMPANY.phone}
                </a>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/shop"
                  className="rounded-md bg-gold px-6 py-3 text-sm font-extrabold text-ink transition-colors hover:bg-navy hover:text-white"
                >
                  Explore Trailer Hardware & Accessories →
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm((prev) => ({ ...prev, vinOrNotes: "" }));
                  }}
                  className="rounded-md border border-line-dark bg-white px-5 py-3 text-sm font-bold text-steel transition-colors hover:border-ink hover:text-ink"
                >
                  Submit Another Tail Lift Enquiry
                </button>
                <Link
                  to="/"
                  className="rounded-md border border-transparent px-4 py-3 text-sm font-bold text-navy hover:underline"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── Main Enquiry Form Layout ── */
          <div className="mx-auto max-w-4xl">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-line bg-white p-6 shadow-sm md:p-8">
              {/* Step 1: Tail Lift Model Selection */}
              <div>
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-navy text-xs font-extrabold text-white">1</span>
                  <h2 className="text-lg font-extrabold text-ink">Selected Tail Lift Model</h2>
                </div>
                <p className="mt-2 text-xs text-steel">
                  Choose the model you are interested in. If you are unsure, select the closest match and note your requirements below.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {tailLiftProducts.map((p) => {
                    const isSelected = p.sku === selectedSku;
                    return (
                      <div
                        key={p.sku}
                        onClick={() => handleProductChange(p.sku)}
                        className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                          isSelected
                            ? "border-gold bg-gold/10 shadow-sm ring-1 ring-gold"
                            : "border-line bg-mist/60 hover:border-line-dark hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded border border-line bg-white">
                            {(p.images?.[0]?.url || p.imageUrl || imgFor(p.sku)) && (
                              <img
                                src={p.images?.[0]?.url || p.imageUrl || imgFor(p.sku)}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-[10px] font-bold text-faint">{p.sku}</span>
                            <p className="line-clamp-1 text-[13px] font-extrabold text-ink">{p.name}</p>
                            <p className="text-[11px] font-semibold text-primary">
                              {p.specs?.Capacity || "Enquiry"} · {p.specs?.Material || "Alloy"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Customer / Workshop Information */}
              <div>
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-navy text-xs font-extrabold text-white">2</span>
                  <h2 className="text-lg font-extrabold text-ink">Your Contact & Company Details</h2>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Full Name *</span>
                    <input
                      required
                      value={form.name}
                      onChange={setField("name")}
                      placeholder="e.g. John Miller"
                      className={inputClass(errors.name)}
                    />
                    {errSpan("name")}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Company / Workshop Name *</span>
                    <input
                      required
                      value={form.company}
                      onChange={setField("company")}
                      placeholder="e.g. Miller Body Works / AusFreight"
                      className={inputClass(errors.company)}
                    />
                    {errSpan("company")}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Mobile / Phone Number *</span>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={setField("phone")}
                      placeholder="e.g. 0414 730 467"
                      className={inputClass(errors.phone)}
                    />
                    {errSpan("phone")}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Email Address *</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={setField("email")}
                      placeholder="e.g. workshop@millerbodies.com.au"
                      className={inputClass(errors.email)}
                    />
                    {errSpan("email")}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">State / Delivery Location</span>
                    <ThemeSelect
                      value={form.state}
                      onChange={(v) => setForm({ ...form, state: v })}
                      options={["VIC", "NSW", "QLD", "WA", "SA", "TAS", "NT", "ACT"]}
                      label="State"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Preferred Contact Method</span>
                    <ThemeSelect
                      value={form.preferredContact}
                      onChange={(v) => setForm({ ...form, preferredContact: v })}
                      options={["Phone Call", "Email", "SMS / WhatsApp"]}
                      label="Preferred Contact"
                    />
                  </label>
                </div>
              </div>

              {/* Step 3: Vehicle & Body Specifications */}
              <div>
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-navy text-xs font-extrabold text-white">3</span>
                  <h2 className="text-lg font-extrabold text-ink">Vehicle & Body Specifications</h2>
                </div>
                <p className="mt-2 text-xs text-steel">
                  Accurate body dimensions guarantee zero fitment surprises upon delivery.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-bold text-ink">Truck Make & Model *</span>
                    <input
                      required
                      value={form.vehicleMakeModel}
                      onChange={setField("vehicleMakeModel")}
                      placeholder="e.g. Isuzu FSR 140-260, Hino 500 Wide Cab, UD Croner, Semi-Trailer"
                      className={inputClass(errors.vehicleMakeModel)}
                    />
                    {errSpan("vehicleMakeModel")}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Body Construction Type</span>
                    <ThemeSelect
                      value={form.bodyType}
                      onChange={(v) => setForm({ ...form, bodyType: v })}
                      options={[
                        "Pantech / Dry Freight Box",
                        "Curtainsider / Tautliner",
                        "Flatbed / Tray Body",
                        "Refrigerated Body",
                        "Van (Light Commercial)",
                        "Semi-Trailer / Linehaul",
                        "Other / Custom Body",
                      ]}
                      label="Body Type"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Electrical Voltage System</span>
                    <ThemeSelect
                      value={form.voltage}
                      onChange={(v) => setForm({ ...form, voltage: v })}
                      options={[
                        "24V DC (Standard Heavy Truck)",
                        "12V DC (Light Commercial / Van)",
                        "Not Sure (Advise based on chassis)",
                      ]}
                      label="Electrical Voltage"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Floor / Bed Height from Ground (mm)</span>
                    <input
                      value={form.bedHeight}
                      onChange={setField("bedHeight")}
                      placeholder="e.g. 1100 mm (laden/unladen)"
                      className={inputClass()}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">External Body Width</span>
                    <ThemeSelect
                      value={form.bodyWidth}
                      onChange={(v) => setForm({ ...form, bodyWidth: v })}
                      options={["2450 mm", "2500 mm (Max ADR Width)", "2400 mm", "Other / Custom"]}
                      label="Body Width"
                    />
                  </label>
                </div>
              </div>

              {/* Step 4: Tail Lift Operating Requirements */}
              <div>
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-navy text-xs font-extrabold text-white">4</span>
                  <h2 className="text-lg font-extrabold text-ink">Tail Lift Operating Requirements</h2>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Lifting Capacity</span>
                    <ThemeSelect
                      value={form.liftCapacity}
                      onChange={(v) => setForm({ ...form, liftCapacity: v })}
                      options={["1500 kg", "2000 kg (Most Popular)", "2500 kg", "3000 kg (Heavy Duty)"]}
                      label="Lifting Capacity"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Platform Material</span>
                    <ThemeSelect
                      value={form.platformMaterial}
                      onChange={(v) => setForm({ ...form, platformMaterial: v })}
                      options={[
                        "Aluminium (Lightweight & Corrosion Free)",
                        "Structural Steel (Heavy Duty Galvanised)",
                      ]}
                      label="Platform Material"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink">Platform Height</span>
                    <ThemeSelect
                      value={form.platformHeight}
                      onChange={(v) => setForm({ ...form, platformHeight: v })}
                      options={["2200 mm", "2400 mm", "2600 mm (High Cube)"]}
                      label="Platform Height"
                    />
                  </label>
                </div>

                {/* Optional Hardware Equipment */}
                <div className="mt-5">
                  <span className="mb-2 block text-xs font-bold text-ink">Required Hardware & Safety Options:</span>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {[
                      ["footControls", "Dual Platform Foot Controls (Hands-free loading)"],
                      ["rollStops", "Roll-Stop Cart / Pallet Barriers (Fold-up stops)"],
                      ["flashingLights", "Corner Flashing LED Safety Lights & Flags (ADR)"],
                      ["remotePendant", "Handheld Remote Control Pendant (Wired/Spiral)"],
                      ["bumperBar", "Integrated Rear Underrun Bumper Bar"],
                    ].map(([key, label]) => (
                      <label
                        key={key}
                        onClick={() => toggleOption(key)}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-md border p-2.5 text-xs font-semibold transition-colors ${
                          form.options[key]
                            ? "border-navy bg-navy/5 text-navy font-bold"
                            : "border-line bg-white text-steel hover:border-line-dark"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.options[key]}
                          onChange={() => {}}
                          className="h-4 w-4 rounded accent-[#002049]"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <span className="mb-1 block text-xs font-bold text-ink">Supply / Installation Scope</span>
                  <ThemeSelect
                    value={form.serviceType}
                    onChange={(v) => setForm({ ...form, serviceType: v })}
                    options={[
                      "Supply Only (Freighted to Workshop/Depot)",
                      "Supply with Fitment Bracket Consultation",
                      "Full Supply & Fitting Assistance",
                    ]}
                    label="Service Scope"
                  />
                </div>
              </div>

              {/* Step 5: Notes & VIN */}
              <div>
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-navy text-xs font-extrabold text-white">5</span>
                  <h2 className="text-lg font-extrabold text-ink">Additional Notes / VIN / Workshop Directives</h2>
                </div>

                <div className="mt-4">
                  <textarea
                    rows={4}
                    value={form.vinOrNotes}
                    onChange={setField("vinOrNotes")}
                    placeholder="Enter chassis VIN, required delivery deadline, special chassis overhang considerations, or any custom questions..."
                    className="w-full rounded-md border border-line-dark bg-white p-3 text-sm outline-none placeholder:text-faint focus:border-gold"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="border-t border-line pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gold py-4 text-center text-sm font-extrabold text-ink shadow-md transition-all hover:bg-navy hover:text-white disabled:opacity-50"
                >
                  <Send size={16} />
                  {submitting ? "Submitting Specification..." : "Submit Tail Lift Quotation Enquiry →"}
                </button>
                <p className="mt-2.5 text-center text-xs text-steel">
                  Our Melbourne engineering desk will review your chassis specifications and issue a formal quote within 4 business hours.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
