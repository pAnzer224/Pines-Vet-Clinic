import { useState, useContext, createContext, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase-config";

const MonthlyReportsContext = createContext();

export function MonthlyReportsProvider({ children }) {
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [availableMonths, setAvailableMonths] = useState([]);

  const getDateRange = (selectedMonth) => {
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    if (!selectedMonth || selectedMonth === "current") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: startOfMonth, endDate: endOfMonth };
    }

    const [month, year] = selectedMonth.split(" ");
    const monthIndex = monthNames.indexOf(month.substring(0, 3));
    const startOfMonth = new Date(parseInt(year), monthIndex, 1);
    const endOfMonth = new Date(parseInt(year), monthIndex + 1, 0);
    return { startDate: startOfMonth, endDate: endOfMonth };
  };

  useEffect(() => {
    const fetchAvailableMonths = async () => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const appointmentsSnapshot = await getDocs(
        collection(db, "appointments")
      );

      const months = new Set();
      const now = new Date();

      // Add current month
      months.add(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);

      // Process orders
      ordersSnapshot.docs.forEach((doc) => {
        const date = doc.data().createdAt?.toDate();
        if (date) {
          months.add(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
        }
      });

      // Process appointments
      appointmentsSnapshot.docs.forEach((doc) => {
        const date = new Date(doc.data().date);
        if (date && !isNaN(date)) {
          months.add(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
        }
      });

      // Convert to array and sort
      const sortedMonths = Array.from(months).sort((a, b) => {
        const [monthA, yearA] = a.split(" ");
        const [monthB, yearB] = b.split(" ");
        const dateA = new Date(yearA, monthNames.indexOf(monthA));
        const dateB = new Date(yearB, monthNames.indexOf(monthB));
        return dateB - dateA;
      });

      setAvailableMonths(sortedMonths);
    };

    fetchAvailableMonths();
  }, []);

  return (
    <MonthlyReportsContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        availableMonths,
        getDateRange,
      }}
    >
      {children}
    </MonthlyReportsContext.Provider>
  );
}

export function useMonthlyReportsContext() {
  const context = useContext(MonthlyReportsContext);
  if (!context) {
    throw new Error(
      "useMonthlyReportsContext must be used within a MonthlyReportsProvider"
    );
  }
  return context;
}
