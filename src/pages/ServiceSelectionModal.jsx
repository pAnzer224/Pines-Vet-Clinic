import React, { useRef, useEffect, useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { auth } from "../firebase-config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase-config";

const ServiceSelectionModal = ({ isOpen, onClose, onSelectService }) => {
  const modalRef = useRef();
  const [userBenefits, setUserBenefits] = useState({
    remainingConsultations: 0,
    remainingGrooming: 0,
    remainingDentalCheckups: 0,
    plan: "free",
  });
  const [pendingAppointments, setPendingAppointments] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          // Fetch user benefits
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          const userData = userDoc.data();

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

          // Count used benefits from pending appointments
          const pendingConsultations = pendingAppts.filter(
            (apt) =>
              apt.service?.toLowerCase().includes("consultation") &&
              apt.price === "FREE"
          ).length;

          const pendingGrooming = pendingAppts.filter(
            (apt) =>
              apt.service?.toLowerCase().includes("grooming") &&
              apt.price === "FREE"
          ).length;

          const pendingDental = pendingAppts.filter(
            (apt) =>
              apt.service?.toLowerCase().includes("dental check-up") &&
              apt.price === "FREE"
          ).length;

          // Calculate actual remaining benefits
          const planBenefits = {
            basic: { consultations: 2, grooming: 0, dental: 0 },
            standard: { consultations: 4, grooming: 1, dental: 1 },
            premium: { consultations: 6, grooming: 2, dental: 2 },
            free: { consultations: 0, grooming: 0, dental: 0 },
          };

          const plan = userData?.plan || "free";
          const totalBenefits = planBenefits[plan];

          setUserBenefits({
            remainingConsultations: Math.max(
              0,
              totalBenefits.consultations - pendingConsultations
            ),
            remainingGrooming: Math.max(
              0,
              totalBenefits.grooming - pendingGrooming
            ),
            remainingDentalCheckups: Math.max(
              0,
              totalBenefits.dental - pendingDental
            ),
            plan: plan,
          });

          setPendingAppointments(pendingAppts);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    if (isOpen) {
      fetchUserData();
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

  const getServicePrice = (category, serviceName, originalPrice) => {
    if (
      category === "Consultation" &&
      userBenefits.remainingConsultations > 0
    ) {
      return "FREE";
    }
    if (category === "Grooming" && userBenefits.remainingGrooming > 0) {
      return "FREE";
    }
    if (
      category === "Dental Care" &&
      serviceName === "Dental Check-up" &&
      userBenefits.remainingDentalCheckups > 0 &&
      (userBenefits.plan === "standard" || userBenefits.plan === "premium")
    ) {
      return "FREE";
    }
    return originalPrice;
  };

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
    const adjustedPrice = getServicePrice(
      category,
      service.name,
      service.price
    );
    onSelectService({
      category,
      name: service.name,
      price: adjustedPrice,
      duration: service.duration,
    });
    onClose();
  };

  const getRemainingServices = (category) => {
    switch (category) {
      case "Consultation":
        return userBenefits.remainingConsultations;
      case "Grooming":
        return userBenefits.remainingGrooming;
      case "Dental Care":
        if (
          userBenefits.plan === "standard" ||
          userBenefits.plan === "premium"
        ) {
          return userBenefits.remainingDentalCheckups;
        }
        return 0;
      default:
        return 0;
    }
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
                  {getRemainingServices(serviceCategory.category) > 0 && (
                    <span className="text-sm text-green2 bg-green3/20 px-3 py-1 rounded-full">
                      {getRemainingServices(serviceCategory.category)} free{" "}
                      {serviceCategory.category === "Dental Care"
                        ? "dental check-up"
                        : serviceCategory.category.toLowerCase()}{" "}
                      remaining
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceCategory.options.map((service) => {
                    const adjustedPrice = getServicePrice(
                      serviceCategory.category,
                      service.name,
                      service.price
                    );
                    return (
                      <button
                        key={service.name}
                        onClick={() =>
                          handleSelectService(serviceCategory.category, {
                            ...service,
                            price: adjustedPrice,
                          })
                        }
                        className="p-4 text-left border-[1.6px] border-green2 rounded-2xl hover:bg-green3/10 transition-colors relative overflow-hidden"
                      >
                        <div className="font-semibold text-text">
                          {service.name}
                        </div>
                        <div className="text-sm text-text/80 mt-1">
                          {adjustedPrice}
                          {adjustedPrice === "FREE" && (
                            <span className="ml-2 text-xs text-green2">
                              (Plan benefit)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text/60 mt-1">
                          <Clock size={13} className="inline mr-1 mb-1" />
                          {service.duration}
                        </div>
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
