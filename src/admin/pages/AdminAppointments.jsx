import React, { useState, useEffect } from "react";
import { Calendar, PawPrint } from "lucide-react";
import { toast } from "react-toastify";
import StatusDropdown from "../../components/StatusDropdown";
import { db } from "../../firebase-config";
import { collection, onSnapshot, query } from "firebase/firestore";

function AppointmentCard({ appointment }) {
  const statusColors = {
    Confirmed: "bg-green3/50 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Cancelled: "bg-red/80 text-red-800",
  };

  return (
    <div className="bg-gold p-4 rounded-lg border-2 border-green3 hover:border-primary/70 transition-colors">
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
          className={`px-3 py-1 rounded-full text-xs font-nunito-bold ${
            statusColors[appointment.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {appointment.status || "Unknown"}
        </span>
      </div>

      <div className="flex items-center text-sm text-text/80 font-nunito">
        <Calendar size={16} className="mr-2" />
        {appointment.date || "No date specified"}
      </div>
    </div>
  );
}

function Appointments() {
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [appointments, setAppointments] = useState([]);
  const statusOptions = ["All Status", "Confirmed", "Pending", "Cancelled"];

  // Real-time listener for appointments
  useEffect(() => {
    const appointmentsCollectionRef = collection(db, "appointments");

    const unsubscribe = onSnapshot(
      query(appointmentsCollectionRef),
      (snapshot) => {
        try {
          const fetchedAppointments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort appointments from newest to oldest
          const sortedAppointments = fetchedAppointments.sort((a, b) => {
            // Convert dates and sort from closest to farthest
            return new Date(a.date) - new Date(b.date);
          });

          setAppointments(sortedAppointments);
        } catch (error) {
          toast.error("Failed to fetch appointments");
          console.error("Appointments fetch error:", error);
        }
      },
      (error) => {
        toast.error("Error listening to appointments");
        console.error("Appointments listener error:", error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const filteredAppointments =
    selectedStatus === "All Status"
      ? appointments
      : appointments.filter((apt) => apt.status === selectedStatus);

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

      <StatusDropdown
        statusOptions={statusOptions}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    </div>
  );
}

export default Appointments;
