import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { useAuth } from "../../hooks/useAuth";
import {
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";

const Overlay = ({ title, message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-[60px] right-0 bottom-0 w-full md:w-[calc(100%-16rem)] bg-text/50 backdrop-blur-sm z-[19]">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-background p-8 rounded-xl shadow-lg max-w-md w-full mx-4 border-2 border-primary/80">
          <h2 className="text-2xl font-nunito-bold text-green2 mb-3">
            {title}
          </h2>
          <p className="text-text/80 font-nunito-semibold text-md mb-10">
            {message}
          </p>
          <div className="text-text/80 font-nunito-semibold text-sm">
            Return to{" "}
            <Link to="/" className="text-primary hover:text-primary/80">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order, onCancel }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="text-yellow-500" size={20} />;
      case "Confirmed":
        return <Package className="text-green2" size={20} />;
      case "Received":
      case "Completed":
        return <CheckCircle className="text-green2" size={20} />;
      case "Cancelled":
        return <XCircle className="text-red" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500";
      case "Confirmed":
        return "text-green2";
      case "Received":
      case "Completed":
        return "text-green2";
      case "Cancelled":
        return "text-red";
      default:
        return "text-yellow-500";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date not available";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(order.status)}
          <span
            className={`text-sm font-nunito-semibold ${getStatusColor(
              order.status
            )}`}
          >
            Status: {order.status}
          </span>
        </div>
        <span className="text-sm font-nunito-semibold text-primary/50">
          {formatDate(order.createdAt)}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="h-24 w-24 bg-green3/10 rounded-lg flex items-center justify-center">
          <img
            src={order.productImage}
            alt={order.productName}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-nunito-bold text-green2">
            {order.productName}
          </h3>
          <div className="text-sm font-nunito-semibold text-primary/50 space-y-1">
            <p>Price: ₱{order.price}</p>
            <p>Quantity: {order.quantity}</p>
            <p>Total: ₱{order.price * order.quantity}</p>
          </div>
        </div>
      </div>

      {order.status === "Pending" && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onCancel(order.id)}
            className="px-4 py-2 text-sm font-nunito-bold text-red bg-red/10 rounded-md hover:bg-red/20"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
};

const OrderSection = ({ title, orders, onCancel }) => {
  if (orders.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-nunito-bold text-green2 mt-6">{title}</h2>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onCancel={onCancel} />
      ))}
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrders, setCancellingOrders] = useState(new Set());
  const { currentUser } = useAuth();
  const [overlaySettings, setOverlaySettings] = useState({
    isEnabled: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("overlaySettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setOverlaySettings(
        settings.userOrders || { isEnabled: false, title: "", message: "" }
      );
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
          ordersQuery,
          (snapshot) => {
            const ordersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              // Ensure createdAt is properly handled
              createdAt: doc.data().createdAt || new Date(),
            }));
            setOrders(ordersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error in orders snapshot:", error);
            toast.error("Error loading orders. Please try again.");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
        toast.error("Failed to fetch orders");
      }
    };

    fetchOrders();
  }, [currentUser]);

  const cancelOrder = async (orderId) => {
    if (cancellingOrders.has(orderId)) return;

    setCancellingOrders((prev) => new Set([...prev, orderId]));

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Cancelled",
      });
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        Loading orders...
      </div>
    );
  }

  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const confirmedOrders = orders.filter(
    (order) => order.status === "Confirmed"
  );
  const completedOrders = orders.filter((order) =>
    ["Received", "Completed", "Cancelled"].includes(order.status)
  );

  return (
    <div className="space-y-6 mt-14">
      <Overlay
        title={overlaySettings.title}
        message={overlaySettings.message}
        isVisible={overlaySettings.isEnabled}
      />

      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">My Orders</h1>
        <div className="flex items-center mt-5">
          <ShoppingBag className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Track and manage your orders
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {orders.length === 0 ? (
          <div className="text-center p-6 bg-background rounded-lg shadow-sm border-2 border-green3/60">
            <p className="text-text/60">No orders found</p>
          </div>
        ) : (
          <>
            <OrderSection
              title="Pending Orders"
              orders={pendingOrders}
              onCancel={cancelOrder}
            />
            <OrderSection
              title="Confirmed Orders"
              orders={confirmedOrders}
              onCancel={cancelOrder}
            />
            <OrderSection
              title="Past Orders"
              orders={completedOrders}
              onCancel={cancelOrder}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
