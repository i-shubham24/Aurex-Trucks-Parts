import { Link } from "react-router-dom";
import { Truck, ShieldCheck, RotateCcw, ArrowRight, Lock } from "lucide-react";
import { useShop } from "../../store/shop.jsx";
import { useSite } from "../../store/site.jsx";

export default function CartSummary({ compact = false, showCheckout = true }) {
  const { count, total } = useShop();
  const { settings } = useSite();

  const freeFreightThreshold = settings?.freeFreightOver || 500;
  const remainingForFreeFreight = Math.max(0, freeFreightThreshold - total);
  const qualifiesForFreeFreight = total >= freeFreightThreshold;

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">Subtotal ({count} items)</p>
          <p className="font-display font-bold text-xl text-[#222538]">${total.toFixed(2)}</p>
        </div>
        {showCheckout && (
          <Link
            to="/checkout"
            className="bg-[#134E8D] text-white rounded-lg px-6 py-3 text-sm font-bold hover:bg-[#222538] transition flex items-center gap-2"
          >
            Checkout <ArrowRight size={16} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Free freight indicator */}
      <div className={`rounded-xl p-4 ${qualifiesForFreeFreight ? "bg-[#10B981]/10 border border-[#10B981]/20" : "bg-[#EDF3FA] border border-[#134E8D]/20"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${qualifiesForFreeFreight ? "bg-[#10B981]" : "bg-[#134E8D]"}`}>
            <Truck size={18} className="text-white" />
          </div>
          <div className="flex-1">
            {qualifiesForFreeFreight ? (
              <p className="text-sm font-bold text-[#10B981]">You qualify for free shipping!</p>
            ) : (
              <p className="text-sm font-bold text-[#134E8D]">
                Add ${remainingForFreeFreight.toFixed(2)} more for free shipping
              </p>
            )}
            <p className="text-xs text-[#6B7280] mt-0.5">
              {qualifiesForFreeFreight ? "Your order qualifies for free freight" : `Free freight on orders over $${freeFreightThreshold}`}
            </p>
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#6B7280]">Subtotal ({count} items)</span>
          <span className="font-semibold text-[#222538]">${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#6B7280]">Shipping</span>
          <span className="font-semibold text-[#222538]">
            {qualifiesForFreeFreight ? "FREE" : "Calculated at checkout"}
          </span>
        </div>
        <div className="border-t border-[#E5E7EB] pt-3">
          <div className="flex justify-between">
            <span className="font-bold text-[#222538]">Total</span>
            <span className="font-display font-bold text-2xl text-[#222538]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          [Truck, "Fast Dispatch"],
          [ShieldCheck, "Secure Payment"],
          [RotateCcw, "Easy Returns"]
        ].map(([Icon, label]) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center">
            <div className="w-8 h-8 rounded-lg bg-[#F5F6F8] flex items-center justify-center">
              <Icon size={14} className="text-[#134E8D]" />
            </div>
            <span className="text-[10px] font-semibold text-[#6B7280]">{label}</span>
          </div>
        ))}
      </div>

      {/* Checkout button */}
      {showCheckout && (
        <Link
          to="/checkout"
          className="w-full bg-[#134E8D] text-white rounded-xl py-4 text-sm font-bold hover:bg-[#222538] transition flex items-center justify-center gap-2"
        >
          Proceed to Checkout <ArrowRight size={16} />
        </Link>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
        <Lock size={12} />
        <span>Secure checkout powered by industry-standard encryption</span>
      </div>
    </div>
  );
}