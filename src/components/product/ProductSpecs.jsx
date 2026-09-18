import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Package, Truck, Wrench, FileText, Zap } from "lucide-react";

export default function ProductSpecs({ product }) {
  const [activeTab, setActiveTab] = useState("Specs");

  const tabs = [
    { id: "Specs", label: "Specs", icon: FileText },
    { id: "Fitment", label: "Fitment", icon: Package },
    { id: "Freight", label: "Freight", icon: Truck },
  ];

  const getSpecIcon = (spec) => {
    const lowerSpec = spec.toLowerCase();
    if (lowerSpec.includes("warranty") || lowerSpec.includes("guarantee")) return CheckCircle2;
    if (lowerSpec.includes("ship") || lowerSpec.includes("delivery")) return Truck;
    if (lowerSpec.includes("install") || lowerSpec.includes("fit")) return Wrench;
    if (lowerSpec.includes("power") || lowerSpec.includes("volt") || lowerSpec.includes("amp")) return Zap;
    return CheckCircle2;
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Tab navigation */}
      <div className="flex border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 text-sm font-bold transition border-b-2 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? "border-[#134E8D] text-[#134E8D] bg-[#FFF8F5]"
                : "border-transparent text-[#6B7280] hover:text-[#222538]"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-8 text-[14px] text-[#6B7280] leading-relaxed"
        >
          {activeTab === "Specs" && (
            <div>
              {product?.specs && product.specs.length > 0 ? (
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.specs.map((spec, index) => {
                    const Icon = getSpecIcon(spec);
                    return (
                      <li key={index} className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 flex gap-3 items-start">
                        <Icon size={16} className="text-[#10B981] mt-0.5 shrink-0" />
                        <span className="text-[#222538] font-medium">{spec}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[#9CA3AF]">No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === "Fitment" && (
            <div>
              {product?.fit ? (
                <div>
                  <p className="text-[#222538] font-medium mb-4">{product.fit}</p>
                  <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Package size={20} className="text-[#134E8D] mt-0.5" />
                      <div>
                        <p className="text-[#222538] font-semibold mb-1">Vehicle Compatibility</p>
                        <p className="text-sm">
                          For mixed fleets, add your make and year in the Quote page notes and we cross check OEM{" "}
                          <span className="font-mono bg-[#E5E7EB] px-1.5 py-0.5 rounded text-[#134E8D]">{product?.oem || "N/A"}</span> before you pay.
                        </p>
                      </div>
                    </div>
                  </div>
                  {product?.oem && (
                    <div className="mt-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-[#10B981]" />
                        <div>
                          <p className="text-[#222538] font-semibold">OEM Cross Reference</p>
                          <p className="text-sm mt-1">
                            This part cross-references to OEM number: <span className="font-mono font-bold">{product.oem}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[#9CA3AF]">Fitment information not available for this product.</p>
              )}
            </div>
          )}

          {activeTab === "Freight" && (
            <div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Truck size={20} className="text-[#134E8D] mt-0.5" />
                  <div>
                    <p className="text-[#222538] font-semibold mb-1">Shipping Timeline</p>
                    <p className="text-sm">
                      VIC metro 1 day. Sydney, Brisbane and Adelaide 1 to 2 days. Perth and regional 2 to 5 days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#10B981] mt-0.5" />
                  <div>
                    <p className="text-[#222538] font-semibold mb-1">Free Shipping</p>
                    <p className="text-sm">
                      Free freight on orders over $500. VIC pickup available from Campbellfield.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package size={20} className="text-[#134E8D] mt-0.5" />
                  <div>
                    <p className="text-[#222538] font-semibold mb-1">Heavy Freight</p>
                    <p className="text-sm">
                      For large or heavy items, specialized freight solutions are available. Contact us for a quote.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4">
                <p className="text-[12px] font-bold tracking-widest text-[#9CA3AF] uppercase mb-2">Shipping Calculator</p>
                <p className="text-sm">
                  Add this item to your cart and enter your postcode during checkout to see accurate shipping costs and delivery estimates.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}