import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Shield,
  Store,
  Calendar,
  Eye,
  EyeOff,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { db } from "../../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    currentAdminId: "",
    currentPassword: "",
    newAdminId: "",
    newPassword: "",
  });

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

  const [timeSlots, setTimeSlots] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState(30);

  useEffect(() => {
    const savedTimeout = localStorage.getItem("sessionTimeout");
    if (savedTimeout) {
      setSessionTimeout(parseInt(savedTimeout));
    }

    const savedOverlaySettings = localStorage.getItem("overlaySettings");
    if (savedOverlaySettings) {
      setOverlaySettings(JSON.parse(savedOverlaySettings));
    }

    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const timeSlotsRef = collection(db, "timeSlots");
      const snapshot = await getDocs(timeSlotsRef);
      const slots = snapshot.docs.map((doc) => ({
        id: doc.id,
        time: doc.data().time,
      }));
      setTimeSlots(slots.sort((a, b) => a.time.localeCompare(b.time)));
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const addTimeSlot = async () => {
    if (!newTimeSlot) return;
    try {
      const timeSlotsRef = collection(db, "timeSlots");
      await addDoc(timeSlotsRef, { time: newTimeSlot });
      setNewTimeSlot("");
      fetchTimeSlots();
    } catch (error) {
      console.error("Error adding time slot:", error);
    }
  };

  const deleteTimeSlot = async (id) => {
    try {
      await deleteDoc(doc(db, "timeSlots", id));
      fetchTimeSlots();
    } catch (error) {
      console.error("Error deleting time slot:", error);
    }
  };

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

  const handleCredentialsUpdate = (e) => {
    e.preventDefault();
    const savedAdminId = localStorage.getItem("adminId") || "admin123";
    const savedPassword =
      localStorage.getItem("adminPassword") || "password123";

    if (
      credentials.currentAdminId === savedAdminId &&
      credentials.currentPassword === savedPassword
    ) {
      localStorage.setItem("adminId", credentials.newAdminId);
      localStorage.setItem("adminPassword", credentials.newPassword);
      setCredentials({
        currentAdminId: "",
        currentPassword: "",
        newAdminId: "",
        newPassword: "",
      });
      alert("Admin credentials updated successfully!");
    } else {
      alert("Current admin ID or password is incorrect");
    }
  };

  const handleTimeoutUpdate = (value) => {
    const timeout = parseInt(value);
    setSessionTimeout(timeout);
    localStorage.setItem("sessionTimeout", timeout.toString());
    const adminAuthTime = new Date().getTime();
    localStorage.setItem("adminAuthTime", adminAuthTime.toString());
  };

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
          {["notifications", "security", "business", "scheduling"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center px-6 py-4 font-nunito-semibold tracking-wide ${
                  activeTab === tab
                    ? "text-green2 border-b-2 border-green2"
                    : "text-text/60 hover:text-green2/80"
                }`}
              >
                {tab === "notifications" && <Bell className="w-4 h-4 mr-2" />}
                {tab === "security" && <Shield className="w-4 h-4 mr-2" />}
                {tab === "business" && <Store className="w-4 h-4 mr-2" />}
                {tab === "scheduling" && <Calendar className="w-4 h-4 mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        <div className="p-6">
          {activeTab === "notifications" && (
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
                          handleOverlayUpdate(
                            page,
                            "isEnabled",
                            !settings.isEnabled
                          )
                        }
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings.isEnabled ? "bg-green2" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-background rounded-full transform transition-transform ${
                            settings.isEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
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
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="p-4 bg-background/95 rounded-lg border border-green3/30">
                <p className="font-nunito-semibold text-green2">
                  Current Admin ID:{" "}
                  {localStorage.getItem("adminId") || "admin123"}
                </p>
              </div>

              <form onSubmit={handleCredentialsUpdate} className="space-y-4">
                <h3 className="font-nunito-bold text-green2">
                  Change Admin Credentials
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-nunito-semibold text-text/80">
                      Current Admin ID
                    </label>
                    <input
                      type="text"
                      value={credentials.currentAdminId}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          currentAdminId: e.target.value,
                        })
                      }
                      className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-nunito-semibold text-text/80">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={credentials.currentPassword}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green2 hover:text-primary"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-nunito-semibold text-text/80">
                      New Admin ID
                    </label>
                    <input
                      type="text"
                      value={credentials.newAdminId}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          newAdminId: e.target.value,
                        })
                      }
                      className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-nunito-semibold text-text/80">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={credentials.newPassword}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green2 hover:text-primary"
                      >
                        {showNewPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito"
                >
                  Update Credentials
                </button>
              </form>

              <div className="space-y-4 p-4 bg-background/95 rounded-lg border border-green3/30">
                <h3 className="font-nunito-bold text-green2">
                  Session Settings
                </h3>
                <div className="space-y-2">
                  <label className="block font-nunito-semibold text-text/80">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => handleTimeoutUpdate(e.target.value)}
                    min={1}
                    max={120}
                    className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "scheduling" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-nunito-bold text-green2 mb-4">
                  Manage Time Slots
                </h3>

                <div className="flex gap-4 mb-4">
                  <input
                    type="time"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="p-2 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                  />
                  <button
                    onClick={addTimeSlot}
                    className="flex items-center gap-2 px-4 py-2 bg-green2 text-white rounded-full hover:bg-green2/80 transition-colors font-nunito-semibold"
                  >
                    <PlusCircle size={20} />
                    Add Time Slot
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-background/95 rounded-lg border border-green3/30"
                    >
                      <span className="font-nunito-semibold">{slot.time}</span>
                      <button
                        onClick={() => deleteTimeSlot(slot.id)}
                        className="text-red hover:text-red/80"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "business" && (
            <div className="space-y-4">
              {["Business Name", "Contact Email", "Phone Number"].map(
                (field) => (
                  <div key={field} className="space-y-2">
                    <label className="block font-nunito-semibold text-text/80">
                      {field}
                    </label>
                    <input
                      type={field === "Contact Email" ? "email" : "text"}
                      className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                    />
                  </div>
                )
              )}
              <button className="px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito">
                Save Business Information
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
