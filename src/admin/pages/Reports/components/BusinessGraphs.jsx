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
} from "recharts";

const COLORS = ["#235840", "#5B9279", "#8FCB9B", "#D1E8D5"];
const SERVICE_CATEGORIES = ["Consultation", "Grooming", "Dental Care"];

const formatCurrency = (value) => {
  return `₱${value.toLocaleString()}`;
};

export function MonthlyRevenueChart({ data }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <h3 className="font-nunito-bold text-green2 mb-6">Monthly Revenue</h3>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
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
              strokeWidth={3}
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

export function ProductsSoldChart({ data }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <h3 className="font-nunito-bold text-green2 mb-6">Products Sold</h3>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
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
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ServicesPerformedChart({ data }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <h3 className="font-nunito-bold text-green2 mb-6">Services Performed</h3>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="month" stroke="#5B9279" />
            <YAxis stroke="#5B9279" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FDFCFC",
                border: "2px solid #5B9279",
              }}
            />
            {SERVICE_CATEGORIES.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                name={category}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                dot={{ fill: COLORS[index % COLORS.length] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
