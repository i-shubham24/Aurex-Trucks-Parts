import { useMemo } from "react";
import { useGarage } from "../components/garage/GarageContext.jsx";
import { useProducts } from "../store/products.jsx";

// Real fitment, driven by the garage. Replaces the earlier random placeholder.
export function useVehicleFitment() {
  const { selectedVehicle, hasValidVehicle, fitStatus } = useGarage();
  const { products: PRODUCTS } = useProducts();

  const compatibleProducts = useMemo(() => {
    if (!hasValidVehicle) return [];
    return PRODUCTS.filter((p) => ["fits", "universal"].includes(fitStatus(p)));
  }, [PRODUCTS, hasValidVehicle, fitStatus]);

  const checkProductFitment = (product) => {
    const status = fitStatus(product);
    return {
      status,
      compatible: status === "unknown" ? null : status !== "no",
      notes: {
        fits: "Confirmed fit for your truck.",
        universal: "Cross make part, fits your truck.",
        no: "Listed for other makes. Confirm before ordering.",
        unknown: "Add your truck to see fitment.",
      }[status],
    };
  };

  return { selectedVehicle, hasValidVehicle, compatibleProducts, checkProductFitment };
}
