import React from "react";
import { Calendar } from "lucide-react";

export const MonthSelector = ({
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  const currentDate = new Date();
  const options = { month: "long" };
  const currentMonth = currentDate.toLocaleDateString("en-US", options);

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Calendar className="h-5 w-5 text-green2" />
      </div>
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-64 pl-10 pr-4 py-2 appearance-none bg-background border-2 border-green3/60 rounded-lg text-primary font-nunito-semibold focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent cursor-pointer"
      >
        <option value={currentMonth}>{currentMonth}</option>
        {availableMonths.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
};
