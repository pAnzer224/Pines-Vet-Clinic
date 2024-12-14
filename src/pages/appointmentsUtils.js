import { db, auth } from "../firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-toastify";

export const storeAppointment = async (appointmentData) => {
  try {
    if (!auth.currentUser) {
      toast.error("Please log in to book an appointment");
      throw new Error("User not authenticated");
    }

    // Check for existing appointments with same date and time
    const q = query(
      collection(db, "appointments"),
      where("userId", "==", auth.currentUser.uid),
      where("date", "==", appointmentData.date)
    );

    const existingAppointments = await getDocs(q);
    if (!existingAppointments.empty) {
      return null; // Indicates a duplicate appointment
    }

    const appointmentWithUser = {
      ...appointmentData,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || auth.currentUser.email,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "appointments"),
      appointmentWithUser
    );

    return {
      ...appointmentWithUser,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error storing appointment:", error);
    toast.error("Failed to book appointment. Please try again.");
    throw error;
  }
};

export const getStoredAppointments = async () => {
  try {
    // Fetch all appointments regardless of user authentication
    const q = query(
      collection(db, "appointments"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    toast.error("Failed to fetch appointments. Please try again.");
    return [];
  }
};

export const cancelAppointment = async (appointmentId) => {
  try {
    if (!auth.currentUser) {
      toast.error("Please log in to cancel an appointment");
      return false;
    }

    await deleteDoc(doc(db, "appointments", appointmentId));
    return true;
  } catch (error) {
    console.error("Error canceling appointment:", error);
    toast.error("Failed to cancel appointment. Please try again.");
    return false;
  }
};
