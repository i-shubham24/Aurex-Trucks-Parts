import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../store/products.jsx";
import { useSite } from "../store/site.jsx";

export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products: PRODUCTS } = useProducts();
  const { liveCategories: CATEGORIES } = useSite();

  // Initialize filter state from URL params
  const [filters, setFilters] = useState({
    category: searchParams.get("cat") || "All",
    brand: searchParams.get("brand") || "All brands",
    priceRange: [
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 1600
    ],
    inStockOnly: searchParams.get("inStock") === "true",
    query: searchParams.get("q") || ""
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.category !== "All") params.set("cat", filters.category);
    if (filters.brand !== "All brands") params.set("brand", filters.brand);
    if (filters.priceRange[0] > 0) params.set("minPrice", filters.priceRange[0]);
    if (filters.priceRange[1] < 1600) params.set("maxPrice", filters.priceRange[1]);
    if (filters.inStockOnly) params.set("inStock", "true");
    if (filters.query) params.set("q", filters.query);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const categoryMatch = filters.category === "All" || product.cat === filters.category;
      const brandMatch = filters.brand === "All brands" || product.brand === filters.brand;
      const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const stockMatch = !filters.inStockOnly || product.stock?.includes("In stock");
      const queryMatch = !filters.query || 
        (product.name + " " + product.sku + " " + (product.brand || "")).toLowerCase().includes(filters.query.toLowerCase());

      return categoryMatch && brandMatch && priceMatch && stockMatch && queryMatch;
    });
  }, [PRODUCTS, filters]);

  // Get available brands for current category
  const availableBrands = useMemo(() => {
    const categoryProducts = filters.category === "All" 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.cat === filters.category);
    
    return Array.from(new Set(categoryProducts.map(p => p.brand).filter(Boolean)));
  }, [PRODUCTS, filters.category]);

  // Update individual filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: "All",
      brand: "All brands",
      priceRange: [0, 1600],
      inStockOnly: false,
      query: ""
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.category !== "All" ||
           filters.brand !== "All brands" ||
           filters.priceRange[0] > 0 ||
           filters.priceRange[1] < 1600 ||
           filters.inStockOnly ||
           filters.query !== "";
  }, [filters]);

  // Get filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "All") count++;
    if (filters.brand !== "All brands") count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1600) count++;
    if (filters.inStockOnly) count++;
    if (filters.query) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredProducts,
    availableBrands,
    categories: CATEGORIES,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    setFilters
  };
}