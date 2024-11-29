import React, { useRef, useEffect } from "react";
import { ChevronRight, Clock } from "lucide-react";

const ServiceSelectionModal = ({ isOpen, onClose, onSelectService }) => {
  const modalRef = useRef();

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

  const handleSelectService = (category, service) => {
    onSelectService({
      category,
      name: service.name,
      price: service.price,
      duration: service.duration,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-text bg-opacity-50 flex items-center justify-center z-50">
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
                <h3 className="text-lg font-semibold text-text mb-4">
                  {serviceCategory.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceCategory.options.map((service) => (
                    <button
                      key={service.name}
                      onClick={() =>
                        handleSelectService(serviceCategory.category, service)
                      }
                      className="p-4 text-left border-[1.6px] border-green2 rounded-2xl hover:bg-green3/10 transition-colors"
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
                    </button>
                  ))}
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
