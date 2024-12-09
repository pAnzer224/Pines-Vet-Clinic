import React, { useState } from "react";
import { Settings2, Building2, Lock, Bell } from "lucide-react";
import { toast } from "react-toastify";

// Reusable section component for grouping related settings
function SettingsSection({ title, children, icon: Icon }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="text-green2" size={24} />
        <h2 className="text-lg font-nunito-bold text-green2">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Reusable input field component with consistent styling
function InputField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-nunito-bold text-green2 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border-2 border-green3/60 bg-background font-nunito-medium text-xs focus:border-primary focus:outline-none transition-colors text-primary"
      />
    </div>
  );
}

// Custom toggle switch component for boolean settings
function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer mb-4">
      <span className="text-xs font-nunito-medium text-green2">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        {/* Toggle background */}
        <div
          className={`block w-12 h-6 rounded-full transition-colors ${
            checked ? "bg-green3" : "bg-green3/30"
          }`}
        />
        {/* Toggle circle */}
        <div
          className={`absolute left-1 top-1 bg-background size-4 rounded-full transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}

function Settings() {
  // business info
  const [businessInfo, setBusinessInfo] = useState({
    name: "Highland Petvibes",
    address: "Maginhawa Branch 208 Lower East Camp 7",
    phone: "349-0091, 917-1522",
    email: "info@petvibes.com",
  });

  // State for notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
  });

  // State for credential management
  const [credentialInfo, setCredentialInfo] = useState({
    currentAdminId: "",
    currentPassword: "",
    newAdminId: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Handler for saving changes in different sections
  const handleSave = (section) => {
    switch (section) {
      case "business":
        console.log("Saving business info...", businessInfo);
        toast.success("Business information updated successfully");
        break;

      case "security":
        // Validate credential change
        const storedCredentials = JSON.parse(
          localStorage.getItem("adminCredentials") || "{}"
        );

        // Check current credentials
        if (
          credentialInfo.currentAdminId !== storedCredentials.adminId ||
          credentialInfo.currentPassword !== storedCredentials.password
        ) {
          toast.error("Current credentials are incorrect");
          return;
        }

        // Validate new password
        if (credentialInfo.newPassword !== credentialInfo.confirmNewPassword) {
          toast.error("New passwords do not match");
          return;
        }

        // Update credentials in local storage
        const newCredentials = {
          adminId: credentialInfo.newAdminId || storedCredentials.adminId,
          password: credentialInfo.newPassword || storedCredentials.password,
        };

        localStorage.setItem(
          "adminCredentials",
          JSON.stringify(newCredentials)
        );

        // Clear input fields
        setCredentialInfo({
          currentAdminId: "",
          currentPassword: "",
          newAdminId: "",
          newPassword: "",
          confirmNewPassword: "",
        });

        toast.success("Credentials updated successfully");
        break;

      case "notifications":
        console.log("Saving notifications...", notifications);
        toast.success("Notification preferences updated");
        break;

      default:
        break;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Page header section */}
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Settings</h1>
        <div className="flex items-center mt-5">
          <Settings2 className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your clinic settings
          </p>
        </div>
      </div>

      {/* Main settings grid layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 tracking-wide">
        {/* Business Information Section */}
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
          {/* Save button for business info */}
          <button
            onClick={() => handleSave("business")}
            className="w-full px-4 py-2 bg-green3 text-background rounded-md hover:bg-green3/80 transition-colors font-nunito-bold text-sm"
          >
            Save Changes
          </button>
        </SettingsSection>

        {/* Right column containing Security and Notifications */}
        <div className="space-y-6">
          {/* Security Section */}
          <SettingsSection title="Account Security" icon={Lock}>
            <InputField
              label="Current Admin ID"
              value={credentialInfo.currentAdminId}
              onChange={(e) =>
                setCredentialInfo({
                  ...credentialInfo,
                  currentAdminId: e.target.value,
                })
              }
            />
            <InputField
              label="Current Password"
              type="password"
              value={credentialInfo.currentPassword}
              onChange={(e) =>
                setCredentialInfo({
                  ...credentialInfo,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter current password"
            />
            <InputField
              label="New Admin ID (Optional)"
              value={credentialInfo.newAdminId}
              onChange={(e) =>
                setCredentialInfo({
                  ...credentialInfo,
                  newAdminId: e.target.value,
                })
              }
              placeholder="Enter new admin ID"
            />
            <InputField
              label="New Password"
              type="password"
              value={credentialInfo.newPassword}
              onChange={(e) =>
                setCredentialInfo({
                  ...credentialInfo,
                  newPassword: e.target.value,
                })
              }
              placeholder="Enter new password"
            />
            <InputField
              label="Confirm New Password"
              type="password"
              value={credentialInfo.confirmNewPassword}
              onChange={(e) =>
                setCredentialInfo({
                  ...credentialInfo,
                  confirmNewPassword: e.target.value,
                })
              }
              placeholder="Confirm new password"
            />
            {/* Save button for security settings */}
            <button
              onClick={() => handleSave("security")}
              className="w-full px-4 py-2 bg-green3 text-background rounded-md hover:bg-green3/80 transition-colors font-nunito-bold text-sm"
            >
              Update Credentials
            </button>
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection title="Notifications" icon={Bell}>
            {/* Email notification toggles */}
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
            {/* Save button for notification preferences */}
            <button
              onClick={() => handleSave("notifications")}
              className="w-full px-4 py-2 bg-green3 text-background rounded-md hover:bg-green3/80 transition-colors font-nunito-bold mt-4 text-sm"
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
