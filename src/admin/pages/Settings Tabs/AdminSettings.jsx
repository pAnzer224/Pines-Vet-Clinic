import React, { useState } from "react";
import { Settings, Bell, Shield, Store, Calendar } from "lucide-react";

// Import tab components - these will be created separately
import NotificationsTab from "./NotificationsTab";
import SecurityTab from "./SecurityTab";
import BusinessTab from "./BusinessTab";
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
    { id: "business", icon: Store, label: "Business", component: BusinessTab },
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
    <div className="space-y-6 mt-14">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Settings</h1>
        <div className="flex items-center mt-5">
          <Settings className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your admin settings and preferences
          </p>
        </div>
      </div>

      <div className="bg-background border-[1.6px] border-green2 rounded-xl">
        <div className="flex border-b border-green3/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 font-nunito-semibold tracking-wide ${
                activeTab === tab.id
                  ? "text-green2 border-b-2 border-green2"
                  : "text-text/60 hover:text-green2/80"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <ActiveTabComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
