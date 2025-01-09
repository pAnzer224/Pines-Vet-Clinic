import React, { useState, useEffect } from "react";
import ToggleSwitch from "../../../components/ToggleSwitch";
import { Calendar, Store, UserPlus, ShoppingCart } from "lucide-react";

const NotificationsTab = () => {
  const icons = {
    appointments: Calendar,
    shop: Store,
    signup: UserPlus,
    userOrders: ShoppingCart,
  };

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

  const [selectedTab, setSelectedTab] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    setShowModal(false);
  };

  const openModal = (page) => {
    setSelectedTab(page);
    setShowModal(true);
  };

  return (
    <div className="w-full px-4 md:px-6 py-4 mb-4">
      <p className="text-text/60 mb-6 text-left font-nunito-semibold tracking-wide max-sm:text-sm">
        Manage your notification overlays and customize messages for different
        sections of your application.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(overlaySettings).map(([page, settings]) => {
          const Icon = icons[page];
          return (
            <div
              key={page}
              onClick={() => openModal(page)}
              className="p-10 bg-background/95 rounded-lg border-2 border-green3/30 cursor-pointer hover:border-green2 transition-colors"
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon size={24} className="text-green2" />
                <span className="font-nunito-semibold text-text/80 capitalize">
                  {page.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <ToggleSwitch
                  isEnabled={settings.isEnabled}
                  onToggle={(e) => {
                    e.stopPropagation();
                    handleOverlayUpdate(page, "isEnabled", !settings.isEnabled);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selectedTab && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[100] h-screen w-screen" />
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="w-full max-w-md mx-auto bg-background rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-nunito-semibold text-lg capitalize">
                    {selectedTab.replace(/([A-Z])/g, " $1").trim()} Settings
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-text/60 hover:text-text"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-nunito-semibold text-text/80 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={overlaySettings[selectedTab].title}
                      onChange={(e) =>
                        handleOverlayUpdate(
                          selectedTab,
                          "title",
                          e.target.value
                        )
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
                      value={overlaySettings[selectedTab].message}
                      onChange={(e) =>
                        handleOverlayUpdate(
                          selectedTab,
                          "message",
                          e.target.value
                        )
                      }
                      className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                      placeholder="Enter overlay message"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={saveOverlaySettings}
                    className="w-full px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito-semibold"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsTab;
