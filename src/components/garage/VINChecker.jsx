import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, ScanLine, X } from "lucide-react";

export default function VINChecker({ onValidation, compact = false }) {
  const [vin, setVin] = useState("");
  const [validationStatus, setValidationStatus] = useState(null); // null, 'valid', 'invalid', 'checking'
  const [errorMessage, setErrorMessage] = useState("");

  const validateVIN = (vinValue) => {
    // Basic VIN validation (17 characters, alphanumeric)
    const cleanVin = vinValue.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    if (cleanVin.length < 6) {
      return { valid: false, message: "Enter at least 6 characters for preliminary check" };
    }
    
    if (cleanVin.length !== 17) {
      return { valid: false, message: "VIN must be exactly 17 characters" };
    }

    // Check for invalid characters (I, O, Q are not allowed in VINs)
    if (/[IOQ]/.test(cleanVin)) {
      return { valid: false, message: "VIN contains invalid characters (I, O, Q not allowed)" };
    }

    return { valid: true, message: "Good match for this line. Add to quote and we double check before dispatch." };
  };

  const handleCheck = () => {
    if (!vin.trim()) return;
    
    setValidationStatus("checking");
    
    // Simulate API call delay
    setTimeout(() => {
      const result = validateVIN(vin);
      setValidationStatus(result.valid ? "valid" : "invalid");
      setErrorMessage(result.message);
      
      if (onValidation) {
        onValidation(result.valid, vin.toUpperCase());
      }
    }, 800);
  };

  const handleClear = () => {
    setVin("");
    setValidationStatus(null);
    setErrorMessage("");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          placeholder="VIN (17 chars)"
          maxLength={17}
          className="flex-1 bg-[#F5F6F8] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E53E00] transition uppercase"
        />
        {vin && (
          <button onClick={handleClear} className="p-2 rounded-lg hover:bg-[#E5E7EB] transition">
            <X size={14} className="text-[#9CA3AF]" />
          </button>
        )}
        <button 
          onClick={handleCheck}
          disabled={vin.length < 6}
          className="bg-[#E53E00] text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#C23400] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Check
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
      <p className="text-[12px] font-bold tracking-widest text-[#9CA3AF] flex items-center gap-1.5 uppercase">
        <ScanLine size={14} className="text-[#E53E00]" /> Check Fitment by VIN
      </p>
      <div className="mt-2.5 flex gap-2">
        <input 
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          placeholder="Enter VIN, 17 characters"
          maxLength={17}
          className="flex-1 rounded-lg px-4 py-3 bg-white border border-[#E5E7EB] outline-none text-sm text-[#1A1A2E] focus:border-[#E53E00] transition uppercase"
        />
        <button 
          onClick={handleCheck}
          disabled={vin.length < 6}
          className="bg-[#E53E00] text-white rounded-lg px-5 py-3 text-sm font-bold hover:bg-[#C23400] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Check
        </button>
      </div>
      
      <AnimatePresence>
        {validationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2"
          >
            {validationStatus === "valid" ? (
              <p className="text-[13px] text-[#10B981] font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> {errorMessage}
              </p>
            ) : validationStatus === "invalid" ? (
              <p className="text-[13px] text-[#EF4444] font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} /> {errorMessage}
              </p>
            ) : (
              <p className="text-[13px] text-[#9CA3AF] font-semibold flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />
                Checking VIN...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}