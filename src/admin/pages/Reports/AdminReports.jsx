import React, { useState, useEffect } from "react";
import { BarChart2, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../../firebase-config";
import AppointmentHistory from "../Reports/components/AppointmentHistory";
import OrderHistory from "../Reports/components/OrderHistory";
import {
  MonthlyRevenueChart,
  ServiceBreakdownChart,
  ProductsSoldChart,
  ServicesPerformedChart,
} from "../Reports/components/BusinessGraphs";
import StatusDropdown from "../../../components/StatusDropdown";

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

const getMonthDisplay = (date) => {
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

const isSameMonth = (date1, date2) => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

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

function Reports() {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [availableMonths, setAvailableMonths] = useState([]);
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

  const filterDataByMonth = (data, selectedMonth) => {
    if (selectedMonth === "all") return data;
    const targetDate = new Date(selectedMonth);
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return isSameMonth(itemDate, targetDate);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
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
      const processedOrders = new Set();
      const months = new Set();

      ordersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.createdAt?.seconds * 1000;
        const orderDate = new Date(timestamp);
        months.add(orderDate.toISOString().slice(0, 7));
        const monthKey = monthNames[orderDate.getMonth()];
        const orderTotal = data.price * data.quantity;

        if (!processedOrders.has(doc.id)) {
          totalProducts += data.quantity;
          processedOrders.add(doc.id);
        }

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
        productMonthlyData[monthKey] =
          (productMonthlyData[monthKey] || 0) + data.quantity;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + orderTotal;
      });

      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("status", "==", "Concluded")
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        months.add(new Date(data.date).toISOString().slice(0, 7));
        return {
          id: doc.id,
          ...data,
        };
      });

      const serviceMonthlyData = {};
      const serviceCategories = SERVICE_CATEGORIES.reduce((acc, category) => {
        acc[category] = 0;
        return acc;
      }, {});

      let appointmentRevenue = 0;

      appointmentsData.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const monthKey = monthNames[appointmentDate.getMonth()];
        const price = parseInt(appointment.price?.replace(/[^\d]/g, "")) || 0;

        appointmentRevenue += price;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + price;

        if (!serviceMonthlyData[monthKey]) {
          serviceMonthlyData[monthKey] = SERVICE_CATEGORIES.reduce(
            (acc, category) => {
              acc[category] = 0;
              return acc;
            },
            {}
          );
        }

        const service = appointment.service;
        if (service) {
          let category = null;

          if (service.toLowerCase().includes("consultation")) {
            category = "Consultation";
          } else if (service.toLowerCase().includes("grooming")) {
            category = "Grooming";
          } else if (service.toLowerCase().includes("dental")) {
            category = "Dental Care";
          }

          if (category) {
            serviceCategories[category]++;
            serviceMonthlyData[monthKey][category]++;
          }
        }
      });

      const totalServices = Object.values(serviceCategories).reduce(
        (a, b) => a + b,
        0
      );
      const serviceBreakdown = Object.entries(serviceCategories)
        .map(([name, value]) => ({
          name,
          value:
            totalServices > 0 ? Math.round((value / totalServices) * 100) : 0,
        }))
        .filter((item) => item.value > 0);

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
          revenue,
        }))
        .sort(
          (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
        );

      const productsData = Object.entries(productMonthlyData)
        .map(([month, products]) => ({
          month,
          products,
        }))
        .sort(
          (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
        );

      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);

      const sortedMonths = Array.from(months).sort().reverse();
      setAvailableMonths(sortedMonths);

      const currentMonth = new Date().toISOString().slice(0, 7);
      if (sortedMonths.includes(currentMonth)) {
        setSelectedMonth(currentMonth);
      }

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

  const filteredOrders = filterDataByMonth(orders, selectedMonth);
  const filteredAppointments = filterDataByMonth(appointments, selectedMonth);

  const filteredMetrics = {
    ...metrics,
    totalRevenue:
      selectedMonth === "all"
        ? metrics.totalRevenue
        : filteredOrders.reduce((sum, order) => sum + order.total, 0) +
          filteredAppointments.reduce(
            (sum, apt) => sum + parseInt(apt.price?.replace(/[^\d]/g, "") || 0),
            0
          ),
    totalProducts:
      selectedMonth === "all"
        ? metrics.totalProducts
        : filteredOrders.reduce(
            (sum, order) =>
              sum +
              order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
            0
          ),
    totalCustomers:
      selectedMonth === "all"
        ? metrics.totalCustomers
        : new Set([
            ...filteredOrders.map((order) => order.userId),
            ...filteredAppointments.map((apt) => apt.userId),
          ]).size,
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 mt-12">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">
          Business Reports
        </h1>
        <div className="relative mt-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center">
              <BarChart2 className="mr-2 text-primary size-7" />
              <p className="text-xl text-primary font-nunito-bold tracking-wide">
                Comprehensive Business Analytics
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm pt-4 sm:pt-0">
              <span className="text-green2 font-nunito-semibold whitespace-nowrap">
                Show results for:
              </span>
              <StatusDropdown
                statusOptions={[
                  "All Time",
                  ...availableMonths.map((month) =>
                    getMonthDisplay(new Date(month))
                  ),
                ]}
                selectedStatus={
                  selectedMonth === "all"
                    ? "All Time"
                    : getMonthDisplay(new Date(selectedMonth))
                }
                onStatusChange={(selected) => {
                  if (selected === "All Time") {
                    setSelectedMonth("all");
                  } else {
                    const monthDate = availableMonths.find(
                      (month) => getMonthDisplay(new Date(month)) === selected
                    );
                    setSelectedMonth(monthDate);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₱${filteredMetrics.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Customers"
          value={filteredMetrics.totalCustomers.toLocaleString()}
          icon={Users}
        />
        <MetricCard
          title="Total Products Sold"
          value={filteredMetrics.totalProducts.toLocaleString()}
          icon={ShoppingBag}
        />
      </div>

      <AppointmentHistory appointments={filteredAppointments} />
      <OrderHistory orders={filteredOrders} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MonthlyRevenueChart data={metrics.monthlyRevenue} />
        <ServiceBreakdownChart data={metrics.serviceBreakdown} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ProductsSoldChart data={metrics.monthlyProducts} />
        <ServicesPerformedChart data={metrics.monthlyServices} />
      </div>
    </div>
  );
}

export default Reports;
