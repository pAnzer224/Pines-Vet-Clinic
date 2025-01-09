import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarFold,
  CreditCard,
  Wallet,
  CalendarDays,
  PlusCircle,
} from "lucide-react";
import {
  storeAppointment,
  getStoredAppointments,
  cancelAppointment,
} from "../pages/appointmentsUtils";
import { getPets } from "../pages/petsUtils";
import { auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import AppointmentSchedulerModal from "../pages/AppointmentSchedulerModal";
import ServiceSelectionModal from "../pages/ServiceSelectionModal";
import PetAddModal from "../components/PetAddModal";
import PromptModal from "../components/promptModal";
import FeatureOverlay from "../components/FeauterOverlay";
import { toast } from "react-toastify";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [overlaySettings, setOverlaySettings] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const savedOverlaySettings = localStorage.getItem("overlaySettings");
    if (savedOverlaySettings) {
      setOverlaySettings(JSON.parse(savedOverlaySettings));
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          const fetchedAppointments = await getStoredAppointments();

          const userAppointments = fetchedAppointments.filter(
            (apt) => apt.userId === currentUser.uid
          );

          const fetchedPets = await getPets();

          setAppointments(userAppointments);
          setPets(Array.isArray(fetchedPets) ? fetchedPets : []);
        } catch (error) {
          toast.error("Failed to fetch data");
          setAppointments([]);
          setPets([]);
        }
      } else {
        setAppointments([]);
        setPets([]);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleServiceSelection = (serviceDetails) => {
    setSelectedServiceDetails(serviceDetails);
    setSelectedService(serviceDetails.category);
    setIsServiceModalOpen(false);
  };

  const handlePetAdded = async (newPet) => {
    if (currentUser) {
      setPets((prevPets) => [...prevPets, newPet]);
      setSelectedPet(newPet);
      setIsPetModalOpen(false);
    } else {
      setIsAuthPromptOpen(true);
    }
  };

  const handleBookAppointment = async (scheduledDateTime) => {
    if (!currentUser) {
      setIsAuthPromptOpen(true);
      return;
    }

    if (
      selectedService &&
      selectedPayment &&
      scheduledDateTime &&
      selectedPet
    ) {
      try {
        const newAppointment = {
          service: selectedServiceDetails
            ? `${selectedServiceDetails.category} - ${selectedServiceDetails.name}`
            : selectedService,
          date: `${scheduledDateTime.date}, ${scheduledDateTime.time}`,
          petName: selectedPet.name,
          petId: selectedPet.id,
          paymentMethod: selectedPayment,
          price: selectedServiceDetails?.price || "Price varies",
          duration: selectedServiceDetails?.duration || "Duration varies",
          userName: currentUser.displayName || "Unknown User",
          userId: currentUser.uid,
          status: "Pending",
        };

        const storedAppointment = await storeAppointment(newAppointment);

        if (storedAppointment) {
          setAppointments((prev) => [...prev, storedAppointment]);

          setSelectedService("");
          setSelectedPayment("");
          setSelectedServiceDetails(null);
          setSelectedPet(null);
          setIsSchedulerOpen(false);

          toast.success("Appointment booked successfully!");
        } else {
          toast.error(
            "This time slot is already booked. Please choose another."
          );
        }
      } catch (error) {
        toast.error("Failed to book appointment");
      }
    } else {
      toast.error("Please complete all required fields");
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const success = await cancelAppointment(id);

      if (success) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
        toast.success("Appointment canceled successfully");
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      toast.error("An error occurred while canceling appointment");
    }
  };

  const handleAddPetClick = () => {
    if (currentUser) {
      setIsPetModalOpen(true);
    } else {
      setIsAuthPromptOpen(true);
    }
  };

  const isAppointmentPast = (dateString) => {
    const [date, time] = dateString.split(", ");
    const appointmentDate = new Date(`${date} ${time}`);
    return appointmentDate < new Date();
  };

  return (
    <div className="container mx-auto px-6 pb-20 mb-10 font-nunito-bold relative">
      {overlaySettings?.appointments?.isEnabled && (
        <FeatureOverlay
          isEnabled={overlaySettings.appointments.isEnabled}
          title={overlaySettings.appointments.title}
          message={overlaySettings.appointments.message}
        />
      )}

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="border-[1.6px] border-green2 rounded-2xl p-8 bg-background">
          <h2 className="text-lg font-bold text-text mb-8 tracking-wide">
            Schedule New Appointment
          </h2>

          <div className="mb-8 grid md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-md font-nunito-semibold text-text/80 mb-2 block">
                Select Service
              </label>
              <div className="h-[100px]">
                <button
                  onClick={() => setIsServiceModalOpen(true)}
                  className="w-full px-6 py-2 rounded-full border-[1.6px] border-green2 hover:bg-green3/80 transition-colors text-text text-sm truncate"
                >
                  {selectedServiceDetails
                    ? `${selectedServiceDetails.category} - ${selectedServiceDetails.name}`
                    : "Choose a Service"}
                </button>
                {selectedServiceDetails && (
                  <div className="mt-2 text-sm text-text/60 h-[48px]">
                    <p className="truncate">
                      Price: {selectedServiceDetails.price}
                    </p>
                    <p className="truncate">
                      Duration: {selectedServiceDetails.duration}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-md font-nunito-semibold text-text/80 mb-2 block">
                Select Pet
              </label>
              <div className="flex items-center gap-2">
                {pets.length > 0 ? (
                  <select
                    value={selectedPet?.id || ""}
                    onChange={(e) => {
                      const pet = pets.find((p) => p.id === e.target.value);
                      setSelectedPet(pet);
                    }}
                    className="flex-grow px-4 py-2 border-[1.6px] border-green2 rounded-2xl text-sm truncate"
                  >
                    <option value="">Select Pet</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id} className="truncate">
                        {pet.name} ({pet.species})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-text/60 text-sm flex-grow">
                    No pets added
                  </span>
                )}
                <button
                  onClick={handleAddPetClick}
                  className="text-green2 hover:text-green3"
                >
                  <PlusCircle className="size-5" />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {(selectedServiceDetails || selectedService) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 overflow-hidden"
              >
                <h3 className="text-md font-nunito-bold text-text/80 mb-2">
                  Select Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <button
                    className={`border-[1.6px] border-green2 rounded-2xl p-4 text-center bg-green3/10 ${
                      selectedPayment === "Credit Card"
                        ? "ring-2 ring-green3 bg-green3/60"
                        : ""
                    }`}
                    onClick={() => setSelectedPayment("Credit Card")}
                  >
                    <CreditCard className="mx-auto mb-2 text-text" />
                    <span className="text-text/80 text-xs">Credit Card</span>
                  </button>
                  <button
                    className={`border-[1.6px] border-green2 rounded-2xl p-4 text-center bg-green3/10 ${
                      selectedPayment === "Cash"
                        ? "ring-2 ring-green3 bg-green3/60"
                        : ""
                    }`}
                    onClick={() => setSelectedPayment("Cash")}
                  >
                    <Wallet className="mx-auto mb-2 text-text" />
                    <span className="text-text/80 text-xs">Cash</span>
                  </button>
                  <button
                    className={`border-[1.6px] border-green2 rounded-2xl p-4 text-center bg-green3/10 ${
                      selectedPayment === "Gcash"
                        ? "ring-2 ring-green3 bg-green3/60"
                        : ""
                    } hover:bg-blue-100`}
                    onClick={() => setSelectedPayment("Gcash")}
                  >
                    <img
                      src="/images/gcash.svg"
                      alt="Gcash Logo"
                      className="mx-auto h-10"
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsSchedulerOpen(true)}
            disabled={!selectedService || !selectedPayment || !selectedPet}
            className={`w-full px-6 py-2 rounded-full border-[1.6px] border-green2 transition-colors text-text flex items-center justify-center space-x-2 group
                ${
                  selectedService && selectedPayment && selectedPet
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
          {!appointments || appointments.length === 0 ? (
            <div className="text-center text-text/80 py-8 tracking-wide">
              No appointments scheduled
            </div>
          ) : (
            <div
              className={`space-y-6 ${
                appointments.length > 3 ? "h-96 overflow-y-auto pr-4" : ""
              }`}
            >
              {appointments.map((apt) => {
                const isPast = isAppointmentPast(apt.date);
                return (
                  <div key={apt.id} className="relative pl-8 pb-6 last:pb-0">
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center z-20">
                      <div className="w-3 h-3 bg-green3 rounded-full border-[1.6px] border-green2" />
                      <div className="w-[1.6px] h-full bg-green2" />
                    </div>

                    <div className="relative">
                      {isPast && (
                        <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
                          <span className="text-green2 font-bold tracking-wide px-5 py-2 bg-[#C6E3CB] rounded-full">
                            Concluded
                          </span>
                        </div>
                      )}

                      <p className="font-nunito-semibold text-text/70 tracking-wide mb-2 text-sm flex items-center">
                        <CalendarFold className="mr-1 size-4" />
                        {apt.date || "No date specified"}
                      </p>
                      <p className="text-primary">
                        {apt.service || "No service specified"} for{" "}
                        {apt.petName || "Unknown Pet"}
                      </p>
                      <p className="text-text/60 text-sm tracking-wide">
                        Payment: {apt.paymentMethod || "Not specified"}
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
                      {!isPast && (
                        <button
                          className="absolute right-2 bottom-0 text-red hover:text-red/80"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

      <PetAddModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        onPetAdded={handlePetAdded}
      />

      <PromptModal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        title="Authentication Required"
        message="You need to be logged in to perform this action. Please login or sign up to continue."
      />
    </div>
  );
}
