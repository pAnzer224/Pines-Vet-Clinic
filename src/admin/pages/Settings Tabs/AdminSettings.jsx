import React, { useState } from "react";
import { Settings, Bell, Shield, Calendar } from "lucide-react";

// Import tab components - these will be created separately
import NotificationsTab from "./NotificationsTab";
import SecurityTab from "./SecurityTab";
import SchedulingTab from "./SchedulingTab";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("notifications");

  const tabs = [
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      component: NotificationsTab,
    },
    { id: "security", icon: Shield, label: "Security", component: SecurityTab },
    {
      id: "scheduling",
      icon: Calendar,
      label: "Scheduling",
      component: SchedulingTab,
    },
  ];

  const ActiveTabComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || NotificationsTab;

  return (
    <div className="space-y-4 md:space-y-6 mt-8 md:mt-14">
      <div className="px-4 md:px-0">
        <h1 className="text-xl md:text-2xl font-nunito-bold text-green2">
          Settings
        </h1>
        <div className="flex items-center mt-3 md:mt-5">
          <Settings className="mr-2 text-primary w-5 h-5 md:w-7 md:h-7" />
          <p className="text-lg md:text-xl text-primary font-nunito-bold tracking-wide">
            Manage your admin settings
          </p>
        </div>
      </div>

      <div className="bg-background border-[1.6px] border-green2 rounded-xl mx-2 md:mx-0">
        <div className="flex overflow-x-auto border-b border-green3/30 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center min-w-fit px-3 md:px-6 py-3 md:py-4 font-nunito-semibold tracking-wide transition-colors ${
                activeTab === tab.id
                  ? "text-green2 border-b-2 border-green2"
                  : "text-text/60 hover:text-green2/80"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-1.5 md:mr-2 flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6">
          <ActiveTabComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
