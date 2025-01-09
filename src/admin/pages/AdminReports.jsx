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
} from "recharts";
import {
  BarChart2,
  TrendingUp,
  Users,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../firebase-config";

const COLORS = ["#235840", "#5B9279", "#8FCB9B", "#D1E8D5"];
const SERVICE_CATEGORIES = ["Consultation", "Grooming", "Dental Care"];

function MetricCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-green2 font-nunito-semibold">{title}</p>
          <p className="text-2xl font-nunito-bold mt-2 text-primary">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-green3/10 text-green2">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function AppointmentAccordion({ appointment, isOpen, onToggle }) {
  const isPastAppointment = new Date(appointment.date) < new Date();
  const displayStatus = isPastAppointment ? "Concluded" : appointment.status;

  return (
    <div className="border-2 border-green3/60 rounded-lg mb-2">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-green3/10 rounded-t-lg"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-nunito-bold text-green2">
            {appointment.petName}
          </span>
          <div className="flex items-center">
            <span className="font-nunito-bold text-primary mr-2">
              {appointment.userName}
            </span>
          </div>
          <span className="font-nunito-semibold text-primary">
            {appointment.price}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text/60 hidden sm:inline text-sm">
            {appointment.date}
          </span>
          {isOpen ? (
            <ChevronUp className="text-green2" />
          ) : (
            <ChevronDown className="text-green2" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-4">
          <div className="sm:hidden mb-2 text-text/60">{appointment.date}</div>
          <div className="space-y-2">
            <p className="text-text">
              <span className="font-semibold">Service:</span>{" "}
              {appointment.service}
            </p>
            <p className="text-text">
              <span className="font-semibold">Category:</span>{" "}
              {appointment.category}
            </p>
            <p className="text-text">
              <span className="font-semibold">Duration:</span>{" "}
              {appointment.duration}
            </p>
            <p className="text-text">
              <span className="font-semibold">Status:</span> {displayStatus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentHistoryAccordion({ appointments }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openAppointmentId, setOpenAppointmentId] = useState(null);

  return (
    <div className="bg-background rounded-lg shadow-sm border-2 border-green3/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-green3/10"
      >
        <h3 className="font-nunito-bold text-green2">Appointment History</h3>
        {isOpen ? (
          <ChevronUp className="text-green2" />
        ) : (
          <ChevronDown className="text-green2" />
        )}
      </button>
      {isOpen && (
        <div className="p-6 space-y-2">
          {appointments.map((appointment) => (
            <AppointmentAccordion
              key={appointment.id}
              appointment={appointment}
              isOpen={openAppointmentId === appointment.id}
              onToggle={() =>
                setOpenAppointmentId(
                  openAppointmentId === appointment.id ? null : appointment.id
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderAccordion({ order, isOpen, onToggle }) {
  return (
    <div className="border-2 border-green3/60 rounded-lg mb-2">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-green3/10 rounded-t-lg"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-nunito-bold text-green2 max-w-[18ch] truncate">
            Order #{order.orderId}
          </span>
          <div className="flex items-center">
            <span className="font-nunito-bold text-primary mr-2">
              {order.userName}
            </span>
            <div className="group relative">
              <Info className="w-4 h-4 text-green2" />
              <div className="text-xs font-nunito-bold text-primary/80 tracking-wider absolute hidden group-hover:block bg-background border-2 border-green3/60 p-2 rounded-md z-10 top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                User ID: {order.userId}
              </div>
            </div>
          </div>
          <span className="font-nunito-semibold text-primary">
            Total: ₱{order.total.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text/60 hidden sm:inline text-sm">
            {new Date(order.date).toLocaleDateString()}
          </span>
          {isOpen ? (
            <ChevronUp className="text-green2" />
          ) : (
            <ChevronDown className="text-green2" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 space-y-2">
          <div className="sm:hidden mb-2 text-text/60">
            {new Date(order.date).toLocaleDateString()}
          </div>
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-green3/30 last:border-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <p className="font-nunito-semibold text-text">
                    {item.productName}
                  </p>
                  <p className="text-sm text-text/60">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-nunito-semibold text-primary">
                ₱{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderHistoryAccordion({ orders }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openOrderId, setOpenOrderId] = useState(null);

  return (
    <div className="bg-background rounded-lg shadow-sm border-2 border-green3/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-green3/10"
      >
        <h3 className="font-nunito-bold text-green2">Order History</h3>
        {isOpen ? (
          <ChevronUp className="text-green2" />
        ) : (
          <ChevronDown className="text-green2" />
        )}
      </button>
      {isOpen && (
        <div className="p-6 space-y-2">
          {orders.map((order) => (
            <OrderAccordion
              key={order.orderId}
              order={order}
              isOpen={openOrderId === order.orderId}
              onToggle={() =>
                setOpenOrderId(
                  openOrderId === order.orderId ? null : order.orderId
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Reports() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    monthlyRevenue: [],
    monthlyProducts: [],
    monthlyServices: [],
    serviceBreakdown: [],
  });
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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

      const ordersQuery = query(
        collection(db, "orders"),
        where("status", "in", ["Confirmed", "Received"])
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      const orderGroups = {};
      let totalRevenue = 0;
      let totalProducts = 0;
      const monthlyData = {};
      const productMonthlyData = {};

      ordersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.createdAt?.seconds * 1000;
        const orderDate = new Date(timestamp);
        const monthKey = monthNames[orderDate.getMonth()];
        const orderTotal = data.price * data.quantity;

        const groupKey = `${data.userId}_${timestamp}`;
        if (!orderGroups[groupKey]) {
          orderGroups[groupKey] = {
            orderId: groupKey,
            userId: data.userId,
            userName: data.userName,
            date: orderDate,
            items: [],
            total: 0,
          };
        }

        orderGroups[groupKey].items.push({
          productId: data.productId,
          productName: data.productName,
          productImage: data.productImage,
          price: data.price,
          quantity: data.quantity,
        });
        orderGroups[groupKey].total += orderTotal;

        totalRevenue += orderTotal;
        totalProducts += data.quantity;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + orderTotal;
        productMonthlyData[monthKey] =
          (productMonthlyData[monthKey] || 0) + data.quantity;
      });

      const appointmentsQuery = query(collection(db, "appointments"));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const serviceMonthlyData = {};
      const serviceCategories = {
        Consultation: 0,
        Grooming: 0,
        "Dental Care": 0,
      };
      let appointmentRevenue = 0;

      appointmentsData.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const monthKey = monthNames[appointmentDate.getMonth()];
        if (appointmentDate < new Date()) {
          const price = parseInt(appointment.price?.replace(/[^\d]/g, "")) || 0;
          appointmentRevenue += price;
          if (
            appointment.category &&
            SERVICE_CATEGORIES.includes(appointment.category)
          ) {
            serviceCategories[appointment.category]++;
          }
          if (!serviceMonthlyData[monthKey]) {
            serviceMonthlyData[monthKey] = {
              Consultation: 0,
              Grooming: 0,
              "Dental Care": 0,
            };
          }

          if (
            appointment.category &&
            SERVICE_CATEGORIES.includes(appointment.category)
          ) {
            serviceMonthlyData[monthKey][appointment.category]++;
          }
        }
      });

      const totalServices = Object.values(serviceCategories).reduce(
        (a, b) => a + b,
        0
      );
      const serviceBreakdown = Object.entries(serviceCategories).map(
        ([name, value]) => ({
          name,
          value:
            totalServices > 0 ? Math.round((value / totalServices) * 100) : 0,
        })
      );

      const servicesData = Object.entries(serviceMonthlyData)
        .map(([month, categories]) => ({
          month,
          ...categories,
        }))
        .sort(
          (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
        );

      const revenueData = Object.entries(monthlyData)
        .map(([month, revenue]) => ({
          month,
          revenue: revenue + (appointmentRevenue || 0),
        }))
        .sort(
          (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
        );

      const productsData = Object.entries(productMonthlyData)
        .map(([month, products]) => ({ month, products }))
        .sort(
          (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
        );

      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);

      setMetrics({
        totalRevenue: totalRevenue + appointmentRevenue,
        totalCustomers: usersSnapshot.size,
        totalProducts,
        monthlyRevenue: revenueData,
        monthlyProducts: productsData,
        monthlyServices: servicesData,
        serviceBreakdown,
      });

      setOrders(Object.values(orderGroups).sort((a, b) => b.date - a.date));
      setAppointments(appointmentsData);
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 mt-12">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₱${metrics.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          icon={Users}
        />
        <MetricCard
          title="Total Products Sold"
          value={metrics.totalProducts.toLocaleString()}
          icon={ShoppingBag}
        />
      </div>

      <AppointmentHistoryAccordion appointments={appointments} />
      <OrderHistoryAccordion orders={orders} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <h3 className="font-nunito-bold text-green2 mb-6">Monthly Revenue</h3>
          <div className="w-full h-[300px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.monthlyRevenue}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="month" stroke="#5B9279" />
                <YAxis stroke="#5B9279" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FDFCFC",
                    border: "2px solid #5B9279",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#235840"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <h3 className="font-nunito-bold text-green2 mb-6">
            Service Breakdown
          </h3>
          <div className="w-full h-[300px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.serviceBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#235840"
                  label
                >
                  {metrics.serviceBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FDFCFC",
                    border: "2px solid #5B9279",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <h3 className="font-nunito-bold text-green2 mb-6">Products Sold</h3>
          <div className="w-full h-[300px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.monthlyProducts}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="month" stroke="#5B9279" />
                <YAxis stroke="#5B9279" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FDFCFC",
                    border: "2px solid #5B9279",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="products"
                  stroke="#8FCB9B"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <h3 className="font-nunito-bold text-green2 mb-6">
            Services Performed
          </h3>
          <div className="w-full h-[300px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.monthlyServices}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="month" stroke="#5B9279" />
                <YAxis stroke="#5B9279" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FDFCFC",
                    border: "2px solid #5B9279",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Consultation"
                  stroke="#235840"
                  strokeWidth={3}
                  name="Consultation"
                />
                <Line
                  type="monotone"
                  dataKey="Grooming"
                  stroke="#8FCB9B"
                  strokeWidth={3}
                  name="Grooming"
                />
                <Line
                  type="monotone"
                  dataKey="Dental Care"
                  stroke="#D1E8D5"
                  strokeWidth={3}
                  name="Dental Care"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
