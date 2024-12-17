import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

function StatusDropdown({
  statusOptions,
  selectedStatus,
  onStatusChange,
  className,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleStatusSelect = (status) => {
    onStatusChange(status);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className={`relative w-full md:w-64 font-nunito-bold ${className || ""}`}
    >
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full px-4 py-2 bg-green3 text-text rounded-xl hover:bg-green3/80 transition-colors border-[1.6px] border-green2 flex items-center justify-between font-nunito"
      >
        <span>{selectedStatus}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 border-[1.6px] border-green2 rounded-xl shadow-lg z-50">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              className="w-full px-4 py-2 text-left hover:bg-green3/20 text-text transition-colors first:rounded-t-xl last:rounded-b-xl font-nunito"
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusDropdown;
