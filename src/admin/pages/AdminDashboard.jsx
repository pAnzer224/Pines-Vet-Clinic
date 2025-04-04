import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Clock,
  Package,
  UserPlus,
  PawPrint,
  Shield,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase-config";

function MetricCard({ title, value, change, icon: Icon }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-primary font-nunito-bold">{title}</p>
          <p className="text-2xl font-nunito-bold mt-2 text-primary">{value}</p>
          <p className="text-sm text-primary mt-1 font-nunito-semibold">
            {change} from last month
          </p>
        </div>
        <div className="p-3 rounded-full bg-green3/10 text-green2">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, description, time, icon: Icon, status }) {
  return (
    <div
      className={`flex items-start space-x-4 p-5 hover:bg-green3/10 rounded-lg relative ${
        status === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <div className="bg-green3/10 p-2 rounded-full text-green2">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-nunito-bold text-green2">{title}</p>
        <p className="text-sm font-nunito-semibold text-primary/50">
          {description}
        </p>
        <p className="text-xs font-nunito-bold text-gray-400 mt-1">{time}</p>
      </div>
      {status === "cancelled" && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <span className="bg-red/10 text-red text-xs font-nunito-bold tracking-wide px-2.5 py-0.5 rounded-full">
            Cancelled
          </span>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    appointmentsToday: 0,
    shopOrders: 0,
    revenue: 0,
  });
  const [metricsChange, setMetricsChange] = useState({
    customersChange: "0%",
    appointmentsChange: "0%",
    ordersChange: "0%",
    revenueChange: "0%",
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get users count
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalCustomers = usersSnapshot.size;

        // Get today's appointments
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("date", "==", today.toISOString().split("T")[0]),
          where("status", "in", ["Pending", "Confirmed"])
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsToday = appointmentsSnapshot.size;

        // Fetch all orders for revenue calculation (confirmed and received orders)
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "in", ["Confirmed", "Received"])
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        // Fetch all completed appointments for revenue calculation
        const completedAppointmentsQuery = query(
          collection(db, "appointments"),
          where("status", "==", "Concluded")
        );
        const completedAppointmentsSnapshot = await getDocs(
          completedAppointmentsQuery
        );

        let currentMonthOrders = 0;
        let currentMonthRevenue = 0;
        let lastMonthOrders = 0;
        let lastMonthRevenue = 0;

        // Calculate order revenue
        ordersSnapshot.forEach((doc) => {
          const order = doc.data();
          const orderDate = new Date(order.createdAt?.seconds * 1000);
          const orderTotal = order.price * order.quantity;

          if (orderDate >= startOfThisMonth) {
            currentMonthOrders++;
            currentMonthRevenue += orderTotal;
          } else if (
            orderDate >= startOfLastMonth &&
            orderDate <= endOfLastMonth
          ) {
            lastMonthOrders++;
            lastMonthRevenue += orderTotal;
          }
        });

        // Calculate appointment revenue
        completedAppointmentsSnapshot.forEach((doc) => {
          const appointment = doc.data();
          const appointmentDate = new Date(appointment.date);
          const price = parseInt(appointment.price?.replace(/[^\d]/g, "")) || 0;

          if (appointmentDate >= startOfThisMonth) {
            currentMonthRevenue += price;
          } else if (
            appointmentDate >= startOfLastMonth &&
            appointmentDate <= endOfLastMonth
          ) {
            lastMonthRevenue += price;
          }
        });

        const calculateChange = (current, last) => {
          if (last === 0) return "+0%";
          const change = ((current - last) / last) * 100;
          return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
        };

        setMetrics({
          totalCustomers,
          appointmentsToday,
          shopOrders: currentMonthOrders,
          revenue: currentMonthRevenue,
        });

        setMetricsChange({
          customersChange: calculateChange(totalCustomers, totalCustomers - 5),
          appointmentsChange: calculateChange(
            appointmentsToday,
            appointmentsToday - 2
          ),
          ordersChange: calculateChange(currentMonthOrders, lastMonthOrders),
          revenueChange: calculateChange(currentMonthRevenue, lastMonthRevenue),
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();

    const setupActivityListeners = () => {
      const activityItems = new Map();

      const adminActivityUnsubscribe = onSnapshot(
        query(collection(db, "adminActivity"), orderBy("createdAt", "desc")),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const activity = change.doc.data();
              activityItems.set(change.doc.id, {
                id: change.doc.id,
                type: "security",
                title: activity.title,
                description: activity.description,
                time: "Just now",
                icon: Shield,
                timestamp: activity.createdAt?.seconds || Date.now() / 1000,
              });
              updateRecentActivity();
            }
          });
        }
      );

      const appointmentsUnsubscribe = onSnapshot(
        query(collection(db, "appointments"), orderBy("createdAt", "desc")),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const appointment = change.doc.data();
              activityItems.set(change.doc.id, {
                id: change.doc.id,
                type: "appointment",
                title: "New Grooming Appointment",
                description: `${appointment.petName} - ${appointment.service}`,
                time: "Just now",
                icon: Clock,
                status: appointment.status || "active",
                timestamp: appointment.createdAt?.seconds || Date.now() / 1000,
              });
              updateRecentActivity();
            } else if (change.type === "modified") {
              const appointment = change.doc.data();
              const existingItem = activityItems.get(change.doc.id);
              if (existingItem) {
                activityItems.set(change.doc.id, {
                  ...existingItem,
                  status: appointment.status || "active",
                });
                updateRecentActivity();
              }
            }
          });
        }
      );

      const ordersUnsubscribe = onSnapshot(
        query(collection(db, "orders"), orderBy("createdAt", "desc")),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const order = change.doc.data();
              activityItems.set(change.doc.id, {
                id: change.doc.id,
                type: "order",
                title: `New Shop Order #${change.doc.id}`,
                description: `${order.productName} (${order.quantity} items) - ${order.status}`,
                time: "Just now",
                icon: Package,
                timestamp: order.createdAt?.seconds || Date.now() / 1000,
              });
              updateRecentActivity();
            } else if (change.type === "modified") {
              const order = change.doc.data();
              const existingItem = activityItems.get(change.doc.id);
              if (existingItem) {
                activityItems.set(change.doc.id, {
                  ...existingItem,
                  description: `${order.productName} (${order.quantity} items) - ${order.status}`,
                });
                updateRecentActivity();
              }
            }
          });
        }
      );

      const usersUnsubscribe = onSnapshot(
        query(collection(db, "users"), orderBy("createdAt", "desc")),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const user = change.doc.data();
              activityItems.set(change.doc.id, {
                id: change.doc.id,
                type: "customer",
                title: "New Customer Registration",
                description: `${user.name} joined Highland PetVibes`,
                time: "Just now",
                icon: UserPlus,
                timestamp: user.createdAt?.seconds || Date.now() / 1000,
              });
              updateRecentActivity();
            }
          });
        }
      );

      const updateRecentActivity = () => {
        const sortedActivities = Array.from(activityItems.values())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 4)
          .map((item) => {
            const timeAgo = Math.floor(
              (Date.now() / 1000 - item.timestamp) / 60
            );
            let timeString;
            if (timeAgo < 1) {
              timeString = "Just now";
            } else if (timeAgo < 60) {
              timeString = `${timeAgo} minutes ago`;
            } else if (timeAgo < 1440) {
              timeString = `${Math.floor(timeAgo / 60)} hours ago`;
            } else {
              timeString = `${Math.floor(timeAgo / 1440)} days ago`;
            }
            return { ...item, time: timeString };
          });

        setRecentActivity(sortedActivities);
      };

      return () => {
        adminActivityUnsubscribe();
        appointmentsUnsubscribe();
        ordersUnsubscribe();
        usersUnsubscribe();
      };
    };

    const unsubscribe = setupActivityListeners();
    return () => unsubscribe();
  }, []);

  const metricsData = [
    {
      title: "Total Customers",
      value: metrics.totalCustomers.toLocaleString(),
      change: metricsChange.customersChange,
      icon: Users,
    },
    {
      title: "Appointments Today",
      value: metrics.appointmentsToday.toString(),
      change: metricsChange.appointmentsChange,
      icon: Calendar,
    },
    {
      title: "Shop Orders",
      value: metrics.shopOrders.toString(),
      change: metricsChange.ordersChange,
      icon: ShoppingBag,
    },
    {
      title: "Revenue",
      value: `₱${metrics.revenue.toLocaleString()}`,
      change: metricsChange.revenueChange,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6 mt-12">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Dashboard</h1>
        <div className="flex items-center mt-5">
          <PawPrint className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Welcome back! Here's what's happening with your pet store today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="bg-background rounded-lg shadow-sm border-2 border-green3/60">
        <div className="border-b border-green3/60 px-6 py-4">
          <h2 className="text-lg font-nunito-bold text-green2">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-green3/50">
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
