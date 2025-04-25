import React, { useState, useEffect } from "react";
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
  Area,
  ComposedChart,
} from "recharts";
import useFirestoreCrud from "../../../../hooks/useFirestoreCrud";

const COLORS = [
  "#235840",
  "#5B9279",
  "#8FCB9B",
  "#D1E8D5",
  "#9DC88D",
  "#429B73",
];
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

// Service breakdown details
const SERVICE_DETAILS = {
  Consultation: ["General Check-up", "Vaccination", "Medical Assessment"],
  Grooming: ["Basic Grooming", "Full Service Grooming", "Bath & Brush"],
  "Dental Care": ["Dental Check-up", "Teeth Cleaning", "Dental Surgery"],
};

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

const filterWeeklyDataByMonth = (data, selectedMonth) => {
  if (selectedMonth === "all") return data;

  const targetDate = new Date(selectedMonth);
  const targetMonth = monthNames[targetDate.getMonth()];

  return data.filter((item) => item.month === targetMonth);
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

export function MonthlyRevenueChart({ data, weeklyData, selectedMonth }) {
  const [viewMode, setViewMode] = useState("monthly");
  const [categoryMode, setCategoryMode] = useState("total");
  const { items: orders } = useFirestoreCrud("orders");
  const { items: appointments } = useFirestoreCrud("appointments");
  const [categorizedData, setCategorizedData] = useState({
    monthly: [],
    weekly: [],
  });

  useEffect(() => {
    const processData = () => {
      if (!orders.length && !appointments.length) return;

      // Initialize data structures
      const monthlyRevenue = {};
      const weeklyRevenue = {};

      // Process orders data (products)
      orders.forEach((order) => {
        if (
          !order.createdAt ||
          !["Confirmed", "Received"].includes(order.status)
        )
          return;

        const orderDate = new Date(order.createdAt.seconds * 1000);
        const month = monthNames[orderDate.getMonth()];
        const week = Math.ceil(orderDate.getDate() / 7);
        const weekKey = `Week ${week}`;
        const monthWeekKey = `${month}-${weekKey}`;
        const orderTotal = order.price * order.quantity;

        // Initialize monthly structure if needed
        if (!monthlyRevenue[month]) {
          monthlyRevenue[month] = {
            month,
            revenue: 0,
            productRevenue: 0,
            serviceRevenue: 0,
          };
        }

        // Initialize weekly structure if needed
        if (!weeklyRevenue[monthWeekKey]) {
          weeklyRevenue[monthWeekKey] = {
            month,
            displayName: weekKey,
            revenue: 0,
            productRevenue: 0,
            serviceRevenue: 0,
          };
        }

        // Update revenues
        monthlyRevenue[month].revenue += orderTotal;
        monthlyRevenue[month].productRevenue += orderTotal;
        weeklyRevenue[monthWeekKey].revenue += orderTotal;
        weeklyRevenue[monthWeekKey].productRevenue += orderTotal;
      });

      // Process appointments data (services)
      appointments.forEach((appointment) => {
        if (appointment.status !== "Concluded" || !appointment.date) return;

        const appointmentDate = new Date(appointment.date);
        const month = monthNames[appointmentDate.getMonth()];
        const week = Math.ceil(appointmentDate.getDate() / 7);
        const weekKey = `Week ${week}`;
        const monthWeekKey = `${month}-${weekKey}`;
        const price = parseInt(appointment.price?.replace(/[^\d]/g, "")) || 0;

        // Initialize monthly structure if needed
        if (!monthlyRevenue[month]) {
          monthlyRevenue[month] = {
            month,
            revenue: 0,
            productRevenue: 0,
            serviceRevenue: 0,
          };
        }

        // Initialize weekly structure if needed
        if (!weeklyRevenue[monthWeekKey]) {
          weeklyRevenue[monthWeekKey] = {
            month,
            displayName: weekKey,
            revenue: 0,
            productRevenue: 0,
            serviceRevenue: 0,
          };
        }

        // Update revenues
        monthlyRevenue[month].revenue += price;
        monthlyRevenue[month].serviceRevenue += price;
        weeklyRevenue[monthWeekKey].revenue += price;
        weeklyRevenue[monthWeekKey].serviceRevenue += price;
      });

      // Convert to arrays and sort
      const monthlyData = Object.values(monthlyRevenue);
      const weeklyData = Object.values(weeklyRevenue).sort((a, b) => {
        const monthDiff =
          monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
        if (monthDiff !== 0) return monthDiff;
        return (
          parseInt(a.displayName.replace("Week ", "")) -
          parseInt(b.displayName.replace("Week ", ""))
        );
      });

      setCategorizedData({
        monthly: sortByMonth(monthlyData),
        weekly: weeklyData,
      });
    };

    processData();
  }, [orders, appointments]);

  // Use processed data if available, otherwise use props data
  const filteredMonthlyData = sortByMonth(
    filterDataByMonth(
      categorizedData.monthly.length ? categorizedData.monthly : data,
      selectedMonth
    )
  );

  const filteredWeeklyData = filterWeeklyDataByMonth(
    categorizedData.weekly.length ? categorizedData.weekly : weeklyData,
    selectedMonth
  );

  const displayData =
    viewMode === "monthly" ? filteredMonthlyData : filteredWeeklyData;
  const xDataKey = viewMode === "monthly" ? "month" : "displayName";

  // Custom tooltip that shows categorized revenue
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const hasCategories =
      data.productRevenue !== undefined && data.serviceRevenue !== undefined;

    return (
      <div className="p-4 bg-background border-2 border-green2 rounded-md shadow-md">
        <p className="font-bold text-green2 mb-2">{label}</p>
        <div className="border-t border-green3/40 pt-2">
          <p className="text-sm mb-1 font-nunito-bold">
            Total Revenue: {formatCurrency(data.revenue)}
          </p>
          {hasCategories && (
            <>
              <div className="flex justify-between text-xs mb-1">
                <span>Products:</span>
                <span className="font-nunito-bold ml-4">
                  {formatCurrency(data.productRevenue)}
                </span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span>Services:</span>
                <span className="font-nunito-bold ml-4">
                  {formatCurrency(data.serviceRevenue)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-nunito-bold text-green2">
          {viewMode === "monthly" ? "Monthly Revenue" : "Weekly Revenue"}
        </h3>
        <div className="flex gap-2">
          <div className="flex gap-1 text-sm">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1 rounded ${
                viewMode === "monthly"
                  ? "bg-green2 text-background"
                  : "bg-green3/20 text-green2"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1 rounded ${
                viewMode === "weekly"
                  ? "bg-green2 text-background"
                  : "bg-green3/20 text-green2"
              }`}
            >
              Weekly
            </button>
          </div>
          <div className="h-7 border-l border-green3/60"></div>
          <div className="flex gap-1 text-sm">
            <button
              onClick={() => setCategoryMode("total")}
              className={`px-3 py-1 rounded ${
                categoryMode === "total"
                  ? "bg-green2 text-background"
                  : "bg-green3/20 text-green2"
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setCategoryMode("categorized")}
              className={`px-3 py-1 rounded ${
                categoryMode === "categorized"
                  ? "bg-green2 text-background"
                  : "bg-green3/20 text-green2"
              }`}
            >
              Categorized
            </button>
          </div>
        </div>
      </div>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {categoryMode === "total" ? (
            <LineChart
              data={displayData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#C9DAD2" />
              <XAxis dataKey={xDataKey} stroke="#5B9279" />
              <YAxis stroke="#5B9279" tickFormatter={formatCurrency} />
              <Tooltip
                content={<CustomTooltip />}
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
          ) : (
            <ComposedChart
              data={displayData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#C9DAD2" />
              <XAxis dataKey={xDataKey} stroke="#5B9279" />
              <YAxis stroke="#5B9279" tickFormatter={formatCurrency} />
              <Tooltip
                content={<CustomTooltip />}
                contentStyle={{
                  backgroundColor: "#FDFCFC",
                  border: "2px solid #5B9279",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="productRevenue"
                name="Products"
                stackId="1"
                fill="#8FCB9B"
                stroke="#5B9279"
              />
              <Area
                type="monotone"
                dataKey="serviceRevenue"
                name="Services"
                stackId="1"
                fill="#D1E8D5"
                stroke="#9DC88D"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Total Revenue"
                stroke="#235840"
                strokeWidth={2.5}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Service breakdown details
const ServiceBreakdownTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const category = data.name;
  const percentage = data.value;

  // Get the services for this category
  const services = SERVICE_DETAILS[category] || [];

  // Calculate percentages for each service
  const totalServices = services.length;
  const servicePercentages = services.map((service, index) => {
    const weight = totalServices - index;
    const servicePercentage =
      (percentage * weight) / ((totalServices * (totalServices + 1)) / 2);
    return {
      name: service,
      percentage: servicePercentage.toFixed(1),
    };
  });

  return (
    <div className="p-4 bg-background border-2 border-green2 rounded-md shadow-md">
      <p className="font-bold text-green2 mb-2">
        {category}: {percentage}%
      </p>
      <div className="border-t border-green3/40 pt-2">
        <p className="text-sm font-nunito-bold mb-1 text-primary">Services:</p>
        {servicePercentages.map((service, i) => (
          <div key={i} className="flex justify-between text-xs mb-1">
            <span>{service.name}:</span>
            <span className="font-nunito-bold ml-4">{service.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function ServiceBreakdownChart({ data, selectedMonth }) {
  const filteredData = data.filter((item) => item.value > 0);

  // Adjust title based on whether we're showing filtered data
  const title =
    selectedMonth === "all"
      ? "Service Breakdown"
      : `Service Breakdown (${new Date(selectedMonth).toLocaleString(
          "default",
          { month: "long", year: "numeric" }
        )})`;

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <h3 className="font-nunito-bold text-green2 mb-6">{title}</h3>
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
            <Tooltip content={<ServiceBreakdownTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Custom tooltip for the products sold chart
const ProductsSoldTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="p-4 bg-background border-2 border-green2 rounded-md shadow-md">
      <p className="font-bold text-green2 mb-2">
        {data.month || data.displayName}: {data.products.toLocaleString()}{" "}
        products
      </p>
      {data.productBreakdown && (
        <div className="border-t border-green3/40 pt-2">
          <p className="text-sm font-nunito-bold mb-1 text-primary">
            Top Products:
          </p>
          {Object.entries(data.productBreakdown)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([product, count], i) => (
              <div key={i} className="flex justify-between text-xs mb-1">
                <span>{product}:</span>
                <span className="font-nunito-bold ml-4">{count}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export function ProductsSoldChart({ data, weeklyData, selectedMonth }) {
  const [viewMode, setViewMode] = useState("monthly");
  const [productBreakdown, setProductBreakdown] = useState({});
  const { items: products } = useFirestoreCrud("products");
  const { items: orders } = useFirestoreCrud("orders");

  useEffect(() => {
    if (orders.length > 0 && products.length > 0) {
      // Calculate product breakdown by month
      const breakdown = {};

      orders.forEach((order) => {
        const orderDate = order.createdAt
          ? new Date(order.createdAt.seconds * 1000)
          : new Date();
        const month = monthNames[orderDate.getMonth()];
        const week = Math.ceil(orderDate.getDate() / 7);
        const weekDisplayName = `Week ${week}`;

        if (!breakdown[month]) {
          breakdown[month] = {};
        }

        if (!breakdown[month][weekDisplayName]) {
          breakdown[month][weekDisplayName] = {};
        }

        if (!breakdown[month].total) {
          breakdown[month].total = {};
        }

        // Add to week breakdown
        if (breakdown[month][weekDisplayName][order.productName]) {
          breakdown[month][weekDisplayName][order.productName] +=
            order.quantity;
        } else {
          breakdown[month][weekDisplayName][order.productName] = order.quantity;
        }

        // Add to month total
        if (breakdown[month].total[order.productName]) {
          breakdown[month].total[order.productName] += order.quantity;
        } else {
          breakdown[month].total[order.productName] = order.quantity;
        }
      });

      setProductBreakdown(breakdown);
    }
  }, [orders, products]);

  // Enhance data with product breakdown
  const enhanceDataWithBreakdown = (dataArray) => {
    return dataArray.map((item) => {
      const month = item.month;
      const weekName = item.displayName;

      if (viewMode === "monthly" && productBreakdown[month]?.total) {
        return {
          ...item,
          productBreakdown: productBreakdown[month].total,
        };
      } else if (viewMode === "weekly" && productBreakdown[month]?.[weekName]) {
        return {
          ...item,
          productBreakdown: productBreakdown[month][weekName],
        };
      }

      return item;
    });
  };

  const filteredMonthlyData = enhanceDataWithBreakdown(
    sortByMonth(filterDataByMonth(data, selectedMonth))
  );
  const filteredWeeklyData = enhanceDataWithBreakdown(
    filterWeeklyDataByMonth(weeklyData, selectedMonth)
  );

  const displayData =
    viewMode === "monthly" ? filteredMonthlyData : filteredWeeklyData;
  const xDataKey = viewMode === "monthly" ? "month" : "displayName";

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-nunito-bold text-green2">
          {viewMode === "monthly"
            ? "Monthly Products Sold"
            : "Weekly Products Sold"}
        </h3>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-3 py-1 rounded ${
              viewMode === "monthly"
                ? "bg-green2 text-background"
                : "bg-green3/20 text-green2"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-3 py-1 rounded ${
              viewMode === "weekly"
                ? "bg-green2 text-background"
                : "bg-green3/20 text-green2"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>
      <div className="w-full h-[300px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#C9DAD2" />
            <XAxis dataKey={xDataKey} stroke="#5B9279" />
            <YAxis
              stroke="#5B9279"
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              content={<ProductsSoldTooltip />}
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

const ServicesPerformedTooltip = ({ active, payload, label, coordinate }) => {
  if (!active || !payload || !payload.length) return null;

  const tooltipStyle = {
    transform: "translate(20px, -100%)",
    position: "relative",
    pointerEvents: "none",
  };

  return (
    <div
      className="p-4 bg-background border-2 border-green2 rounded-md shadow-md"
      style={tooltipStyle}
    >
      <p className="font-bold text-green2 mb-2">
        {payload[0].payload.month || payload[0].payload.name}
      </p>
      <div className="border-t border-green3/40 pt-2">
        {payload.map((entry, index) => {
          // Handles both monthly view and single month view
          const category = entry.dataKey || entry.payload.name;
          const count = entry.value;

          if (count <= 0) return null;

          // Get breakdown for this service category
          const serviceTypes = SERVICE_DETAILS[category] || [];

          return (
            <div key={index} className="mb-2">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="font-nunito-bold text-sm">
                  {category}: {count}
                </span>
              </div>

              {serviceTypes.length > 0 && (
                <div className="ml-5 mt-1">
                  {serviceTypes.map((service, idx) => {
                    const weight = serviceTypes.length - idx;
                    const serviceCount = Math.round(
                      (count * weight) /
                        ((serviceTypes.length * (serviceTypes.length + 1)) / 2)
                    );

                    return (
                      <div
                        key={idx}
                        className="flex justify-between text-xs mb-1"
                      >
                        <span>- {service}:</span>
                        <span className="font-nunito-bold ml-4">
                          {serviceCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function ServicesPerformedChart({ data, selectedMonth }) {
  const getFilteredData = (data, selectedMonth) => {
    if (selectedMonth === "all") {
      return sortByMonth(data);
    }

    const targetDate = new Date(selectedMonth);
    const targetMonth = monthNames[targetDate.getMonth()];
    const monthData = data.find((item) => item.month === targetMonth);

    if (!monthData) return [];
    return SERVICE_CATEGORIES.map((service) => ({
      name: service,
      value: monthData[service] || 0,
      fill: COLORS[SERVICE_CATEGORIES.indexOf(service) % COLORS.length],
    })).filter((item) => item.value > 0);
  };

  const filteredData = getFilteredData(data, selectedMonth);

  let monthDisplay = "";
  if (selectedMonth !== "all") {
    const targetDate = new Date(selectedMonth);
    monthDisplay = targetDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }

  const title =
    selectedMonth === "all"
      ? "Services Performed"
      : `Services Performed - ${monthDisplay}`;

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
              content={<ServicesPerformedTooltip />}
              cursor={{ fill: "transparent" }}
              offset={20}
              position={{ x: "auto", y: "auto" }}
            />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {filteredData.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          No services data available for this period
        </div>
      )}
    </div>
  );
}
