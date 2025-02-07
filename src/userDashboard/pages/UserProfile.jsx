import React, { useState, useEffect } from "react";
import {
  PawPrint,
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  Bell,
  Clock,
  Shield,
  Settings,
  Calendar,
  Edit,
  Save,
  Lock,
} from "lucide-react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { toast } from "react-toastify";

function PersonalInformation() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [editedData, setEditedData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userInfo, setUserInfo] = useState({
    preferredBranch: "Pines Vet Clinic - Maginhawa",
    memberSince: "",
    preferredVet: "Dr. Sarah Smith",
    paymentMethod: "Cash",
    notificationPreferences: "Email & SMS",
    appointmentReminders: "24 hours before",
    careLevel: "",
    lastVisit: "May 1, 2024",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            const fullName = data.fullName || "Add Now";
            const phone = data.phone || "Add Now";
            const email = user.email || "Add Now";

            // Format member since date
            const memberSinceDate = new Date(user.metadata.creationTime);
            const memberSinceYear = memberSinceDate.getFullYear();

            // Get care plan level
            let carePlan;
            if (data.plan) {
              carePlan = `${
                data.plan.charAt(0).toUpperCase() + data.plan.slice(1)
              } Care Plan`;
            } else {
              carePlan = (
                <a
                  href="/pricing"
                  className="text-primary hover:text-primary/80"
                >
                  See Available Plans
                </a>
              );
            }

            setUserData({
              fullName,
              email,
              phone,
            });

            setEditedData({
              fullName,
              email,
              phone,
            });

            setUserInfo((prev) => ({
              ...prev,
              memberSince: memberSinceYear.toString(),
              careLevel: carePlan,
            }));
          } else {
            await setDoc(userDocRef, {
              fullName: "Add Now",
              phone: "Add Now",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        await updateDoc(userDocRef, {
          fullName:
            editedData.fullName === "Add Now" ? "" : editedData.fullName,
          phone: editedData.phone === "Add Now" ? "" : editedData.phone,
        });

        if (
          editedData.email !== userData.email &&
          editedData.email !== "Add Now"
        ) {
          await updateEmail(user, editedData.email);
        }

        await updateProfile(user, {
          displayName:
            editedData.fullName === "Add Now" ? "" : editedData.fullName,
        });

        setUserData({
          fullName: editedData.fullName,
          email: editedData.email,
          phone: editedData.phone,
        });

        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        if (
          !passwordData.currentPassword ||
          !passwordData.newPassword ||
          !passwordData.confirmPassword
        ) {
          toast.error("Please fill in all password fields");
          return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error("New passwords do not match");
          return;
        }

        if (passwordData.newPassword.length < 6) {
          toast.error("Password must be at least 6 characters long");
          return;
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          passwordData.currentPassword
        );

        try {
          await reauthenticateWithCredential(user, credential);
        } catch (reauthError) {
          console.error("Re-authentication error:", reauthError);
          toast.error("Current password is incorrect");
          return;
        }

        try {
          await updatePassword(user, passwordData.newPassword);

          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });

          toast.success("Password updated successfully");
        } catch (updateError) {
          console.error("Password update error:", updateError);

          if (updateError.code === "auth/requires-recent-login") {
            toast.error(
              "Please log out and log in again before changing password"
            );
          } else {
            toast.error("Failed to update password. Please try again.");
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error changing password:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Left Column - Personal Info & Password */}
      <div className="h-full">
        <div className="bg-green3/40 p-6 rounded-lg shadow-sm border-2 border-green3/60 h-full flex flex-col">
          {/* Personal Information Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-nunito-bold text-primary">
                Personal Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 text-sm font-nunito-bold text-primary bg-primary/20 rounded-md hover:bg-primary/30"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Details
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center px-4 py-2 text-sm font-nunito-bold text-green2 bg-background rounded-md hover:bg-primary/70 hover:text-background/90"
                  >
                    <Save size={16} className="mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedData(userData);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-nunito-bold text-primary bg-primary/20 rounded-md hover:bg-primary/30"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="flex flex-col">
                    <label className="text-sm text-primary/80 font-nunito-semibold mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editedData.fullName}
                      onChange={(e) =>
                        setEditedData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full border border-primary/20 bg-background/90 text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-primary/80 font-nunito-semibold mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editedData.email}
                      onChange={(e) =>
                        setEditedData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full border border-primary/20 bg-background/90 text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-primary/80 font-nunito-semibold mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editedData.phone}
                      onChange={(e) =>
                        setEditedData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full border border-primary/20 bg-background/90 text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3 h-10">
                    <User className="text-primary" size={20} />
                    <div>
                      <p className="text-sm text-primary font-nunito-bold">
                        Name
                      </p>
                      <p
                        className={`text-base font-nunito-bold text-text ${
                          userData.fullName === "Add Now"
                            ? "text-primary/50 font-nunito-semibold"
                            : ""
                        }`}
                      >
                        {userData.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 h-10">
                    <Mail className="text-primary" size={20} />
                    <div>
                      <p className="text-sm text-primary font-nunito-bold">
                        Email
                      </p>
                      <p
                        className={`text-base font-nunito-bold text-text/80 ${
                          userData.email === "Add Now"
                            ? "text-primary/50 font-nunito-semibold"
                            : ""
                        }`}
                      >
                        {userData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 h-10">
                    <Phone className="text-primary" size={20} />
                    <div>
                      <p className="text-sm text-primary font-nunito-bold">
                        Phone
                      </p>
                      <p
                        className={`text-base font-nunito-bold text-text/80 ${
                          userData.phone === "Add Now"
                            ? "text-primary/50 font-nunito-semibold"
                            : ""
                        }`}
                      >
                        {userData.phone}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-primary/40 my-12"></div>

          {/* Change Password Section */}
          <div className="flex-1">
            <h2 className="text-lg font-nunito-bold text-primary mb-6">
              Change Password
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm text-primary/80 font-nunito-semibold mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full border border-primary/20 bg-background/90 text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background"
                  />
                  <Lock
                    className="absolute right-3 top-3 text-primary"
                    size={16}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-primary/80 font-nunito-semibold mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full border border-primary/20 bg-background/90 text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background"
                  />
                  <Lock
                    className="absolute right-3 top-3 text-primary"
                    size={16}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-primary/80 font-nunito-semibold mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full border border-primary/20 bg-background/90 text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background"
                  />
                  <Lock
                    className="absolute right-3 top-3 text-primary"
                    size={16}
                  />
                </div>
              </div>
              <div className="mt-2">
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-background text-green2 rounded-md hover:bg-background/80 font-nunito-bold"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Settings */}
      <div className="space-y-6 h-full flex flex-col">
        {/* Clinic Preferences */}
        <div className="flex-1 bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <h2 className="text-lg font-nunito-bold text-green2 mb-6">
            Clinic Preferences
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-3">
              <Building2 className="text-green2" size={20} />
              <div>
                <p className="text-sm text-primary/50 font-nunito-semibold">
                  Preferred Branch
                </p>
                <p className="text-base font-nunito-bold text-green2">
                  {userInfo.preferredBranch}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="text-green2" size={20} />
              <div>
                <p className="text-sm text-primary/50 font-nunito-semibold">
                  Preferred Veterinarian
                </p>
                <p className="text-base font-nunito-bold text-green2">
                  {userInfo.preferredVet}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CreditCard className="text-green2" size={20} />
              <div>
                <p className="text-sm text-primary/50 font-nunito-semibold">
                  Payment Method
                </p>
                <p className="text-base font-nunito-bold text-green2">
                  {userInfo.paymentMethod}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="text-green2" size={20} />
              <div>
                <p className="text-sm text-primary/50 font-nunito-semibold">
                  Last Visit
                </p>
                <p className="text-base font-nunito-bold text-green2">
                  {userInfo.lastVisit}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="flex-1 bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <h2 className="text-lg font-nunito-bold text-green2 mb-6">
            Account Settings
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-3">
              <Bell className="text-green2" size={20} />
              <div>
                <p className="text-sm text-primary/50 font-nunito-semibold">
                  Notification Preferences
                </p>
                <p className="text-base font-nunito-bold text-green2">
                  {userInfo.notificationPreferences}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="text-green2" size={20} />
              <div>
                <p className="text-sm text-primary/50 font-nunito-semibold">
                  Appointment Reminders
                </p>
                <p className="text-base font-nunito-bold text-green2">
                  {userInfo.appointmentReminders}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield className="text-green2" size={20} />
              <div>
                <p className="text-sm text-primary/50 font-nunito-semibold">
                  Care Plan Level
                </p>
                <p className="text-base font-nunito-bold text-green2">
                  {userInfo.careLevel}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Settings className="text-green2" size={20} />
              <div>
                <p className="text-sm text-primary/50 font-nunito-semibold">
                  Member Since
                </p>
                <p className="text-base font-nunito-bold text-green2">
                  {userInfo.memberSince}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyProfile() {
  return (
    <div className="space-y-6 mt-14">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">
          Account Settings
        </h1>
        <div className="flex items-center mt-5">
          <PawPrint className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your profile and personal information
          </p>
        </div>
      </div>
      <PersonalInformation />
    </div>
  );
}

export default MyProfile;
