import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { matchFit } from "../../data/fitment.js";

const GarageCtx = createContext(null);

const GARAGE_KEY = "aurex_garage_v1";

const DEFAULT_VEHICLE = {
  year: "",
  make: "",
  model: "",
  engine: "",
  vin: "",
  validated: false
};

export function GarageProvider({ children }) {
  const [vehicles, setVehicles] = useState(() => {
    try {
      const stored = localStorage.getItem(GARAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    try {
      const stored = localStorage.getItem(GARAGE_KEY + "_selected");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(GARAGE_KEY, JSON.stringify(vehicles));
    } catch {}
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(GARAGE_KEY + "_selected", JSON.stringify(selectedVehicleId));
    } catch {}
  }, [selectedVehicleId]);

  const addVehicle = (vehicleData) => {
    const newVehicle = {
      id: Date.now().toString(),
      ...DEFAULT_VEHICLE,
      ...vehicleData,
      addedAt: new Date().toISOString()
    };
    setVehicles((prev) => [...prev, newVehicle]);
    setSelectedVehicleId(newVehicle.id);
    return newVehicle;
  };

  const updateVehicle = (id, updates) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const removeVehicle = (id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (selectedVehicleId === id) {
      setSelectedVehicleId(null);
    }
  };

  const selectVehicle = (id) => {
    setSelectedVehicleId(id);
  };

  const clearSelectedVehicle = () => {
    setSelectedVehicleId(null);
  };

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  const hasValidVehicle = useMemo(() => {
    return Boolean(selectedVehicle && selectedVehicle.make && selectedVehicle.model);
  }, [selectedVehicle]);

  // Fit state of one product against the selected truck: fits | universal | no | unknown.
  const fitStatus = useCallback((product) => matchFit(product, selectedVehicle), [selectedVehicle]);

  const value = useMemo(() => ({
    vehicles,
    selectedVehicle,
    selectedVehicleId,
    hasValidVehicle,
    fitStatus,
    addVehicle,
    updateVehicle,
    removeVehicle,
    selectVehicle,
    clearSelectedVehicle
  }), [vehicles, selectedVehicle, selectedVehicleId, hasValidVehicle, fitStatus]);

  return <GarageCtx.Provider value={value}>{children}</GarageCtx.Provider>;
}

export const useGarage = () => useContext(GarageCtx);