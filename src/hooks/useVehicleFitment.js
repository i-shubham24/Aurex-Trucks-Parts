import { useState, useEffect } from "react";
import { useGarage } from "../components/garage/GarageContext.jsx";
import { useProducts } from "../store/products.jsx";

export function useVehicleFitment() {
  const { selectedVehicle, hasValidVehicle } = useGarage();
  const { products: PRODUCTS } = useProducts();
  const [compatibleProducts, setCompatibleProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasValidVehicle) {
      setCompatibleProducts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call for vehicle fitment
    const checkFitment = async () => {
      try {
        // In a real implementation, this would call an API
        // For now, we'll simulate fitment based on product categories
        await new Promise(resolve => setTimeout(resolve, 500));

        const compatible = PRODUCTS.filter(product => {
          // Simulate fitment logic - in production this would use actual fitment data
          const fitmentScore = Math.random();
          return fitmentScore > 0.3; // 70% chance of compatibility for demo
        });

        setCompatibleProducts(compatible);
      } catch (err) {
        setError("Failed to check vehicle fitment");
        console.error("Fitment check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkFitment();
  }, [selectedVehicle, hasValidVehicle, PRODUCTS]);

  const checkProductFitment = (product) => {
    if (!hasValidVehicle) return { compatible: null, confidence: 0 };

    // Simulate fitment check for individual product
    const confidence = Math.random() * 100;
    const compatible = confidence > 30;

    return {
      compatible,
      confidence: Math.round(confidence),
      notes: compatible 
        ? "Based on vehicle specifications, this part should fit" 
        : "This part may not be compatible with your vehicle"
    };
  };

  const getFitmentNotes = (product) => {
    const result = checkProductFitment(product);
    if (result.compatible === null) {
      return "Add your vehicle to see fitment information";
    }
    return result.notes;
  };

  return {
    selectedVehicle,
    hasValidVehicle,
    compatibleProducts,
    isLoading,
    error,
    checkProductFitment,
    getFitmentNotes
  };
}