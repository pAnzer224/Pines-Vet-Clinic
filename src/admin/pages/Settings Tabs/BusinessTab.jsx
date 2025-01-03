import React from "react";

const BusinessTab = () => {
  return (
    <div className="space-y-4">
      {["Business Name", "Contact Email", "Phone Number"].map((field) => (
        <div key={field} className="space-y-2">
          <label className="block font-nunito-semibold text-text/80">
            {field}
          </label>
          <input
            type={field === "Contact Email" ? "email" : "text"}
            className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
          />
        </div>
      ))}
      <button className="px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito">
        Save Business Information
      </button>
    </div>
  );
};

export default BusinessTab;
