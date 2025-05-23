import React, { useState, useEffect } from "react";
import { Calendar, PawPrint, Trash2 } from "lucide-react";
import StatusDropdown from "../../components/StatusDropdown";
import { db } from "../../firebase-config";
import {
  collection,
  onSnapshot,
  query,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import LoadingSpinner from "../../components/LoadingSpinner";
import ToggleSwitch from "../../components/ToggleSwitch";

function AppointmentDetailsModal({
  appointment,
  onClose,
  onConfirm,
  onComplete,
  onDelete,
}) {
  if (!appointment) return null;

  const isPastAppointment = new Date(appointment.date) < new Date();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 border-2 border-green2/50 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-nunito-bold text-green2 mb-4">
          Appointment Details
        </h2>

        <div className="space-y-3 mb-6">
          <div>
            <h3 className="font-nunito-bold text-green2">
              {appointment.petName || "Unnamed Pet"}
            </h3>
            <p className="font-nunito-bold text-sm text-text/60">
              {appointment.service || "No service specified"}
            </p>
          </div>

          <div className="flex items-center text-sm text-text/80 font-nunito-semibold">
            <Calendar size={16} className="mr-2" />
            {appointment.date || "No date specified"}
          </div>

          <div className="space-y-1 text-sm text-text/80">
            <p>Scheduled by: {appointment.userName || "Unknown User"}</p>
            {appointment.paymentMethod && (
              <p>Payment Method: {appointment.paymentMethod}</p>
            )}
            {appointment.price && <p>Price: {appointment.price}</p>}
            {appointment.duration && <p>Duration: {appointment.duration}</p>}
          </div>

          <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm">
            Status: {appointment.status}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-nunito-semibold text-text/60 hover:text-text/80 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onDelete(appointment.id);
              onClose();
            }}
            className="px-4 py-2 text-sm font-nunito-semibold text-red bg-red/20 rounded-xl hover:bg-red/40 transition-colors"
          >
            Delete
          </button>
          {appointment.status === "Pending" && (
            <button
              onClick={() => {
                onConfirm(appointment.id);
                onClose();
              }}
              className="px-4 py-2 text-sm font-nunito-semibold text-white bg-green3 rounded-lg hover:bg-green3/80 transition-colors"
            >
              Confirm
            </button>
          )}
          {isPastAppointment && appointment.status === "Confirmed" && (
            <button
              onClick={() => {
                onComplete(appointment.id);
                onClose();
              }}
              className="px-4 py-2 text-sm font-nunito-semibold text-white bg-green3 rounded-lg hover:bg-green3/80 transition-colors"
            >
              Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onDeleteAppointment,
  onConfirmAppointment,
  onCompleteAppointment,
  onClick,
}) {
  const statusColors = {
    Confirmed: "bg-green3/50 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Cancelled: "bg-red/30 text-red",
    Concluded: "bg-green3/30 text-green2",
    "Awaiting Completion": "bg-blue-100 text-blue-800",
  };

  const isPastAppointment = new Date(appointment.date) < new Date();
  const displayStatus =
    isPastAppointment && appointment.status === "Confirmed"
      ? "Awaiting Completion"
      : appointment.status;

  return (
    <div
      className="bg-pantone/20 p-4 rounded-lg border-2 border-green3 hover:border-primary/70 transition-colors relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (
              window.confirm(
                "Are you sure you want to delete this appointment?"
              )
            ) {
              onDeleteAppointment(appointment.id);
            }
          }}
          className="text-primary hover:bg-red-100 rounded-full p-1 transition-colors"
        >
          <Trash2 className="size-5 text-red" />
        </button>
      </div>

      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-nunito-bold text-green2">
            {appointment.petName || "Unnamed Pet"}
          </h3>
          <p className="font-nunito-bold text-xs text-text/60">
            {appointment.service || "No service specified"}
          </p>
          <p className="font-nunito-bold text-xs text-text/80 pt-1">
            Scheduled by: {appointment.userName || "Unknown User"}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-nunito-bold opacity-100 group-hover:opacity-0 transition-opacity whitespace-nowrap ${
            statusColors[displayStatus] || "bg-gray-100 text-gray-800"
          }`}
        >
          {displayStatus || "Unknown"}
        </span>
      </div>

      <div className="flex items-center text-sm text-text/80 font-nunito-semibold">
        <Calendar size={16} className="mr-2" />
        {appointment.date || "No date specified"}
      </div>
    </div>
  );
}

function AdminAppointments() {
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [appointments, setAppointments] = useState([]);
  const [showPastAppointments, setShowPastAppointments] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const statusOptions = [
    "All Status",
    "Confirmed",
    "Pending",
    "Cancelled",
    "Concluded",
    "Awaiting Completion",
  ];

  useEffect(() => {
    const appointmentsCollectionRef = collection(db, "appointments");

    const appointmentsQuery = query(
      appointmentsCollectionRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
      try {
        setLoading(true);
        const fetchedAppointments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error("Appointments fetch error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "Confirmed",
        confirmedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error confirming appointment:", error);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "Concluded",
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPastAppointment = appointmentDate < today;
    const effectiveStatus =
      isPastAppointment && apt.status === "Confirmed"
        ? "Awaiting Completion"
        : apt.status;

    if (showPastAppointments) {
      return apt.status === "Concluded";
    }

    if (apt.status === "Concluded") return false;

    return selectedStatus === "All Status"
      ? true
      : effectiveStatus === selectedStatus;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (showPastAppointments) {
      return new Date(b.date) - new Date(a.date);
    }

    if (selectedStatus === "All Status") {
      return 0;
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  return (
    <div className="space-y-6 mt-12">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Appointments</h1>
        <div className="flex items-center mt-5">
          <PawPrint className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage and track all pet appointments
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <StatusDropdown
          statusOptions={statusOptions}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-nunito-semibold text-text/80">
            Show past appointments
          </span>
          <ToggleSwitch
            isEnabled={showPastAppointments}
            onToggle={() => setShowPastAppointments(!showPastAppointments)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedAppointments.length > 0 ? (
            sortedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onDeleteAppointment={handleDeleteAppointment}
                onConfirmAppointment={handleConfirmAppointment}
                onCompleteAppointment={handleCompleteAppointment}
                onClick={() => setSelectedAppointment(appointment)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-text/60">
              No appointments found matching the selected criteria
            </div>
          )}
        </div>
      )}

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onConfirm={handleConfirmAppointment}
          onComplete={handleCompleteAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
}

export default AdminAppointments;
