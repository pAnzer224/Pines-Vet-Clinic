import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase-config";
import LoadingSpinner from "../../../components/LoadingSpinner";

const ADMIN_DOC_ID = "admin_credentials";

const SecurityTab = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasCustomCredentials, setHasCustomCredentials] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState({
    currentAdminId: "",
    currentPassword: "",
    newAdminId: "",
    newPassword: "",
  });

  useEffect(() => {
    const initializeAdmin = async () => {
      setIsLoading(true);
      try {
        const adminDoc = await getDoc(doc(db, "admin", ADMIN_DOC_ID));
        if (adminDoc.exists()) {
          const data = adminDoc.data();
          setHasCustomCredentials(
            data.adminId !== "admin123" || data.password !== "password123"
          );
        } else {
          setHasCustomCredentials(false);
        }
      } catch (error) {
        console.error("Error checking admin credentials:", error);
        setError("Failed to initialize admin settings");
      } finally {
        setIsLoading(false);
      }
    };
    initializeAdmin();
  }, []);

  const updateAdminCredentials = async (currentCreds, newCreds) => {
    try {
      const adminDocRef = doc(db, "admin", ADMIN_DOC_ID);
      const adminDoc = await getDoc(adminDocRef);

      if (
        !adminDoc.exists() &&
        currentCreds.adminId === "admin123" &&
        currentCreds.password === "password123"
      ) {
        await setDoc(adminDocRef, {
          adminId: newCreds.adminId,
          password: newCreds.password,
          lastUpdated: new Date().toISOString(),
        });
        return true;
      }

      if (adminDoc.exists()) {
        const currentAdmin = adminDoc.data();
        if (
          currentAdmin.adminId !== currentCreds.adminId ||
          currentAdmin.password !== currentCreds.password
        ) {
          throw new Error("Current credentials are incorrect");
        }
        await setDoc(adminDocRef, {
          adminId: newCreds.adminId,
          password: newCreds.password,
          lastUpdated: new Date().toISOString(),
        });
        return true;
      }

      throw new Error("Admin credentials not found");
    } catch (error) {
      console.error("Error updating admin credentials:", error);
      throw error;
    }
  };

  const handleInitialSetup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsInitializing(true);

    try {
      if (
        credentials.currentAdminId !== "admin123" ||
        credentials.currentPassword !== "password123"
      ) {
        throw new Error(
          "Please use the default admin credentials to create your custom admin account"
        );
      }

      await updateAdminCredentials(
        { adminId: "admin123", password: "password123" },
        { adminId: credentials.newAdminId, password: credentials.newPassword }
      );

      setSuccess("Custom admin credentials created successfully!");
      setHasCustomCredentials(true);
      setCredentials({
        currentAdminId: "",
        currentPassword: "",
        newAdminId: "",
        newPassword: "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCredentialsUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateAdminCredentials(
        {
          adminId: credentials.currentAdminId,
          password: credentials.currentPassword,
        },
        {
          adminId: credentials.newAdminId,
          password: credentials.newPassword,
        }
      );

      setSuccess("Admin credentials updated successfully");
      setCredentials({
        currentAdminId: "",
        currentPassword: "",
        newAdminId: "",
        newPassword: "",
      });
    } catch (error) {
      setError(error.message || "Failed to update credentials");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {!hasCustomCredentials ? (
        <>
          <div className="flex items-start space-x-2 p-4 bg-green2/10 border-2 border-green3 rounded-lg">
            <Info className="size-5 text-red mt-0.5" />
            <div className="text-sm text-primary">
              <p className="font-nunito-bold tracking-wide mb-1">
                Initial Setup Required
              </p>
              <p className="text-primary/80">
                Use the default credentials to create your custom admin account:
              </p>
              <p className="text-primary/80">
                Default Admin ID:{" "}
                <span className="tracking-wider font-nunito-bold">
                  admin123
                </span>
              </p>
              <p className="text-primary/80">
                Default Password:{" "}
                <span className="tracking-wider font-nunito-bold">
                  password123
                </span>
              </p>
            </div>
          </div>

          <form onSubmit={handleInitialSetup} className="space-y-4">
            <h3 className="font-nunito-bold text-green2">
              Create Custom Admin Credentials
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-nunito-semibold text-text/80">
                  Default Admin ID
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
                  placeholder="Enter default admin ID"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-nunito-semibold text-text/80">
                  Default Password
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
                    placeholder="Enter default password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                  New Custom Admin ID
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
                  placeholder="Create your admin ID"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-nunito-semibold text-text/80">
                  New Custom Password
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
                    placeholder="Create your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green2 hover:text-primary"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-red text-sm">{error}</p>}
            {success && <p className="text-primary/90 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={isInitializing}
              className="px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito disabled:opacity-50"
            >
              {isInitializing ? "Creating..." : "Create Custom Admin Account"}
            </button>
          </form>
        </>
      ) : (
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
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-red text-sm">{error}</p>}
          {success && <p className="text-primary/90 text-sm">{success}</p>}

          <button
            type="submit"
            className="px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito"
          >
            Update Credentials
          </button>
        </form>
      )}
    </div>
  );
};

export default SecurityTab;
