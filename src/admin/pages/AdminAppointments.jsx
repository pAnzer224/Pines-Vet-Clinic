import React, { useState, useEffect } from "react";
import { Calendar, PawPrint, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
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
} from "firebase/firestore";
import LoadingSpinner from "../../components/LoadingSpinner";
import ToggleSwitch from "../../components/ToggleSwitch";

// New AppointmentDetailsModal component
function AppointmentDetailsModal({
  appointment,
  onClose,
  onConfirm,
  onDelete,
}) {
  if (!appointment) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 border-2 border-green2/50 shadow-lg">
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
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onDeleteAppointment,
  onConfirmAppointment,
  onClick,
}) {
  const statusColors = {
    Confirmed: "bg-green3/50 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Cancelled: "bg-red/30 text-red",
    Concluded: "bg-green3/30 text-green2",
  };

  const isPastAppointment = new Date(appointment.date) < new Date();
  const displayStatus =
    isPastAppointment && appointment.status === "Confirmed"
      ? "Concluded"
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
          className={`px-3 py-1 rounded-full text-xs font-nunito-bold opacity-100 group-hover:opacity-0 transition-opacity ${
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
  const statusOptions = ["All Status", "Confirmed", "Pending", "Cancelled"];

  useEffect(() => {
    const appointmentsCollectionRef = collection(db, "appointments");

    const unsubscribe = onSnapshot(
      query(appointmentsCollectionRef),
      (snapshot) => {
        try {
          setLoading(true);
          const currentDate = new Date();
          const fetchedAppointments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const validAppointments = fetchedAppointments.filter((apt) => {
            const aptDate = new Date(apt.date);
            if (aptDate < currentDate && apt.status === "Pending") {
              const appointmentRef = doc(db, "appointments", apt.id);
              deleteDoc(appointmentRef);
              return false;
            }
            return true;
          });

          const sortedAppointments = validAppointments.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
          });

          setAppointments(sortedAppointments);
        } catch (error) {
          toast.error("Failed to fetch appointments");
          console.error("Appointments fetch error:", error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await deleteDoc(appointmentRef);
      toast.success("Appointment deleted successfully");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "Confirmed",
        confirmedAt: serverTimestamp(),
      });
      toast.success("Appointment confirmed successfully");
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Failed to confirm appointment");
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPastAppointment = appointmentDate < today;
    const effectiveStatus =
      isPastAppointment && apt.status === "Confirmed"
        ? "Concluded"
        : apt.status;

    if (!showPastAppointments && isPastAppointment) return false;
    return selectedStatus === "All Status"
      ? true
      : effectiveStatus === selectedStatus;
  });

  return (
    <div className="space-y-6">
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
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onDeleteAppointment={handleDeleteAppointment}
              onConfirmAppointment={handleConfirmAppointment}
              onClick={() => setSelectedAppointment(appointment)}
            />
          ))}
        </div>
      )}

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onConfirm={handleConfirmAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
}

export default AdminAppointments;
