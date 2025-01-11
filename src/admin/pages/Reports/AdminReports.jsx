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
      const processedOrders = new Set();

      ordersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.createdAt?.seconds * 1000;
        const orderDate = new Date(timestamp);
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
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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

      <AppointmentHistory appointments={appointments} />
      <OrderHistory orders={orders} />

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
