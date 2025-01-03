import React, { useState, useEffect } from "react";

const NotificationsTab = () => {
  const [overlaySettings, setOverlaySettings] = useState({
    appointments: {
      isEnabled: false,
      title: "",
      message: "",
    },
    shop: {
      isEnabled: false,
      title: "",
      message: "",
    },
    signup: {
      isEnabled: false,
      title: "",
      message: "",
    },
    userOrders: {
      isEnabled: false,
      title: "",
      message: "",
    },
  });

  useEffect(() => {
    const savedOverlaySettings = localStorage.getItem("overlaySettings");
    if (savedOverlaySettings) {
      setOverlaySettings(JSON.parse(savedOverlaySettings));
    }
  }, []);

  const handleOverlayUpdate = (page, field, value) => {
    const newSettings = {
      ...overlaySettings,
      [page]: {
        ...overlaySettings[page],
        [field]: value,
      },
    };
    setOverlaySettings(newSettings);
    localStorage.setItem("overlaySettings", JSON.stringify(newSettings));
  };

  const saveOverlaySettings = () => {
    localStorage.setItem("overlaySettings", JSON.stringify(overlaySettings));
    alert("Overlay settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(overlaySettings).map(([page, settings]) => (
          <div
            key={page}
            className="p-4 bg-background/95 rounded-lg border border-green3/30"
          >
            <div className="flex items-center justify-between mb-4">
              <label className="font-nunito-semibold text-text/80 capitalize">
                {page.replace(/([A-Z])/g, " $1").trim()} Page Overlay
              </label>
              <button
                onClick={() =>
                  handleOverlayUpdate(page, "isEnabled", !settings.isEnabled)
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.isEnabled ? "bg-green2" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-background rounded-full transform transition-transform ${
                    settings.isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-nunito-semibold text-text/80 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) =>
                    handleOverlayUpdate(page, "title", e.target.value)
                  }
                  className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                  placeholder="Enter overlay title"
                />
              </div>

              <div>
                <label className="block font-nunito-semibold text-text/80 mb-2">
                  Message
                </label>
                <textarea
                  value={settings.message}
                  onChange={(e) =>
                    handleOverlayUpdate(page, "message", e.target.value)
                  }
                  className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                  placeholder="Enter overlay message"
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={saveOverlaySettings}
        className="px-4 py-2 bg-green2 text-white rounded-full hover:bg-green2/80 transition-colors font-nunito-semibold"
      >
        Save Overlay Settings
      </button>
    </div>
  );
};

export default NotificationsTab;
