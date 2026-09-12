import { BookOpen, FileText, Settings, Download } from "lucide-react";

export function ResourcesPage() {
  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      <div className="bg-[#1A1A2E] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl">Technical Resources</h1>
          <p className="text-[#9CA3AF] mt-4 max-w-2xl mx-auto text-lg">
            Expert guides, technical specifications, and bearing charts to help you build and repair with confidence.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
            <div className="w-12 h-12 bg-[#E53E00]/10 rounded-xl flex items-center justify-center mb-4 text-[#E53E00]">
              <Settings size={24} />
            </div>
            <h3 className="font-bold text-[#1A1A2E] text-lg">Bearing Identification</h3>
            <p className="text-sm text-[#6B7280] mt-2 mb-4">
              Learn how to measure and identify LM, Slimline, and Parallel bearing profiles.
            </p>
            <a href="#bearings" className="text-[#E53E00] font-semibold text-sm hover:underline">View Chart &rarr;</a>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
            <div className="w-12 h-12 bg-[#E53E00]/10 rounded-xl flex items-center justify-center mb-4 text-[#E53E00]">
              <BookOpen size={24} />
            </div>
            <h3 className="font-bold text-[#1A1A2E] text-lg">Drop Axle Guide</h3>
            <p className="text-sm text-[#6B7280] mt-2 mb-4">
              Everything you need to know about specifying drop axles for low-ride trailers.
            </p>
            <a href="#axles" className="text-[#E53E00] font-semibold text-sm hover:underline">Read Guide &rarr;</a>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
            <div className="w-12 h-12 bg-[#E53E00]/10 rounded-xl flex items-center justify-center mb-4 text-[#E53E00]">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-[#1A1A2E] text-lg">Custom Axle Form</h3>
            <p className="text-sm text-[#6B7280] mt-2 mb-4">
              Download our custom axle order form to submit specific measurements to our engineers.
            </p>
            <button className="text-[#E53E00] font-semibold text-sm hover:underline flex items-center gap-1">
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-20" id="bearings">
        <h2 className="font-display font-bold text-3xl text-[#1A1A2E] mb-6">Trailer Bearing Numbers & Specs</h2>
        <div className="prose prose-slate max-w-none text-[#4B5563]">
          <p>
            Bearings consist of two parts, the cup and the cone, which are pressed into the hub to aid smooth, rolling rotation. 
            In each hub, there are two pairs of bearings, one for the outer and one for the inner.
          </p>
          
          <div className="overflow-x-auto mt-8 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#1A1A2E]">Type</th>
                  <th className="px-6 py-4 font-semibold text-[#1A1A2E]">Bearing No.</th>
                  <th className="px-6 py-4 font-semibold text-[#1A1A2E]">Part</th>
                  <th className="px-6 py-4 font-semibold text-[#1A1A2E]">Location</th>
                  <th className="px-6 py-4 font-semibold text-[#1A1A2E]">OD (Outer Dia)</th>
                  <th className="px-6 py-4 font-semibold text-[#1A1A2E]">ID (Inner Dia)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">LM (Holden)</td>
                  <td className="px-6 py-4 text-[#E53E00]">LM67010 / LM67048</td>
                  <td className="px-6 py-4">Cup / Cone</td>
                  <td className="px-6 py-4">Inner</td>
                  <td className="px-6 py-4">59.13mm</td>
                  <td className="px-6 py-4">31.75mm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">LM (Holden)</td>
                  <td className="px-6 py-4 text-[#E53E00]">LM11910 / LM11949</td>
                  <td className="px-6 py-4">Cup / Cone</td>
                  <td className="px-6 py-4">Outer</td>
                  <td className="px-6 py-4">45.24mm</td>
                  <td className="px-6 py-4">19.05mm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">Slimline (Ford)</td>
                  <td className="px-6 py-4 text-[#E53E00]">L68110 / L68149</td>
                  <td className="px-6 py-4">Cup / Cone</td>
                  <td className="px-6 py-4">Inner</td>
                  <td className="px-6 py-4">59.13mm</td>
                  <td className="px-6 py-4">35.00mm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">Slimline (Ford)</td>
                  <td className="px-6 py-4 text-[#E53E00]">LM12710 / LM12749</td>
                  <td className="px-6 py-4">Cup / Cone</td>
                  <td className="px-6 py-4">Outer</td>
                  <td className="px-6 py-4">45.24mm</td>
                  <td className="px-6 py-4">22.00mm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">Parallel</td>
                  <td className="px-6 py-4 text-[#E53E00]">L68110 / L68149</td>
                  <td className="px-6 py-4">Cup / Cone</td>
                  <td className="px-6 py-4">Inner & Outer</td>
                  <td className="px-6 py-4">59.13mm</td>
                  <td className="px-6 py-4">35.00mm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-20" id="axles">
        <h2 className="font-display font-bold text-3xl text-[#1A1A2E] mb-6">Drop Axles Explained</h2>
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm text-[#4B5563] space-y-4">
          <p>
            Drop beam axles provide a lower ride height than a standard straight or overlay beam axle. Using a drop plate, the stub axle 
            and axle shaft are welded onto either side, allowing for a lower ground clearance. These are typically used for car carriers, 
            race car trailers, and horse floats where a lower center of gravity is crucial for stability and easy loading.
          </p>
          <h4 className="font-bold text-[#1A1A2E] pt-4">Benefits of Drop Axles:</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Improved Handling:</strong> Lowering the center of gravity drastically reduces the chance of trailer sway and tipping.</li>
            <li><strong>Easier Loading:</strong> Essential for loading low clearance vehicles (like race cars) without scraping the ramp.</li>
            <li><strong>Aesthetics:</strong> Provides a sleeker, more streamlined appearance.</li>
          </ul>
          <p className="pt-4 text-sm text-[#9CA3AF]">
            Note: Ensure your drop axle load rating matches your intended ATM. Aurex typically stocks 2" and 4" drops in both 45mm and 50mm square profiles.
          </p>
        </div>
      </div>
    </div>
  );
}
