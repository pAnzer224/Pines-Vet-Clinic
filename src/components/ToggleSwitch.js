import React from "react";

const ToggleSwitch = ({ isEnabled, onToggle, className = "" }) => {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors ${
        isEnabled ? "bg-green2" : "bg-gray-200"
      } ${className}`}
    >
      <div
        className={`w-5 h-5 bg-background rounded-full transform transition-transform ${
          isEnabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;
