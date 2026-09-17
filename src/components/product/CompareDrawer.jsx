import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Trash2, Check } from "lucide-react";
import { useShop } from "../../store/shop.jsx";
import { useProducts } from "../../store/products.jsx";
import { SafeImg } from "../ui.jsx";

export default function CompareDrawer({ open, onClose }) {
  const { compare, toggleCompare } = useShop();
  const { products: PRODUCTS } = useProducts();
  
  const compareProducts = compare.map((sku) => PRODUCTS.find((p) => p.sku === sku)).filter(Boolean);

  const maxCompare = 4;
  const canAddMore = compare.length < maxCompare;

  const handleRemove = (sku) => {
    toggleCompare(sku);
  };

  const handleClearAll = () => {
    compare.forEach((sku) => toggleCompare(sku));
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="absolute right-0 top-0 h-full w-[92%] max-w-4xl bg-white border-l border-[#E5E7EB] flex flex-col"
          >
            <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB]">
              <div>
                <p className="font-bold text-lg text-[#1A1A2E] flex items-center gap-2">
                  Compare Products ({compare.length}/{maxCompare})
                </p>
                <p className="text-sm text-[#6B7280] mt-1">
                  {canAddMore ? "Add more products to compare" : "Maximum comparison limit reached"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {compare.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm font-semibold text-[#EF4444] hover:text-[#DC2626] transition"
                  >
                    Clear All
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280]" aria-label="close">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {compareProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-[#F5F6F8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-[#9CA3AF]" />
                  </div>
                  <p className="text-[#9CA3AF] text-sm">No products to compare</p>
                  <p className="text-[#6B7280] text-xs mt-1">Add products from the shop to compare features</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {compareProducts.map((product) => (
                    <div key={product.sku} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                      <div className="relative aspect-square">
                        <SafeImg
                          src={product.image}
                          alt={product.name}
                          label={product.sku}
                          className="w-full h-full object-cover"
                          wrapClass="w-full h-full"
                        />
                        <button
                          onClick={() => handleRemove(product.sku)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition"
                          aria-label="Remove from comparison"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-bold text-[#0B2F5C] uppercase">{product.cat}</p>
                        <p className="font-semibold text-sm text-[#1A1A2E] mt-1 line-clamp-2">{product.name}</p>
                        <p className="font-display font-bold text-lg text-[#1A1A2E] mt-2">{product.price == null ? "Enquire for price" : `$${product.price.toFixed(2)}`}</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6B7280]">SKU:</span>
                            <span className="font-medium text-[#1A1A2E]">{product.sku}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6B7280]">Brand:</span>
                            <span className="font-medium text-[#1A1A2E]">{product.brand}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6B7280]">Stock:</span>
                            <span className={`font-medium ${product.stock.includes("In stock") ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                              {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {compareProducts.length > 0 && (
              <div className="p-5 border-t border-[#E5E7EB] bg-[#F7F8FA]">
                <button
                  onClick={onClose}
                  className="w-full bg-[#0B2F5C] text-white rounded-xl py-3.5 text-sm font-bold hover:bg-[#1A1A2E] transition flex items-center justify-center gap-2"
                >
                  Continue Shopping <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}