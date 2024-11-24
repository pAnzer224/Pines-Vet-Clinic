import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { BarChart2, TrendingUp, Users, ShoppingBag } from "lucide-react";

// Sample data for monthly revenue
const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
];

// Sample data for service breakdown
const serviceBreakdown = [
  { name: "Veterinary Consultations", value: 40 },
  { name: "Grooming", value: 30 },
  { name: "Dental Care", value: 20 },
  { name: "Vaccinations", value: 10 },
];

// Color palette for the pie chart segments
const COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac"];

// Component for displaying metric cards (e.g., Total Revenue, Customers, Products)
function MetricCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-green2 font-nunito-medium">{title}</p>
          <p className="text-2xl font-nunito-bold mt-2 text-primary">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-green3/10 text-green2">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// Main Reports component
function Reports() {
  return (
    // Adjusted to match sidebar layout with proper padding and max-width
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">
          Business Reports
        </h1>
        <div className="flex items-center mt-5">
          <BarChart2 className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Comprehensive Business Analytics
          </p>
        </div>
      </div>

      {/* Metrics cards grid - responsive for all screen sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard title="Total Revenue" value="₱85,000" icon={TrendingUp} />
        <MetricCard title="Total Customers" value="342" icon={Users} />
        <MetricCard
          title="Total Products Sold"
          value="1,248"
          icon={ShoppingBag}
        />
      </div>

      {/* Charts grid - responsive layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Bar Chart section */}
        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <h3 className="font-nunito-bold text-green2 mb-6">Monthly Revenue</h3>
          {/* Responsive chart container with minimum height */}
          <div className="w-full h-[300px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="month" stroke="#16a34a" />
                <YAxis stroke="#16a34a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #16a34a40",
                  }}
                />
                <Bar dataKey="revenue" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart section */}
        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <h3 className="font-nunito-bold text-green2 mb-6">
            Service Breakdown
          </h3>
          {/* Responsive chart container with minimum height */}
          <div className="w-full h-[300px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#16a34a"
                  label
                >
                  {serviceBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #16a34a40",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
