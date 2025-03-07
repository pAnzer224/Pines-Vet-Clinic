import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Calendar } from "lucide-react";
import { db } from "../../firebase-config";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function PendingAppointmentsPopup({ onViewAppointment }) {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Query for pending appointments
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("status", "==", "Pending")
    );

    const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingAppointments(appointments);

      // Auto-open popup when there are pending appointments
      if (appointments.length > 0) {
        setIsOpen(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (pendingAppointments.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border-2 border-green2 p-4 max-w-sm w-full z-50"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Bell className="text-yellow-500 mr-2 size-5" />
              <h3 className="font-nunito-bold text-green2">
                Pending Appointments ({pendingAppointments.length})
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text/60 hover:text-text/80 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {pendingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-yellow-50 p-3 rounded-md cursor-pointer hover:bg-yellow-100/80 transition-colors"
                onClick={() => {
                  onViewAppointment(appointment);
                  setIsOpen(false);
                }}
              >
                <div className="font-nunito-bold text-md text-text">
                  {appointment.petName || "Unnamed Pet"}
                </div>
                <div className="text-sm text-text/80">
                  {appointment.service || "No service specified"}
                </div>
                <div className="flex items-center text-sm text-text/70 mt-1">
                  <Calendar size={15} className="mr-1" />
                  {appointment.date || "No date specified"}
                </div>
                <div className="text-xs font-nunito-semibold text-text/80 mt-1">
                  By: {appointment.userName || "Unknown"}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs font-nunito-semibold text-text/60 hover:text-text/80 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PendingAppointmentsPopup;
