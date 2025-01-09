import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Clock } from "lucide-react";
import { db } from "../../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const TimeSlotManager = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState("AM");

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const timeSlotsRef = collection(db, "timeSlots");
      const snapshot = await getDocs(timeSlotsRef);
      const slots = snapshot.docs.map((doc) => ({
        id: doc.id,
        time: doc.data().time,
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

  const addTimeSlot = async () => {
    const formattedTime = `${hours}:${minutes} ${period}`;
    try {
      const timeSlotsRef = collection(db, "timeSlots");
      await addDoc(timeSlotsRef, { time: formattedTime });
      fetchTimeSlots();
    } catch (error) {
      console.error("Error adding time slot:", error);
    }
  };

  const deleteTimeSlot = async (id) => {
    try {
      await deleteDoc(doc(db, "timeSlots", id));
      fetchTimeSlots();
    } catch (error) {
      console.error("Error deleting time slot:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-nunito-bold text-green2 mb-4">Manage Time Slots</h3>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-32">
            <label className="block font-nunito-semibold text-text/80 mb-2">
              Hour
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label className="block font-nunito-semibold text-text/80 mb-2">
              Minute
            </label>
            <select
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
            >
              {["00", "15", "30", "45"].map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label className="block font-nunito-semibold text-text/80 mb-2">
              AM/PM
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={addTimeSlot}
              className="flex items-center gap-2 px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito-semibold h-10"
            >
              <PlusCircle size={20} />
              Add time slot
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {timeSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3 bg-background/95 rounded-lg border border-green3/30"
            >
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-green2" />
                <span className="font-nunito-semibold">{slot.time}</span>
              </div>
              <button
                onClick={() => deleteTimeSlot(slot.id)}
                className="text-red hover:text-red/80"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotManager;
