import React, { useState, useEffect } from "react";
import { Activity, AlertCircle } from "lucide-react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { format } from "date-fns";
import { useAuth } from "../../hooks/useAuth";

const WellnessTipsCard = () => {
  const [tips, setTips] = useState([]);
  const [userPlan, setUserPlan] = useState("free");
  const [lastChecked, setLastChecked] = useState(null);
  const { currentUser } = useAuth();

  const getTipFromText = async (category, service, petType) => {
    try {
      const response = await fetch("/tips.txt");
      const text = await response.text();
      const lines = text.split("\n").filter((line) => line.trim());

      let matchingLine = lines.find((line) => {
        const [cat, serv, pet] = line.split("|");
        return (
          cat === category.toUpperCase() &&
          serv === service &&
          pet === petType.toLowerCase()
        );
      });

      if (!matchingLine) {
        matchingLine = lines.find((line) => {
          const [cat, serv, pet] = line.split("|");
          return (
            cat === category.toUpperCase() &&
            serv === service &&
            pet === "default"
          );
        });
      }

      if (!matchingLine) {
        const defaultTips = lines.filter((line) => line.startsWith("DEFAULT"));
        matchingLine =
          defaultTips[Math.floor(Math.random() * defaultTips.length)];
      }

      return matchingLine ? matchingLine.split("|").pop() : null;
    } catch (error) {
      console.error("Error loading tips:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadTips = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        setUserPlan(userData?.plan || "free");

        if (userData?.plan === "free") return;

        const [petsSnapshot, appointmentsSnapshot] = await Promise.all([
          getDocs(
            query(
              collection(db, "pets"),
              where("userId", "==", currentUser.uid)
            )
          ),
          getDocs(
            query(
              collection(db, "appointments"),
              where("userId", "==", currentUser.uid),
              where("status", "in", ["Pending", "Confirmed"])
            )
          ),
        ]);

        const pets = petsSnapshot.docs.map((doc) => doc.data());
        const appointments = appointmentsSnapshot.docs.map((doc) => doc.data());

        const currentTips = [];
        for (const apt of appointments) {
          const serviceCategory = apt.service?.toLowerCase();
          const pet = pets.find((p) => p.id === apt.petId);
          const petType = pet?.species || "default";

          let category;
          if (serviceCategory?.includes("consultation"))
            category = "CONSULTATION";
          else if (serviceCategory?.includes("grooming")) category = "GROOMING";
          else if (serviceCategory?.includes("dental")) category = "DENTAL";

          if (category) {
            const tip = await getTipFromText(category, apt.service, petType);
            if (tip) {
              // If we already have 3 tips, replace the last one
              if (currentTips.length >= 3) {
                currentTips[2] = tip;
              } else {
                currentTips.push(tip);
              }
            }
          }
        }

        // Add default tip if no specific tips found
        if (currentTips.length === 0) {
          const defaultTip = await getTipFromText(
            "DEFAULT",
            "general",
            "default"
          );
          if (defaultTip) currentTips.push(defaultTip);
        }

        // Ensure we never have more than 3 tips
        setTips(currentTips.slice(0, 3));
        setLastChecked(new Date().toISOString());
      } catch (error) {
        console.error("Error loading wellness tips:", error);
      }
    };

    const now = new Date();
    const lastCheck = lastChecked ? new Date(lastChecked) : null;
    if (!lastCheck || now - lastCheck >= 8 * 60 * 60 * 1000) {
      loadTips();
    }

    const interval = setInterval(loadTips, 8 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser, lastChecked]);

  if (userPlan === "free") return null;

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="text-green2" size={24} />
          <h2 className="text-lg font-nunito-bold text-green2">
            Pet Wellness Tips
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div
            key={`${tip}-${index}`}
            className="flex items-start space-x-4 p-4 bg-green3/10 rounded-lg"
          >
            <div className="p-2 rounded-full bg-green3/20 text-green2">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="text-md font-nunito-bold text-primary/80">{tip}</p>
              <p className="text-xs text-primary/50 mt-1 font-nunito-semibold">
                Updated:{" "}
                {format(
                  lastChecked ? new Date(lastChecked) : new Date(),
                  "MMM d, yyyy h:mm a"
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WellnessTipsCard;
