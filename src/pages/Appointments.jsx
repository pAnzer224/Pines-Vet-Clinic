import React, { useState, useEffect } from "react";
import {
  Calendar,
  CreditCard,
  Wallet,
  TriangleAlert,
  CalendarDays,
} from "lucide-react";
import {
  getStoredAppointments,
  storeAppointment,
} from "./appointmentsUtils.js";
import AppointmentSchedulerModal from "./AppointmentSchedulerModal";
import ServiceSelectionModal from "./ServiceSelectionModal";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);

  useEffect(() => {
    setAppointments(getStoredAppointments());
  }, []);

  const handleServiceSelection = (serviceDetails) => {
    setSelectedServiceDetails(serviceDetails);
    setSelectedService(serviceDetails.category);
    setIsServiceModalOpen(false);
  };

  const handleBookAppointment = (scheduledDateTime) => {
    if (selectedService && selectedPayment && scheduledDateTime) {
      const newAppointment = {
        id: Date.now(),
        service: selectedServiceDetails
          ? `${selectedServiceDetails.category} - ${selectedServiceDetails.name}`
          : selectedService,
        date: `${scheduledDateTime.date}, ${scheduledDateTime.time}`,
        petName: "your Pet",
        paymentMethod: selectedPayment,
        price: selectedServiceDetails?.price || "Price varies",
        duration: selectedServiceDetails?.duration || "Duration varies",
      };

      const updatedAppointments = storeAppointment(newAppointment);
      setAppointments(updatedAppointments);
      setSelectedService("");
      setSelectedPayment("");
      setSelectedServiceDetails(null);
      setIsSchedulerOpen(false);
    }
  };

  const handleCancelAppointment = (id) => {
    const updatedAppointments = appointments.filter((apt) => apt.id !== id);
    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
  };

  return (
    <div className="container mx-auto px-6 pb-20 font-nunito-bold">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="border-[1.6px] border-green2 rounded-2xl p-8 bg-background">
          <h2 className="text-lg font-bold text-text mb-8 tracking-wide">
            Schedule New Appointment
          </h2>

          <div className="mb-8">
            <label className="text-md font-medium text-text/80 mb-2 block">
              Select Service
            </label>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="w-full px-6 py-2 rounded-full border-[1.6px] border-green2 hover:bg-green3/80 transition-colors text-text"
            >
              {selectedServiceDetails ? (
                <span>{`${selectedServiceDetails.category} - ${selectedServiceDetails.name}`}</span>
              ) : (
                "Choose a Service"
              )}
            </button>
            {selectedServiceDetails && (
              <div className="mt-2 text-sm text-text/60">
                <p>Price: {selectedServiceDetails.price}</p>
                <p>Duration: {selectedServiceDetails.duration}</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-md font-nunito-bold text-text/80 mb-2">
              Select Payment Method
            </h3>
            <div className="flex gap-4 text-sm">
              <button
                className={`flex-1 border-[1.6px] border-green2 rounded-2xl p-4 text-center bg-green3/10 ${
                  selectedPayment === "Credit Card"
                    ? "ring-2 ring-green3 bg-green3/60"
                    : ""
                }`}
                onClick={() => setSelectedPayment("Credit Card")}
              >
                <CreditCard className="mx-auto mb-2 text-text" />
                <span className="text-text/80">Credit Card</span>
              </button>
              <button
                className={`flex-1 border-[1.6px] border-green2 rounded-2xl p-4 text-center bg-green3/10 ${
                  selectedPayment === "PayPal"
                    ? "ring-2 ring-green3 bg-green3/60"
                    : ""
                }`}
                onClick={() => setSelectedPayment("PayPal")}
              >
                <Wallet className="mx-auto mb-2 text-text" />
                <span className="text-text/80 text-sm">PayPal</span>
              </button>
              <button
                className={`flex-1 border-[1.6px] border-green2 rounded-2xl p-4 text-center bg-green3/10 ${
                  selectedPayment === "Bank Transfer"
                    ? "ring-2 ring-green3 bg-green3/60"
                    : ""
                }`}
                onClick={() => setSelectedPayment("Bank Transfer")}
              >
                <Calendar className="mx-auto mb-2 text-text" />
                <span className="text-text/80">Bank Transfer</span>
              </button>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <TriangleAlert className="size-4 text-red/80 mb-[0.4px]" />
              <p className="tracking-wide text-xs text-primary/60">
                Downpayment of $100 is required
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSchedulerOpen(true)}
            disabled={!selectedService || !selectedPayment}
            className={`w-full px-6 py-2 rounded-full border-[1.6px] border-green2 transition-colors text-text flex items-center justify-center space-x-2 group
              ${
                selectedService && selectedPayment
                  ? "bg-green3 hover:bg-green3/80 hover:text-text/80"
                  : "bg-text/10 cursor-not-allowed text-text/40"
              }`}
          >
            <CalendarDays className="size-5 mb-1 text-text transition-colors group-hover:text-text/80" />
            <span>Check Availability</span>
          </button>
        </div>

        <div className="border-[1.6px] border-green2 rounded-2xl p-8 bg-background">
          <h2 className="text-lg font-bold text-text mb-8 tracking-wide">
            Upcoming Appointments
          </h2>
          {appointments.length === 0 ? (
            <div className="text-center text-text/80 py-8 tracking-wide">
              No appointments scheduled
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="relative pl-8 pb-6 border-l-[1.6px] border-green2 last:pb-0"
                >
                  <div className="absolute left-[-6px] top-0 w-3 h-3 bg-green3 rounded-full border-[1.6px] border-green2" />
                  <p className="font-medium text-text tracking-wide">
                    {apt.date}
                  </p>
                  <p className="text-text/80 tracking-wide">{`${apt.service} for ${apt.petName}`}</p>
                  <p className="text-text/60 text-sm tracking-wide">
                    Payment: {apt.paymentMethod}
                  </p>
                  {apt.price && (
                    <p className="text-text/60 text-sm tracking-wide">
                      Price: {apt.price}
                    </p>
                  )}
                  {apt.duration && (
                    <p className="text-text/60 text-sm tracking-wide">
                      Duration: {apt.duration}
                    </p>
                  )}
                  <button
                    className="absolute right-2 bottom-0 text-red hover:text-red/80"
                    onClick={() => handleCancelAppointment(apt.id)}
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ServiceSelectionModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSelectService={handleServiceSelection}
      />

      <AppointmentSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onSchedule={handleBookAppointment}
      />
    </div>
  );
}
