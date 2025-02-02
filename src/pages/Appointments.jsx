import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarFold, Wallet, CalendarDays, PlusCircle } from "lucide-react";
import {
  storeAppointment,
  getStoredAppointments,
  cancelAppointment,
} from "../pages/appointmentsUtils";
import { getPets } from "../pages/petsUtils";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import AppointmentSchedulerModal from "../pages/AppointmentSchedulerModal";
import ServiceSelectionModal from "../pages/ServiceSelectionModal";
import PetAddModal from "../components/PetAddModal";
import PromptModal from "../components/promptModal";
import FeatureOverlay from "../components/FeauterOverlay";
import RemainingBenefits from "../components/BenefitsTracker";
import { getDoc, doc } from "@firebase/firestore";
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
  const [userPlan, setUserPlan] = useState("free");
  const [showBenefits, setShowBenefits] = useState(true);
  const [remainingBenefits, setRemainingBenefits] = useState({
    consultations: 0,
    grooming: 0,
    dentalCheckups: 0,
  });

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

          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.data();

          // Count used benefits from non-cancelled appointments
          const usedConsultations = userAppointments.filter(
            (apt) =>
              apt.service?.toLowerCase().includes("consultation") &&
              apt.price === "FREE"
          ).length;

          const usedGrooming = userAppointments.filter(
            (apt) =>
              apt.service?.toLowerCase().includes("grooming") &&
              apt.price === "FREE"
          ).length;

          const usedDental = userAppointments.filter(
            (apt) =>
              apt.service?.toLowerCase().includes("dental") &&
              apt.price === "FREE"
          ).length;

          // Calculate remaining benefits
          const planBenefits = {
            basic: { consultations: 2, grooming: 0, dental: 0 },
            standard: { consultations: 4, grooming: 1, dental: 1 },
            premium: { consultations: 6, grooming: 2, dental: 2 },
            free: { consultations: 0, grooming: 0, dental: 0 },
          };

          const plan = userData?.plan || "free";
          const totalBenefits = planBenefits[plan];

          setUserPlan(plan);
          setRemainingBenefits({
            consultations: Math.max(
              0,
              totalBenefits.consultations - usedConsultations
            ),
            grooming: Math.max(0, totalBenefits.grooming - usedGrooming),
            dentalCheckups: Math.max(0, totalBenefits.dental - usedDental),
          });

          setAppointments(userAppointments);
          const fetchedPets = await getPets();
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
        const serviceCategory = selectedServiceDetails?.category.toLowerCase();
        let price = selectedServiceDetails?.price;
        // Check if the service should be free based on remaining benefits
        if (
          serviceCategory === "consultation" &&
          remainingBenefits.consultations > 0
        ) {
          price = "FREE";
          setRemainingBenefits((prev) => ({
            ...prev,
            consultations: prev.consultations - 1,
          }));
        } else if (
          serviceCategory === "grooming" &&
          remainingBenefits.grooming > 0
        ) {
          price = "FREE";
          setRemainingBenefits((prev) => ({
            ...prev,
            grooming: prev.grooming - 1,
          }));
        } else if (
          serviceCategory === "dental care" &&
          selectedServiceDetails.name === "Dental Check-up" &&
          remainingBenefits.dentalCheckups > 0 &&
          (userPlan === "standard" || userPlan === "premium")
        ) {
          price = "FREE";
          setRemainingBenefits((prev) => ({
            ...prev,
            dentalCheckups: prev.dentalCheckups - 1,
          }));
        }

        const newAppointment = {
          service: selectedServiceDetails
            ? `${selectedServiceDetails.category} - ${selectedServiceDetails.name}`
            : selectedService,
          date: `${scheduledDateTime.date}, ${scheduledDateTime.time}`,
          petName: selectedPet.name,
          petId: selectedPet.id,
          paymentMethod: price === "FREE" ? "Plan Benefit" : "Cash",
          price,
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
      <AnimatePresence>
        {currentUser && showBenefits && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <RemainingBenefits
              plan={userPlan}
              remainingConsultations={remainingBenefits.consultations}
              remainingGrooming={remainingBenefits.grooming}
              remainingDentalCheckups={remainingBenefits.dentalCheckups}
              onClose={() => setShowBenefits(false)}
            />
          </motion.div>
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
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center z-20">
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
