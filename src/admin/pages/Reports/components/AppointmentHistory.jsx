import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

function AppointmentAccordion({ appointment, isOpen, onToggle }) {
  const displayPrice =
    appointment.price === "FREE"
      ? "FREE (Plan Benefit)"
      : appointment.price || "Price not specified";

  return (
    <div className="border-2 border-green3/60 rounded-lg mb-2">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-green3/10 rounded-t-lg"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-nunito-bold text-green2 max-w-[18ch] truncate">
            {appointment.petName || "Unnamed Pet"}
          </span>
          <div className="flex items-center">
            <span className="font-nunito-bold text-primary mr-2">
              {appointment.userName || "Unknown User"}
            </span>
            <div className="group relative">
              <Info className="w-4 h-4 text-green2" />
              <div className="text-xs font-nunito-bold text-primary/80 tracking-wider absolute hidden group-hover:block bg-background border-2 border-green3/60 p-2 rounded-md z-10 top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                User ID: {appointment.userId}
              </div>
            </div>
          </div>
          <span className="font-nunito-semibold text-primary">
            {displayPrice}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text/60 hidden sm:inline text-sm">
            {appointment.date}
          </span>
          {isOpen ? (
            <ChevronUp className="text-green2" />
          ) : (
            <ChevronDown className="text-green2" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-4">
          <div className="sm:hidden mb-2 text-text/60">{appointment.date}</div>
          <div className="space-y-2">
            <p className="text-text">
              <span className="font-semibold">Service:</span>{" "}
              {appointment.service}
            </p>
            <p className="text-text">
              <span className="font-semibold">Payment Method:</span>{" "}
              {appointment.paymentMethod || "Not specified"}
            </p>
            <p className="text-text">
              <span className="font-semibold">Duration:</span>{" "}
              {appointment.duration || "Duration not specified"}
            </p>
            <p className="text-text">
              <span className="font-semibold">Status:</span>{" "}
              <span className="px-2 py-1 rounded-full text-sm bg-green3/20 text-green2">
                {appointment.status}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentHistory({ appointments }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openAppointmentId, setOpenAppointmentId] = useState(null);

  // Filter for concluded appointments and sort by date
  const concludedAppointments = appointments
    .filter((apt) => apt.status === "Concluded")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-background rounded-lg shadow-sm border-2 border-green3/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-green3/10"
      >
        <h3 className="font-nunito-bold text-green2">Appointment History</h3>
        {isOpen ? (
          <ChevronUp className="text-green2" />
        ) : (
          <ChevronDown className="text-green2" />
        )}
      </button>
      {isOpen && (
        <div className="p-6 space-y-2">
          {concludedAppointments.length === 0 ? (
            <div className="text-center text-text/60 py-4">
              No concluded appointments found
            </div>
          ) : (
            concludedAppointments.map((appointment) => (
              <AppointmentAccordion
                key={appointment.id}
                appointment={appointment}
                isOpen={openAppointmentId === appointment.id}
                onToggle={() =>
                  setOpenAppointmentId(
                    openAppointmentId === appointment.id ? null : appointment.id
                  )
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AppointmentHistory;
