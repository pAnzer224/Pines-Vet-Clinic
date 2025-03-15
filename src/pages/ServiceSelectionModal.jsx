import React, { useRef, useEffect, useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { auth } from "../firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

const ServiceSelectionModal = ({ isOpen, onClose, onSelectService }) => {
  const modalRef = useRef();
  const [pendingAppointments, setPendingAppointments] = useState([]);

  useEffect(() => {
    const fetchPendingAppointments = async () => {
      if (auth.currentUser) {
        try {
          // Fetch pending appointments
          const appointmentsRef = collection(db, "appointments");
          const pendingQuery = query(
            appointmentsRef,
            where("userId", "==", auth.currentUser.uid),
            where("status", "in", ["Pending", "Confirmed"])
          );
          const pendingSnapshot = await getDocs(pendingQuery);
          const pendingAppts = pendingSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));

          setPendingAppointments(pendingAppts);
        } catch (error) {
          console.error("Error fetching pending appointments:", error);
        }
      }
    };

    if (isOpen) {
      fetchPendingAppointments();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const services = [
    {
      category: "Consultation",
      options: [
        { name: "General Check-up", price: "₱500", duration: "30 mins" },
        { name: "Vaccination", price: "₱750", duration: "45 mins" },
        { name: "Medical Assessment", price: "₱600", duration: "40 mins" },
      ],
    },
    {
      category: "Grooming",
      options: [
        { name: "Basic Grooming", price: "₱400", duration: "1 hour" },
        { name: "Full Service Grooming", price: "₱800", duration: "2 hours" },
        { name: "Bath & Brush", price: "₱350", duration: "45 mins" },
      ],
    },
    {
      category: "Dental Care",
      options: [
        { name: "Dental Check-up", price: "₱450", duration: "30 mins" },
        { name: "Teeth Cleaning", price: "₱1,200", duration: "1 hour" },
        { name: "Dental Surgery", price: "From ₱2,000", duration: "1-2 hours" },
      ],
    },
  ];

  const isServiceBooked = (categoryName, serviceName) => {
    return pendingAppointments.some(
      (appointment) =>
        appointment.service === serviceName &&
        appointment.category === categoryName
    );
  };

  const handleSelectService = (category, service) => {
    // Check if this service is already booked
    if (isServiceBooked(category, service.name)) {
      alert(
        "You already have a pending or confirmed appointment for this service."
      );
      return;
    }

    onSelectService({
      category,
      name: service.name,
      price: service.price,
      duration: service.duration,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-background rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-text">Select Service</h2>
            <button
              onClick={onClose}
              className="text-text/60 hover:text-text/80"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-primary mb-6">
            <span>SELECT SERVICE</span>
            <ChevronRight className="size-5" />
            <span>CONSULTATION FOR 1 PET</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-text/80 mb-6">
            <Clock size={16} />
            <span>Duration shown for each service</span>
          </div>

          <div className="space-y-6">
            {services.map((serviceCategory, index) => (
              <div key={serviceCategory.category}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text">
                    {serviceCategory.category}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceCategory.options.map((service) => {
                    const alreadyBooked = isServiceBooked(
                      serviceCategory.category,
                      service.name
                    );
                    return (
                      <button
                        key={service.name}
                        onClick={() =>
                          handleSelectService(serviceCategory.category, service)
                        }
                        className={`p-4 text-left border-[1.6px] border-green2 rounded-2xl hover:bg-green3/10 transition-colors relative overflow-hidden ${
                          alreadyBooked ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        disabled={alreadyBooked}
                      >
                        <div className="font-semibold text-text">
                          {service.name}
                        </div>
                        <div className="text-sm text-text/80 mt-1">
                          {service.price}
                        </div>
                        <div className="text-xs text-text/60 mt-1">
                          <Clock size={13} className="inline mr-1 mb-1" />
                          {service.duration}
                        </div>
                        {alreadyBooked && (
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <span className="text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded">
                              Already Booked
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {index !== services.length - 1 && (
                  <div className="border-b border-primary/40 my-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;
