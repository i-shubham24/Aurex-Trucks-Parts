import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Truck, X, Check, Wrench } from "lucide-react";
import { useGarage } from "./GarageContext.jsx";
import { TRUCK_MAKES, TRUCK_YEARS } from "../../data/fitment.js";

const CUT = { clipPath: "polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))" };
const EASE = [0.16, 1, 0.3, 1];

function Field({ label, value, onChange, options, placeholder, disabled, dark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, [open]);

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <span className="block text-[10px] font-black tracking-[0.22em] uppercase mb-1.5 text-[#F57429]">{label}</span>
      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`clip-cut-sm w-full flex items-center justify-between gap-2 px-3.5 py-3.5 text-base sm:text-sm font-bold outline-none transition border-2 ${
            dark ? "bg-white/[0.04] border-white/10 hover:border-[#DE5718]" : "bg-[#F5F6F8] border-[#E5E7EB] hover:border-[#DE5718]"
          } ${value ? (dark ? "text-white" : "text-[#1A1A2E]") : (dark ? "text-white/45" : "text-[#9CA3AF]")}`}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown size={15} className={`shrink-0 transition ${open ? "rotate-180" : ""} ${dark ? "text-white/40" : "text-[#9CA3AF]"}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
              className={`absolute left-0 right-0 z-[70] mt-1.5 max-h-[40vh] sm:max-h-52 overflow-auto no-scrollbar shadow-elevated ${dark ? "bg-[#1A1A2E] border-2 border-white/10" : "bg-white border-2 border-[#1A1A2E]"}`}
            >
              {options.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => { onChange(o); setOpen(false); }}
                    className={`w-full text-left px-4 py-3.5 sm:py-2.5 text-base sm:text-sm font-semibold transition ${o === value ? "bg-[#DE5718] text-white" : (dark ? "text-white/85 hover:bg-white/10" : "text-[#1A1A2E] hover:bg-[#FFF0EB]")}`}
                  >
                    {o}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// The console: three progressive selects plus confirm. Shared by the hero and the header pill.
function Console({ dark = true, onDone }) {
  const { selectedVehicle, addVehicle, updateVehicle } = useGarage();
  const [make, setMake] = useState(selectedVehicle?.make || "");
  const [model, setModel] = useState(selectedVehicle?.model || "");
  const [year, setYear] = useState(selectedVehicle?.year || "");

  const models = make ? TRUCK_MAKES[make] || [] : [];
  const ready = make && model;

  const commit = () => {
    if (!ready) return;
    if (selectedVehicle) updateVehicle(selectedVehicle.id, { make, model, year });
    else addVehicle({ make, model, year });
    onDone && onDone();
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Make" value={make} dark={dark} placeholder="Select make"
          options={Object.keys(TRUCK_MAKES)}
          onChange={(v) => { setMake(v); setModel(""); }} />
        <Field label="Model" value={model} dark={dark} placeholder={make ? "Select model" : "Pick make first"}
          options={models} disabled={!make}
          onChange={setModel} />
        <Field label="Year" value={year} dark={dark} placeholder={model ? "Any year" : "Pick model first"}
          options={TRUCK_YEARS} disabled={!model}
          onChange={setYear} />
      </div>
      <motion.button
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        onClick={commit}
        disabled={!ready}
        style={CUT}
        className="mt-3 w-full bg-gradient-to-r from-[#EE6724] to-[#DE5718] hover:from-[#DE5718] hover:to-[#B43808] text-white py-3.5 text-sm font-black tracking-wide uppercase flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
      >
        <Check size={16} /> Lock in my rig
      </motion.button>
    </motion.div>
  );
}

export default function YMMWidget({ variant = "hero" }) {
  const { selectedVehicle, hasValidVehicle, clearSelectedVehicle } = useGarage();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Close the pill dropdown on outside click.
  useEffect(() => {
    if (!open || variant !== "pill") return;
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, variant]);

  // ===== Hero console: always open, industrial panel =====
  if (variant === "hero") {
    return (
      <div className="relative" style={CUT}>
        <div className="bg-[#12121B] border-t-2 border-[#DE5718] p-5 sm:p-6 shadow-elevated">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-9 h-9 bg-[#DE5718] text-white" style={{ clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)" }}>
              <Truck size={17} />
            </span>
            <div>
              <p className="text-white font-display font-bold text-[15px] leading-none">Find parts that fit</p>
              <p className="text-white/45 text-[11px] mt-1 font-mono tracking-wide">
                {hasValidVehicle ? `ACTIVE: ${selectedVehicle.year || "any"} ${selectedVehicle.make} ${selectedVehicle.model}` : "SET YOUR TRUCK ONCE, WE FILTER EVERYTHING"}
              </p>
            </div>
            {hasValidVehicle && (
              <button onClick={clearSelectedVehicle} className="ml-auto text-white/40 hover:text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-1">
                <X size={13} /> Clear
              </button>
            )}
          </div>
          <Console dark onDone={() => {}} />
        </div>
      </div>
    );
  }

  // ===== Header pill: collapsed chip that opens the console =====
  return (
    <div className="relative" ref={boxRef}>
      {hasValidVehicle ? (
        <button
          onClick={() => setOpen((o) => !o)}
          style={CUT}
          className="flex items-center gap-2 bg-[#1A1A2E] text-white pl-2.5 pr-3 py-2 hover:bg-[#12121B] transition group"
        >
          <span className="grid place-items-center w-6 h-6 bg-[#DE5718]" style={{ clipPath: "polygon(0 0,100% 0,100% 65%,65% 100%,0 100%)" }}>
            <Truck size={13} />
          </span>
          <span className="text-left leading-none">
            <span className="block text-[8px] font-black tracking-[0.2em] text-[#F57429] uppercase">Your rig</span>
            <span className="block text-[12px] font-bold mt-0.5">{selectedVehicle.make} {selectedVehicle.model}</span>
          </span>
          <ChevronDown size={14} className="text-white/40 group-hover:text-white transition" />
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          style={CUT}
          className="flex items-center gap-2 bg-gradient-to-r from-[#EE6724] to-[#DE5718] hover:from-[#DE5718] hover:to-[#B43808] text-white px-3.5 py-2 text-[13px] font-black uppercase tracking-wide shadow-sm transition"
        >
          <Wrench size={15} /> Add your truck
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={CUT}
            className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-[#12121B] border-t-2 border-[#DE5718] p-4 shadow-elevated z-[65]"
          >
            <p className="text-white font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Truck size={15} className="text-[#F57429]" /> Select your truck
            </p>
            <Console dark onDone={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
