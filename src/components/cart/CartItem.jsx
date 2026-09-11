import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "../../store/shop.jsx";
import { useProducts } from "../../store/products.jsx";
import { SafeImg } from "../ui.jsx";

export default function CartItem({ item, onRemove }) {
  const { updateQuantity, add } = useShop();
  const { products: PRODUCTS } = useProducts();
  const product = PRODUCTS.find((p) => p.sku === item.sku);

  if (!product) return null;

  const handleQuantityChange = (newQty) => {
    if (newQty <= 0) {
      onRemove(item.sku);
    } else {
      updateQuantity(item.sku, newQty);
    }
  };

  const handleIncrement = () => {
    handleQuantityChange(item.qty + 1);
  };

  const handleDecrement = () => {
    handleQuantityChange(item.qty - 1);
  };

  const itemTotal = product.price * item.qty;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3 flex gap-3"
    >
      <Link to={`/product/${item.sku}`} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
        <SafeImg
          src={product.image}
          alt={product.name}
          label={product.sku}
          className="w-full h-full object-cover"
          wrapClass="w-full h-full"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/product/${item.sku}`} className="font-semibold text-sm text-[#1A1A2E] hover:text-[#E53E00] transition line-clamp-2">
              {product.name}
            </Link>
            <p className="text-xs text-[#9CA3AF] mt-1">{product.sku}</p>
          </div>
          <button
            onClick={() => onRemove(item.sku)}
            className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444] transition shrink-0"
            aria-label="Remove item"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 grid place-items-center rounded-l-lg hover:bg-[#F5F6F8] transition text-[#6B7280]"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-display font-bold text-sm text-[#1A1A2E]">{item.qty}</span>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 grid place-items-center rounded-r-lg hover:bg-[#F5F6F8] transition text-[#6B7280]"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-right">
            <p className="font-display font-bold text-[#1A1A2E]">${itemTotal.toFixed(2)}</p>
            {product.oldPrice && (
              <p className="text-xs text-[#9CA3AF] line-through">${(product.oldPrice * item.qty).toFixed(2)}</p>
            )}
          </div>
        </div>

        {product.stock && !product.stock.includes("In stock") && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#EF4444]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            {product.stock}
          </div>
        )}
      </div>
    </motion.div>
  );
}