import { db, auth } from "../firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  serverTimestamp,
  orderBy,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-toastify";

export const storeAppointment = async (appointmentData) => {
  try {
    if (!auth.currentUser) {
      toast.error("Please log in to book an appointment");
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "appointments"),
      where("userId", "==", auth.currentUser.uid),
      where("date", "==", appointmentData.date)
    );

    const existingAppointments = await getDocs(q);
    if (!existingAppointments.empty) {
      return null;
    }

    const appointmentWithUser = {
      ...appointmentData,
      userId: auth.currentUser.uid,
      userName:
        auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
      createdAt: serverTimestamp(),
      status: "Pending",
    };

    const docRef = await addDoc(
      collection(db, "appointments"),
      appointmentWithUser
    );

    return {
      id: docRef.id,
      ...appointmentWithUser,
    };
  } catch (error) {
    console.error("Error storing appointment:", error);
    toast.error("Failed to book appointment. Please try again.");
    throw error;
  }
};

export const getStoredAppointments = async () => {
  try {
    const isAdminAuthenticated =
      localStorage.getItem("adminAuthenticated") === "true";

    if (isAdminAuthenticated) {
      const q = query(
        collection(db, "appointments"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((apt) => apt.status !== "Cancelled");
    }

    if (!auth.currentUser) {
      return [];
    }

    const q = query(
      collection(db, "appointments"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((apt) => apt.status !== "Cancelled");
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

    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, {
      status: "Cancelled",
      cancelledAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error canceling appointment:", error);
    toast.error("Failed to cancel appointment. Please try again.");
    return false;
  }
};

// New function for real-time appointment updates
export const subscribeToAppointmentUpdates = (userId, callback) => {
  try {
    if (!userId) {
      console.error("No user ID provided for subscription");
      return () => {}; // Return empty function if no userId
    }

    const q = query(
      collection(db, "appointments"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    // Create a real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedAppointments = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((apt) => apt.status !== "Cancelled");

      callback(updatedAppointments);

      // Show toast notification for status changes
      snapshot.docChanges().forEach((change) => {
        const appointment = { id: change.doc.id, ...change.doc.data() };

        // Only show for modifications, not new appointments
        if (change.type === "modified") {
          if (appointment.status === "Confirmed") {
            toast.success(
              `Your appointment for ${appointment.petName} has been confirmed!`
            );
          } else if (appointment.status === "Rejected") {
            toast.error(
              `Your appointment for ${appointment.petName} has been rejected. Please contact us for more information.`
            );
          }
        }
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to appointments:", error);
    toast.error("Failed to subscribe to appointment updates");
    return () => {};
  }
};
