import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const COLORS = ["#235840", "#5B9279", "#8FCB9B", "#D1E8D5"];
const SERVICE_CATEGORIES = ["Consultation", "Grooming", "Dental Care"];
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

const formatCurrency = (value) => {
  return `₱${value.toLocaleString()}`;
};

const filterDataByMonth = (data, selectedMonth) => {
  if (selectedMonth === "all") return data;

  const targetDate = new Date(selectedMonth);
  const targetMonth = targetDate.getMonth();
  const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1;
  const nextMonth = targetMonth === 11 ? 0 : targetMonth + 1;

  return data.filter((item) => {
    const itemMonth = monthNames.indexOf(item.month);
    return [prevMonth, targetMonth, nextMonth].includes(itemMonth);
  });
};

const sortByMonth = (data) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  return [...data].sort((a, b) => {
    let monthA = monthNames.indexOf(a.month);
    let monthB = monthNames.indexOf(b.month);

    if (monthA > currentMonth) monthA -= 12;
    if (monthB > currentMonth) monthB -= 12;

    return monthA - monthB;
  });
};

export function MonthlyRevenueChart({ data, selectedMonth }) {
  const filteredData = sortByMonth(filterDataByMonth(data, selectedMonth));

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <h3 className="font-nunito-bold text-green2 mb-6">Monthly Revenue</h3>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#C9DAD2" />
            <XAxis dataKey="month" stroke="#5B9279" />
            <YAxis stroke="#5B9279" tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "#FDFCFC",
                border: "2px solid #5B9279",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#235840"
              strokeWidth={3.5}
              opacity={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ServiceBreakdownChart({ data }) {
  const filteredData = data.filter((item) => item.value > 0);

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <h3 className="font-nunito-bold text-green2 mb-6">Service Breakdown</h3>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#235840"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{
                backgroundColor: "#FDFCFC",
                border: "2px solid #5B9279",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProductsSoldChart({ data, selectedMonth }) {
  const filteredData = sortByMonth(filterDataByMonth(data, selectedMonth));

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <h3 className="font-nunito-bold text-green2 mb-6">Products Sold</h3>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#C9DAD2" />
            <XAxis dataKey="month" stroke="#5B9279" />
            <YAxis
              stroke="#5B9279"
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              contentStyle={{
                backgroundColor: "#FDFCFC",
                border: "2px solid #5B9279",
              }}
            />
            <Line
              type="monotone"
              dataKey="products"
              name="Products"
              stroke="#8FCB9B"
              strokeWidth={3.5}
              opacity={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ServicesPerformedChart({ data, selectedMonth }) {
  const getFilteredData = (data, selectedMonth) => {
    if (selectedMonth === "all") {
      return sortByMonth(data);
    }

    const targetDate = new Date(selectedMonth);
    const targetMonth = monthNames[targetDate.getMonth()];
    const monthData = data.find((item) => item.month === targetMonth);

    if (!monthData) return [];

    return SERVICE_CATEGORIES.map((service, index) => ({
      month: monthData.month,
      name: service,
      value: monthData[service] || 0,
      fill: COLORS[index % COLORS.length],
    }));
  };

  const filteredData = getFilteredData(data, selectedMonth);
  const title =
    selectedMonth === "all"
      ? "Services Performed"
      : `Services Performed - ${filteredData[0]?.month || ""}`;

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <h3 className="font-nunito-bold text-green2 mb-6">{title}</h3>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#C9DAD2" />
            {selectedMonth === "all" ? (
              <>
                <XAxis dataKey="month" stroke="#5B9279" />
                {SERVICE_CATEGORIES.map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    name={category}
                    fill={COLORS[index % COLORS.length]}
                    opacity={0.9}
                  />
                ))}
              </>
            ) : (
              <>
                <XAxis dataKey="name" stroke="#5B9279" />
                <Bar
                  dataKey="value"
                  fill="#235840"
                  opacity={0.9}
                  name="Services"
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </>
            )}
            <YAxis stroke="#5B9279" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FDFCFC",
                border: "2px solid #5B9279",
              }}
            />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
