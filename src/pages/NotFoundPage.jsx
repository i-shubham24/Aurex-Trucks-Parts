import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4 py-16">
      <div className="text-center max-w-lg">
        <h1 className="font-display font-bold text-[80px] leading-none text-[#222538]">404</h1>
        <p className="font-display font-bold text-2xl mt-4 text-[#222538]">Page not found</p>
        <p className="text-sm text-[#6B7280] mt-3">
          The page or part you're looking for might have been moved or doesn't exist.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="bg-[#134E8D] text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#222538] transition">
            Back to homepage
          </Link>
          <Link to="/shop" className="bg-white text-[#222538] border-2 border-[#E5E7EB] px-6 py-3.5 rounded-xl font-bold text-sm hover:border-[#222538] transition flex items-center justify-center gap-2">
            <Search size={16} /> Browse catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
