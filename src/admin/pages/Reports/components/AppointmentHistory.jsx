import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function AppointmentAccordion({ appointment, isOpen, onToggle }) {
  return (
    <div className="border-2 border-green3/60 rounded-lg mb-2">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-green3/10 rounded-t-lg"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-nunito-bold text-green2">
            {appointment.petName}
          </span>
          <div className="flex items-center">
            <span className="font-nunito-bold text-primary mr-2">
              {appointment.userName}
            </span>
          </div>
          <span className="font-nunito-semibold text-primary">
            {appointment.price}
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
              <span className="font-semibold">Category:</span>{" "}
              {appointment.category || "N/A"}
            </p>
            <p className="text-text">
              <span className="font-semibold">Duration:</span>{" "}
              {appointment.duration}
            </p>
            <p className="text-text">
              <span className="font-semibold">Status:</span>{" "}
              {appointment.status}
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

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

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
          {sortedAppointments.map((appointment) => (
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
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentHistory;
