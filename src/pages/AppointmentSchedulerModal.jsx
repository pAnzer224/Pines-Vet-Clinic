import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronRight, ChevronLeft, SquareX } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import PromptModal from "../components/promptModal";
import { db } from "../firebase-config";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

const AppointmentSchedulerModal = ({ isOpen, onClose, onSchedule }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const modalRef = useRef();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const timeSlotsRef = collection(db, "timeSlots");
        const snapshot = await getDocs(timeSlotsRef);
        const slots = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          scheduleId: doc.id,
        }));
        setTimeSlots(
          slots.sort((a, b) => {
            const timeA = new Date(`2000/01/01 ${a.time}`);
            const timeB = new Date(`2000/01/01 ${b.time}`);
            return timeA - timeB;
          })
        );
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    if (isOpen) {
      fetchTimeSlots();
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const generateCalendarDays = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-3"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isSelected =
        selectedDay &&
        date.getDate() === selectedDay.getDate() &&
        date.getMonth() === selectedDay.getMonth() &&
        date.getFullYear() === selectedDay.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDay(date)}
          className={`p-3 text-center rounded-2xl transition-colors
            ${
              isSelected
                ? "bg-green3 text-text border-[1.6px] border-green2"
                : "hover:bg-green3/40 text-text"
            }
            ${
              date < new Date()
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          disabled={date < new Date()}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleSchedule = async () => {
    if (!currentUser) {
      setShowPromptModal(true);
      return;
    }

    if (selectedDay && selectedTime !== null) {
      const selectedDate = selectedDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      try {
        const selectedSlot = timeSlots[selectedTime];
        const scheduleRef = doc(db, "timeScheduling", selectedSlot.scheduleId);

        await setDoc(scheduleRef, {
          time: selectedSlot.time,
          date: selectedDate,
          userId: currentUser.uid,
          isAvailable: false,
          bookedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });

        onSchedule({
          date: selectedDate,
          time: selectedSlot.time,
          scheduleId: selectedSlot.scheduleId,
        });
      } catch (error) {
        console.error("Error scheduling appointment:", error);
      }
    }
  };

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <div className="fixed inset-0 bg-text bg-opacity-50 flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className="bg-background rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-text">
                Schedule Appointment
              </h2>
              <button
                onClick={onClose}
                className="text-green2 hover:text-green3"
              >
                <SquareX className="size-7" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm text-primary mb-6">
              <span>CONSULTATION FOR 1 PET</span>
              <ChevronRight className="size-5" />
              <span>Date & Time</span>
              <ChevronRight className="size-5" />
              <span>Complete</span>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text">{monthYear}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-full hover:bg-green3/50"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-green3/50"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-text/60 text-sm"
                  >
                    {day}
                  </div>
                ))}
                {generateCalendarDays()}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-text/80 mb-6">
              <Clock size={16} />
              <span>(UTC +08:00) China, Singapore, Philippines, Hong Kong</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTime(index)}
                  className={`p-3 text-center border-[1.6px] border-green2 rounded-2xl transition-colors text-text
                    ${
                      selectedTime === index
                        ? "bg-green3"
                        : "hover:bg-green3/10"
                    }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>

            <button
              onClick={handleSchedule}
              disabled={!selectedDay || selectedTime === null}
              className={`mt-8 w-full px-6 py-2 rounded-full border-[1.6px] border-green2 transition-colors text-text
                ${
                  selectedDay && selectedTime !== null
                    ? "bg-green3 hover:bg-green3/80"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </div>

      {showPromptModal && (
        <PromptModal
          isOpen={showPromptModal}
          onClose={() => setShowPromptModal(false)}
          title="Authentication Required"
          message="You need to be logged in to schedule an appointment. Please login or sign up to continue."
        />
      )}
    </>
  );
};

export default AppointmentSchedulerModal;
