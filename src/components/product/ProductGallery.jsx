import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImg } from "../ui.jsx";

export default function ProductGallery({ product, images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const galleryImages = useMemo(() => {
    if (images.length > 0) return images;
    if (product?.image) return [product.image];
    return [];
  }, [product, images]);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setIsZoomed(false);
  };

  if (galleryImages.length === 0) {
    return (
      <div className="rounded-3xl overflow-hidden border border-[#E5E7EB] bg-[#F1F2F4] aspect-[4/3] flex items-center justify-center">
        <div className="text-center text-[#9CA3AF]">
          <p className="text-sm">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main image */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E5E7EB] bg-[#F1F2F4] shine group">
        <div className="relative aspect-[4/3] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <SafeImg
                src={galleryImages[activeIndex]}
                alt={product?.name || "Product image"}
                label={product?.sku || "Product"}
                className="w-full h-full object-cover"
                wrapClass="w-full h-full"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Zoom indicator */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            <ZoomIn size={18} />
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {product?.oldPrice && (
              <span className="bg-[#E53E00] text-white text-[12px] font-black px-3 py-1.5 rounded-lg shadow-primary">
                -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
              </span>
            )}
            {product?.stock && (
              <span className={`text-[12px] font-bold px-3 py-1.5 rounded-lg ${
                product.stock.includes("In stock") ? "bg-[#10B981] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"
              }`}>
                {product.stock}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail grid */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-xl overflow-hidden border-2 transition aspect-square ${
                activeIndex === i ? "border-[#E53E00]" : "border-[#E5E7EB] hover:border-[#9CA3AF]"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <SafeImg
                src={img}
                alt=""
                label={product?.sku || "Product"}
                className="w-full h-full object-cover"
                wrapClass="w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Product info bar */}
      <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] border border-[#E5E7EB] rounded-2xl text-center text-[12px] font-semibold bg-white overflow-hidden">
        {[
          ["SKU", product?.sku || "N/A"],
          ["OEM", product?.oem || "N/A"],
          ["SYSTEM", product?.cat || "N/A"]
        ].map(([k, v]) => (
          <div key={k} className="px-3 py-4">
            <b className="block text-[#9CA3AF] text-[10px] tracking-widest mb-1">{k}</b>
            <span className="text-[#1A1A2E]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}