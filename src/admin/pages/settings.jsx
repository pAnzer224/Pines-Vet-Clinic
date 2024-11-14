import React, { useState } from "react";
import { Settings2, Building2, Lock, UserCircle2, Bell } from "lucide-react";

function SettingsSection({ title, children, icon: Icon }) {
  return (
    <div className="bg-background p-6 rounded-xl border-2 border-green3">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="text-primary size-6" />
        <h2 className="text-xl font-nunito-bold text-green2">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block font-nunito text-text mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border-[1.6px] border-green2 bg-background font-nunito focus:border-primary focus:outline-none transition-colors text-text"
      />
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer mb-4">
      <span className="font-nunito text-text">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div
          className={`block w-14 h-8 rounded-full ${
            checked ? "bg-primary" : "bg-green3"
          }`}
        />
        <div
          className={`absolute left-1 top-1 bg-background w-6 h-6 rounded-full transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}

function Settings() {
  const [businessInfo, setBusinessInfo] = useState({
    name: "PawCare Clinic",
    address: "123 Pet Street",
    phone: "+1 234-567-8900",
    email: "contact@pawcare.com",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
  });

  const handleSave = (section) => {
    // Handle saving logic here
    console.log(`Saving ${section}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Settings</h1>
        <div className="flex items-center mt-5">
          <Settings2 className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your clinic settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingsSection title="Business Information" icon={Building2}>
          <InputField
            label="Business Name"
            value={businessInfo.name}
            onChange={(e) =>
              setBusinessInfo({ ...businessInfo, name: e.target.value })
            }
          />
          <InputField
            label="Address"
            value={businessInfo.address}
            onChange={(e) =>
              setBusinessInfo({ ...businessInfo, address: e.target.value })
            }
          />
          <InputField
            label="Phone Number"
            value={businessInfo.phone}
            onChange={(e) =>
              setBusinessInfo({ ...businessInfo, phone: e.target.value })
            }
          />
          <InputField
            label="Email"
            type="email"
            value={businessInfo.email}
            onChange={(e) =>
              setBusinessInfo({ ...businessInfo, email: e.target.value })
            }
          />
          <button
            onClick={() => handleSave("business")}
            className="w-full px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-nunito"
          >
            Save Changes
          </button>
        </SettingsSection>

        <div className="space-y-6">
          <SettingsSection title="Account Security" icon={Lock}>
            <InputField
              label="Current Password"
              type="password"
              placeholder="Enter current password"
            />
            <InputField
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />
            <InputField
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
            <button
              onClick={() => handleSave("security")}
              className="w-full px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-nunito"
            >
              Update Password
            </button>
          </SettingsSection>

          <SettingsSection title="Notifications" icon={Bell}>
            <ToggleSwitch
              label="Email Notifications"
              checked={notifications.emailNotifications}
              onChange={() =>
                setNotifications({
                  ...notifications,
                  emailNotifications: !notifications.emailNotifications,
                })
              }
            />
            <ToggleSwitch
              label="Appointment Reminders"
              checked={notifications.appointmentReminders}
              onChange={() =>
                setNotifications({
                  ...notifications,
                  appointmentReminders: !notifications.appointmentReminders,
                })
              }
            />
            <ToggleSwitch
              label="Marketing Emails"
              checked={notifications.marketingEmails}
              onChange={() =>
                setNotifications({
                  ...notifications,
                  marketingEmails: !notifications.marketingEmails,
                })
              }
            />
            <button
              onClick={() => handleSave("notifications")}
              className="w-full px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-nunito"
            >
              Save Preferences
            </button>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

export default Settings;
