import { Download, FileText } from "lucide-react";

export function CataloguePage() {
  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      <div className="bg-[#1A1A2E] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl">Digital Catalogue</h1>
          <p className="text-[#9CA3AF] mt-4 max-w-2xl mx-auto text-lg">
            Download our latest parts catalogue for offline viewing and easy workshop reference.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#E5E7EB] flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-64 bg-[#F3F4F6] rounded-xl flex items-center justify-center border border-[#E5E7EB] flex-shrink-0 shadow-inner relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1/2 bg-[#0B2F5C]/10"></div>
             <div className="z-10 flex flex-col items-center">
                <FileText size={48} className="text-[#0B2F5C] mb-2" />
                <span className="font-display font-black text-[#1A1A2E] text-xl">AUREX</span>
                <span className="text-xs font-bold text-[#6B7280] tracking-widest mt-1">CATALOGUE 2026</span>
             </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-display font-bold text-2xl text-[#1A1A2E]">2026 Parts & Accessories Catalogue</h2>
            <p className="text-[#6B7280] mt-3">
              Covers all 36 approved lines across tail lifts, tool boxes, trailer parts, accessories, replacement parts and tools, including specifications, dimensions and materials.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-6">
              <a href="/Aurex_Catalogue_2026.pdf" download="Aurex_Catalogue_2026.pdf" className="bg-[#0B2F5C] text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#1A1A2E] transition">
                <Download size={18} /> Download PDF (12MB)
              </a>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-4">
              Last updated: August 2026. Prices in the catalogue may be subject to change. For live pricing, please search the part number on our website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
