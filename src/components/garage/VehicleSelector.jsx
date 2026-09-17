import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, ChevronDown, Check, Trash2, Plus } from "lucide-react";
import { useGarage } from "./GarageContext.jsx";

export default function VehicleSelector({ compact = false }) {
  const { vehicles, selectedVehicleId, selectVehicle, addVehicle, removeVehicle } = useGarage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectVehicle = (vehicleId) => {
    selectVehicle(vehicleId);
    setIsOpen(false);
  };

  const handleAddNewVehicle = () => {
    // This would typically open a modal or expand the YMM widget
    // For now, we'll trigger the YMM widget expansion
    const event = new CustomEvent('open-ymm-widget');
    window.dispatchEvent(event);
    setIsOpen(false);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-[#F5F6F8] border border-[#E5E7EB] rounded-lg px-3 py-2 hover:border-[#0B2F5C] transition"
        >
          <Car size={16} className="text-[#0B2F5C]" />
          <span className="text-sm font-semibold text-[#1A1A2E]">
            {selectedVehicle 
              ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
              : "Select Vehicle"
            }
          </span>
          <ChevronDown size={14} className="text-[#9CA3AF]" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-xl shadow-elevated z-50 overflow-hidden"
            >
              {vehicles.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-[#6B7280]">No vehicles saved</p>
                  <button
                    onClick={handleAddNewVehicle}
                    className="mt-2 text-sm font-semibold text-[#0B2F5C] hover:text-[#071E3C] flex items-center gap-1 mx-auto"
                  >
                    <Plus size={14} /> Add Vehicle
                  </button>
                </div>
              ) : (
                <div className="max-h-64 overflow-auto">
                  {vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleSelectVehicle(vehicle.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F7F8FA] transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Car size={16} className="text-[#9CA3AF]" />
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          {vehicle.engine && (
                            <p className="text-xs text-[#6B7280]">{vehicle.engine}</p>
                          )}
                        </div>
                      </div>
                      {vehicle.id === selectedVehicleId && (
                        <Check size={16} className="text-[#10B981]" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={handleAddNewVehicle}
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm font-semibold text-[#0B2F5C] hover:bg-[#E8EEF5] transition border-t border-[#E5E7EB]"
                  >
                    <Plus size={14} /> Add New Vehicle
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-[#1A1A2E]">My Vehicles</h3>
        <button
          onClick={handleAddNewVehicle}
          className="text-sm font-semibold text-[#0B2F5C] hover:text-[#071E3C] flex items-center gap-1"
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-6">
          <Car size={32} className="text-[#E5E7EB] mx-auto mb-2" />
          <p className="text-sm text-[#6B7280]">No vehicles saved yet</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Add your vehicle to see compatible parts</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-auto">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-3 rounded-lg border transition ${
                vehicle.id === selectedVehicleId
                  ? "border-[#10B981] bg-[#10B981]/5"
                  : "border-[#E5E7EB] hover:border-[#0B2F5C]"
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleSelectVehicle(vehicle.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Car size={18} className={vehicle.id === selectedVehicleId ? "text-[#10B981]" : "text-[#9CA3AF]"} />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    {vehicle.engine && (
                      <p className="text-xs text-[#6B7280]">{vehicle.engine}</p>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  {vehicle.id === selectedVehicleId && (
                    <Check size={16} className="text-[#10B981]" />
                  )}
                  <button
                    onClick={() => removeVehicle(vehicle.id)}
                    className="p-1.5 rounded hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444] transition"
                    title="Remove vehicle"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}