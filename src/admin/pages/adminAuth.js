import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase-config";

const ADMIN_DOC_ID = "admin_credentials";
const EMERGENCY_ADMIN_ID = "admin123";
const EMERGENCY_PASSWORD = "password123";

// New function to initialize admin record
export const initializeAdminCredentials = async () => {
  try {
    const adminDoc = await getDoc(doc(db, "admin", ADMIN_DOC_ID));

    if (!adminDoc.exists()) {
      // Create initial admin record if it doesn't exist
      await setDoc(doc(db, "admin", ADMIN_DOC_ID), {
        adminId: "admin123", // Set your preferredd default admin ID
        password: "password123", // Set your preferred default password
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
      console.log("Admin credentials initialized successfully");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error initializing admin credentials:", error);
    throw error;
  }
};

export const verifyAdminCredentials = async (adminId, password) => {
  try {
    // First check if we need to initialize
    await initializeAdminCredentials();

    if (adminId === EMERGENCY_ADMIN_ID && password === EMERGENCY_PASSWORD) {
      return true;
    }

    const adminDoc = await getDoc(doc(db, "admin", ADMIN_DOC_ID));
    if (!adminDoc.exists()) {
      throw new Error("Admin credentials not found");
    }

    const adminData = adminDoc.data();
    return adminId === adminData.adminId && password === adminData.password;
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    return false;
  }
};

export const updateAdminCredentials = async (
  currentCredentials,
  newCredentials
) => {
  try {
    const isValid = await verifyAdminCredentials(
      currentCredentials.adminId,
      currentCredentials.password
    );

    if (!isValid) {
      throw new Error("Current credentials are invalid");
    }

    await setDoc(doc(db, "admin", ADMIN_DOC_ID), {
      adminId: newCredentials.adminId,
      password: newCredentials.password,
      lastUpdated: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Error updating admin credentials:", error);
    throw error;
  }
};
