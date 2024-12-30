import React from "react";

const FeatureOverlay = ({ isEnabled = true, title, message }) => {
  if (!isEnabled) return null;

  return (
    <div className="fixed top-[110px] inset-x-0 bottom-0 bg-text/50 backdrop-blur-sm z-[19]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background p-8 rounded-xl shadow-lg max-w-md w-full mx-4 border-2 border-primary/80">
          <h2 className="text-2xl font-nunito-bold text-green2 mb-3">
            {title}
          </h2>
          <p className="text-text/80 font-nunito-semibold text-md">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureOverlay;
