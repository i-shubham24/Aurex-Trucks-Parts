import { BookOpen, FileText, Settings, Download } from "lucide-react";

export function ResourcesPage() {
  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      <div className="bg-[#222538] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl">Technical Resources</h1>
          <p className="text-[#9CA3AF] mt-4 max-w-2xl mx-auto text-lg">
            Expert guides, specifications, and measuring charts for tail lifts, door gear, tracks and tool boxes.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
            <div className="w-12 h-12 bg-[#134E8D]/10 rounded-xl flex items-center justify-center mb-4 text-[#134E8D]">
              <Settings size={24} />
            </div>
            <h3 className="font-bold text-[#222538] text-lg">Tail Lift Selector</h3>
            <p className="text-sm text-[#6B7280] mt-2 mb-4">
              Match capacity, platform size and body type across our 1.5T to 3T lifts.
            </p>
            <a href="#taillifts" className="text-[#134E8D] font-semibold text-sm hover:underline">View Chart &rarr;</a>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
            <div className="w-12 h-12 bg-[#134E8D]/10 rounded-xl flex items-center justify-center mb-4 text-[#134E8D]">
              <BookOpen size={24} />
            </div>
            <h3 className="font-bold text-[#222538] text-lg">Door Gear Guide</h3>
            <p className="text-sm text-[#6B7280] mt-2 mb-4">
              Left and right locking gear, latch options and stainless upgrades explained.
            </p>
            <a href="#doorgear" className="text-[#134E8D] font-semibold text-sm hover:underline">Read Guide &rarr;</a>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
            <div className="w-12 h-12 bg-[#134E8D]/10 rounded-xl flex items-center justify-center mb-4 text-[#134E8D]">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-[#222538] text-lg">Track Measuring Form</h3>
            <p className="text-sm text-[#6B7280] mt-2 mb-4">
              Download our Q track and F track order form to submit lengths and quantities.
            </p>
            <button className="text-[#134E8D] font-semibold text-sm hover:underline flex items-center gap-1">
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-20" id="taillifts">
        <h2 className="font-display font-bold text-3xl text-[#222538] mb-6">Tail Lift Range & Specs</h2>
        <div className="prose prose-slate max-w-none text-[#4B5563]">
          <p>
            Choose capacity first, then platform size. All lifts run 24V with zinc-nickel
            cylinders, safety valves and galvanized brackets, and ship with warning light,
            anti-slip plate, foot controller, seal kit and locking latch.
          </p>
          
          <div className="overflow-x-auto mt-8 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#222538]">SKU</th>
                  <th className="px-6 py-4 font-semibold text-[#222538]">Capacity</th>
                  <th className="px-6 py-4 font-semibold text-[#222538]">Platform</th>
                  <th className="px-6 py-4 font-semibold text-[#222538]">Material</th>
                  <th className="px-6 py-4 font-semibold text-[#222538]">Voltage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[#134E8D]">TL-20-2450-2400</td>
                  <td className="px-6 py-4 font-medium">2.0T</td>
                  <td className="px-6 py-4">W2450 x H2400</td>
                  <td className="px-6 py-4">Aluminium</td>
                  <td className="px-6 py-4">24V</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[#134E8D]">TL-20-2450-2200</td>
                  <td className="px-6 py-4 font-medium">2.0T</td>
                  <td className="px-6 py-4">W2450 x H2200</td>
                  <td className="px-6 py-4">Aluminium</td>
                  <td className="px-6 py-4">24V</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[#134E8D]">TL-20-2450-2600</td>
                  <td className="px-6 py-4 font-medium">2.0T</td>
                  <td className="px-6 py-4">W2450 x H2600</td>
                  <td className="px-6 py-4">Aluminium</td>
                  <td className="px-6 py-4">24V</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[#134E8D]">TL-15-2450-2400</td>
                  <td className="px-6 py-4 font-medium">1.5T</td>
                  <td className="px-6 py-4">W2450 x H2400</td>
                  <td className="px-6 py-4">Aluminium</td>
                  <td className="px-6 py-4">24V</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[#134E8D]">TL-30-2450-2600-S</td>
                  <td className="px-6 py-4 font-medium">3.0T</td>
                  <td className="px-6 py-4">W2450 x H2600</td>
                  <td className="px-6 py-4">Steel</td>
                  <td className="px-6 py-4">24V</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-20" id="doorgear">
        <h2 className="font-display font-bold text-3xl text-[#222538] mb-6">Door Gear & Hinges Explained</h2>
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm text-[#4B5563] space-y-4">
          <p>
            Door locking gear is sold left and right. Keep the sides distinct: GL-11113
            ships as a 200L plus 200R set, GL-11113-NL is the same gear without latch,
            and GL-11113S is the 304 stainless upgrade in 50L plus 50R for marine and
            corrosive routes.
          </p>
          <h4 className="font-bold text-[#222538] pt-4">Hinge sizing basics:</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>GL-13112 / GL-13198B:</strong> pressed steel hinges for trailer doors and body panels.</li>
            <li><strong>GL-13213 (228mm):</strong> steel hinges for doors and tailgates.</li>
            <li><strong>GL-13195S (235mm, 304 stainless):</strong> corrosion-proof hinge for marine bodies.</li>
            <li><strong>A02-01S-01:</strong> polished 304 stainless side door hinge.</li>
          </ul>
          <p className="pt-4 text-sm text-[#9CA3AF]">
            Note: Q track and F track run 4.5m per piece. End caps GL-19116 and GL-19116B are not interchangeable, check the variant before ordering.
          </p>
        </div>
      </div>
    </div>
  );
}
