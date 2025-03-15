import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarFold,
  Wallet,
  CalendarDays,
  PlusCircle,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import {
  storeAppointment,
  getStoredAppointments,
  cancelAppointment,
  subscribeToAppointmentUpdates,
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
  // New state for pet dropdown
  const [isPetDropdownOpen, setIsPetDropdownOpen] = useState(false);
  const petDropdownRef = useRef(null);
  // New state for status notification
  const [statusNotification, setStatusNotification] = useState(null);

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

  // Handle clicks outside the pet dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        petDropdownRef.current &&
        !petDropdownRef.current.contains(event.target)
      ) {
        setIsPetDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let unsubscribe = null;

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

          // Subscribe to realtime updates for this user's appointments
          unsubscribe = subscribeToAppointmentUpdates(
            currentUser.uid,
            (updatedAppointments) => {
              setAppointments(updatedAppointments);
            }
          );
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

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const handleServiceSelection = (serviceDetails) => {
    setSelectedServiceDetails(serviceDetails);
    setSelectedService(serviceDetails.category);
    setIsServiceModalOpen(false);
    setSelectedPayment("Cash"); // Automatically set payment to Cash
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

    if (selectedService && scheduledDateTime && selectedPet) {
      try {
        const newAppointment = {
          service: selectedServiceDetails
            ? `${selectedServiceDetails.category} - ${selectedServiceDetails.name}`
            : selectedService,
          date: `${scheduledDateTime.date}, ${scheduledDateTime.time}`,
          petName: selectedPet.name,
          petId: selectedPet.id,
          paymentMethod: "Cash",
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

          //  status notification
          setStatusNotification({
            id: storedAppointment.id,
            message:
              "Your appointment has been scheduled and is pending approval from our staff. We'll notify you once it's confirmed.",
            type: "pending",
            service: storedAppointment.service,
            date: storedAppointment.date,
          });

          // Auto-close the notification after 10 seconds (change if needed)
          setTimeout(() => {
            setStatusNotification(null);
          }, 10000);
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

      <AnimatePresence>
        {statusNotification && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setStatusNotification(null)}
            />

            {/* Notification */}
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                maxWidth: "480px",
                zIndex: 100,
                margin: 0,
                padding: 0,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border-2 border-green2 rounded-xl shadow-xl p-6"
              >
                <div>
                  <div className="flex items-center mb-1">
                    <div className="bg-yellow-100 p-3 rounded-full mr-3">
                      <CalendarDays className="text-yellow-700 size-6" />
                    </div>
                    <h3 className="font-bold text-lg text-text">
                      Appointment Status
                    </h3>
                  </div>
                  <p className="text-text/80 mb-4 text-sm tracking-wide">
                    {statusNotification.message}
                  </p>

                  {statusNotification.service && statusNotification.date && (
                    <div className="bg-green3/10 p-3 rounded-lg border border-green2/30 mt-2">
                      <p className="text-text/80 text-sm font-semibold">
                        {statusNotification.service}
                      </p>
                      <p className="text-text/70 text-sm">
                        {statusNotification.date}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setStatusNotification(null)}
                    className="flex items-center bg-green3 hover:bg-green3/80 text-text px-4 py-2 rounded-full transition-colors"
                  >
                    <CheckCircle className="size-4 mr-2" />
                    <span>Got it</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

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
                <div ref={petDropdownRef} className="relative flex-grow">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPetDropdownOpen(!isPetDropdownOpen);
                    }}
                    className="w-full px-4 py-2 rounded-2xl border-[1.6px] border-green2 hover:bg-green3/80 transition-colors text-text text-sm truncate flex items-center justify-between"
                  >
                    <span>
                      {selectedPet
                        ? `${selectedPet.name} (${selectedPet.species})`
                        : "Select Pet"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isPetDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 border-[1.6px] border-green2 rounded-xl shadow-lg z-50">
                      {pets.length > 0 ? (
                        pets.map((pet) => (
                          <button
                            key={pet.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPet(pet);
                              setIsPetDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-green3/20 text-text transition-colors first:rounded-t-xl last:rounded-b-xl font-nunito truncate"
                          >
                            {pet.name} ({pet.species})
                          </button>
                        ))
                      ) : (
                        <div className="w-full px-4 py-2 text-left text-text/60 text-sm font-nunito">
                          No pets added
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                  Payment Method
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <button className="w-[100px] border-[1.6px] border-green2 rounded-2xl p-4 text-center ring-2 ring-green3 bg-green3/60">
                    <Wallet className="mx-auto mb-2 text-text" />
                    <span className="text-text/80 text-xs">Cash</span>
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
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center z-10">
                      <div className="w-3 h-3 bg-green3 rounded-full border-[1.6px] border-green2" />
                      <div className="w-[1.6px] h-full bg-green2" />
                    </div>

                    <div className="relative">
                      {isPast ? (
                        <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
                          <span className="text-green2 font-bold tracking-wide px-5 py-2 bg-[#C6E3CB] rounded-full">
                            Concluded
                          </span>
                        </div>
                      ) : (
                        apt.status === "Pending" && (
                          <div className="absolute inset-0 bg-background/30 flex items-center justify-center z-10">
                            <span className="text-yellow-800 font-bold tracking-wide px-5 py-2 bg-yellow-100 rounded-full">
                              Pending
                            </span>
                          </div>
                        )
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
        message="You need to be logged in to perform this action. Please log in or sign up to continue."
      />
    </div>
  );
}
