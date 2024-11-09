import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronRight } from "lucide-react";

const AppointmentSchedulerModal = ({ isOpen, onClose, onSchedule }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
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

  const days = [
    { date: "7th", day: "THU", month: "NOV" },
    { date: "8th", day: "FRI", month: "NOV" },
    { date: "9th", day: "SAT", month: "NOV" },
    { date: "10th", day: "SUN", month: "NOV" },
    { date: "11th", day: "MON", month: "NOV" },
    { date: "12th", day: "TUE", month: "NOV" },
    { date: "13th", day: "WED", month: "NOV" },
    { date: "14th", day: "THU", month: "NOV" },
    { date: "15th", day: "FRI", month: "NOV" },
    { date: "16th", day: "SAT", month: "NOV" },
    { date: "17th", day: "SUN", month: "NOV" },
    { date: "18th", day: "MON", month: "NOV" },
    { date: "19th", day: "TUE", month: "NOV" },
    { date: "20th", day: "WED", month: "NOV" },
    { date: "21st", day: "THU", month: "NOV" },
    { date: "22nd", day: "FRI", month: "NOV" },
    { date: "23rd", day: "SAT", month: "NOV" },
  ];

  const timeSlots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
  ];

  const handleSchedule = () => {
    if (selectedDay !== null && selectedTime !== null) {
      const selectedDate = `${days[selectedDay].month} ${days[selectedDay].date}`;
      onSchedule({ date: selectedDate, time: timeSlots[selectedTime] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-background rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto "
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-text">
              Schedule Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-text/60 hover:text-text/80"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-primary mb-6">
            <span>CONSULTATION FOR 1 PET</span>
            <ChevronRight className="size-5" />
            <span>Dr. Francis Katalbas</span>
            <ChevronRight className="size-5" />
            <span>Date & Time</span>
            <ChevronRight className="size-5" />
            <span>Complete</span>
          </div>

          <div className="relative overflow-x-auto mb-8">
            <div className="flex space-x-2 text-sm">
              {days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`mb-2 flex flex-col items-center min-w-[70px] p-2 rounded-2xl cursor-pointer border-[1.6px] border-green2
                    ${
                      selectedDay === index ? "bg-green3" : "hover:bg-green3/10"
                    }`}
                >
                  <span className="text-xs text-text/80">{day.day}</span>
                  <span className="text-lg font-semibold text-text">
                    {day.date}
                  </span>
                  <span className="text-xs text-text/80">{day.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-text/80 mb-6">
            <Clock size={16} />
            <span>(UTC +08:00) China, Singapore, Philippines, Hong Kong</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {timeSlots.map((time, index) => (
              <button
                key={index}
                onClick={() => setSelectedTime(index)}
                className={`p-3 text-center border-[1.6px] border-green2 rounded-2xl transition-colors text-text
                  ${
                    selectedTime === index ? "bg-green3" : "hover:bg-green3/10"
                  }`}
              >
                {time}
              </button>
            ))}
          </div>

          <button
            onClick={handleSchedule}
            disabled={selectedDay === null || selectedTime === null}
            className={`mt-8 w-full px-6 py-2 rounded-full border-[1.6px] border-green2 transition-colors text-text
              ${
                selectedDay !== null && selectedTime !== null
                  ? "bg-green3 hover:bg-green3/80"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
          >
            Confirm Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerModal;
