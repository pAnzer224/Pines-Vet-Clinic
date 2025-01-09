import React from "react";

const ToggleSwitch = ({ isEnabled, onToggle, className = "" }) => {
  return (
    <button
      onClick={onToggle}
      className={`min-w-[3rem] w-[3rem] h-[1.5rem] rounded-full transition-colors relative
        ${isEnabled ? "bg-green2" : "bg-gray-200"}
        ${className}
        sm:w-12 sm:h-6`}
    >
      <div
        className={`absolute top-[2px] w-[1.25rem] h-[1.25rem] bg-background rounded-full 
          transform transition-transform duration-200 ease-in-out
          ${isEnabled ? "translate-x-[1.5rem]" : "translate-x-[2px]"}
          sm:w-5 sm:h-5 sm:translate-x-1
          ${isEnabled ? "sm:translate-x-6" : "sm:translate-x-1"}`}
      />
    </button>
  );
};

export default ToggleSwitch;
