import React, { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { useAuth } from "../hooks/useAuth";

const NOTIFICATION_TYPES = {
  APPOINTMENT: "appointment",
  ORDER: "order",
  ADMIN: "admin",
  SUBSCRIPTION: "subscription",
  PLAN_REQUEST: "plan-request",
  CARE_PLAN_APPROVED: "care-plan-approved",
  CARE_PLAN_REJECTED: "care-plan-rejected",
};

const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.APPOINTMENT]: { icon: "🗓️", link: "/user/appointments" },
  [NOTIFICATION_TYPES.ORDER]: { icon: "🛍️", link: "/user/orders" },
  [NOTIFICATION_TYPES.ADMIN]: { icon: "🔔", link: "/user/dashboard" },
  [NOTIFICATION_TYPES.SUBSCRIPTION]: { icon: "⭐", link: "/user" },
  [NOTIFICATION_TYPES.PLAN_REQUEST]: { icon: "📝", link: "/pricing" },
  [NOTIFICATION_TYPES.CARE_PLAN_APPROVED]: { icon: "✨", link: "/user" },
  [NOTIFICATION_TYPES.CARE_PLAN_REJECTED]: { icon: "ℹ️", link: "/#footer" },
};

const notificationSound = "/images/notif-sound.mp3";

const NotificationButton = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const previousUnreadCountRef = useRef(unreadCount);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 1;
  }, []);

  const smoothScroll = (targetPosition, duration = 700) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const easeInOutCubic = (progress) => {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      };

      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  };

  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      smoothScroll(offsetPosition, 700);
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    if (notification.link.startsWith("/#")) {
      const sectionId = notification.link.substring(2);
      handleScrollToSection(sectionId);
    } else {
      navigate(notification.link);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const createNotificationItem = (
      id,
      type,
      message,
      timestamp,
      read = false,
      status = null
    ) => ({
      id,
      type,
      message,
      timestamp: timestamp instanceof Date ? timestamp : new Date(timestamp),
      read,
      status,
      link: NOTIFICATION_CONFIG[type]?.link,
    });

    const handleUserData = (userData, activityItems) => {
      if (!userData) return;

      if (userData.planStatus && userData.planRequestDate) {
        const id = `care-plan-${userData.planRequestDate}`;
        let type, message;

        if (userData.planStatus === "Approved") {
          type = NOTIFICATION_TYPES.CARE_PLAN_APPROVED;
          message = `Great news! Your ${userData.plan} (${userData.billingPeriod}) care plan is now active`;
        } else if (userData.planStatus === "Rejected") {
          type = NOTIFICATION_TYPES.CARE_PLAN_REJECTED;
          message =
            "We couldn't process your care plan request at this time. Please contact support for assistance";
        }

        if (message) {
          activityItems.set(
            id,
            createNotificationItem(
              id,
              type,
              message,
              userData.planRequestDate,
              false
            )
          );
        }
      }

      if (userData.subscriptionHistory?.lastChanged) {
        const {
          lastChanged,
          previousPlan,
          newPlan,
          type: changeType,
        } = userData.subscriptionHistory;
        const message =
          changeType === "downgrade"
            ? `Your plan will be downgraded from ${previousPlan} to ${newPlan} at the start of next month`
            : `Your subscription has been changed from ${previousPlan} to ${newPlan}`;

        activityItems.set(
          `subscription-${lastChanged}`,
          createNotificationItem(
            `subscription-${lastChanged}`,
            NOTIFICATION_TYPES.SUBSCRIPTION,
            message,
            lastChanged,
            false
          )
        );
      }

      if (userData.planRequest && userData.planStatus === "Pending") {
        activityItems.set(
          `plan-request-${userData.planRequest.requestDate}`,
          createNotificationItem(
            `plan-request-${userData.planRequest.requestDate}`,
            NOTIFICATION_TYPES.PLAN_REQUEST,
            `Your request for ${userData.planRequest.requestedPlan} plan is pending approval`,
            userData.planRequest.requestDate,
            false
          )
        );
      }
    };

    const setupActivityListeners = () => {
      const activityItems = new Map();
      const listeners = [];

      listeners.push(
        onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
          handleUserData(snapshot.data(), activityItems);
          updateNotifications(activityItems);
        })
      );

      const createCollectionListener = (
        collectionName,
        type,
        messageFormatter
      ) => {
        return onSnapshot(
          query(
            collection(db, collectionName),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
          ),
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added" || change.type === "modified") {
                const data = change.doc.data();
                activityItems.set(
                  change.doc.id,
                  createNotificationItem(
                    change.doc.id,
                    type,
                    messageFormatter(data),
                    data.createdAt?.toDate() || new Date(),
                    data.read || false,
                    data.status
                  )
                );
              }
            });
            updateNotifications(activityItems);
          }
        );
      };

      listeners.push(
        createCollectionListener(
          "appointments",
          NOTIFICATION_TYPES.APPOINTMENT,
          (data) => `New appointment: ${data.petName} - ${data.service}`
        ),
        createCollectionListener(
          "orders",
          NOTIFICATION_TYPES.ORDER,
          (data) => `New order: ${data.productName} (${data.quantity} items)`
        ),
        createCollectionListener(
          "adminActivity",
          NOTIFICATION_TYPES.ADMIN,
          (data) => data.title
        )
      );

      return () => listeners.forEach((unsubscribe) => unsubscribe());
    };

    const updateNotifications = (activityItems) => {
      const sortedActivities = Array.from(activityItems.values()).sort(
        (a, b) => b.timestamp - a.timestamp
      );
      setNotifications(sortedActivities);
      setUnreadCount(sortedActivities.filter((n) => !n.read).length);
    };

    const unsubscribe = setupActivityListeners();
    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (
      isSoundEnabled &&
      unreadCount > previousUnreadCountRef.current &&
      audioRef.current
    ) {
      const playSound = async () => {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch (error) {
          console.error("Error playing notification sound:", error);
        }
      };
      playSound();
    }
    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount, isSoundEnabled]);

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const promises = notifications
        .map((notification) => {
          const baseUpdate = { read: true };

          if (
            notification.type.startsWith("care-plan") ||
            notification.type === NOTIFICATION_TYPES.SUBSCRIPTION ||
            notification.type === NOTIFICATION_TYPES.PLAN_REQUEST
          ) {
            return updateDoc(doc(db, "users", currentUser.uid), {
              "subscriptionHistory.read": true,
              "planRequest.read": true,
              "planStatus.read": true,
            });
          }

          const collectionMap = {
            [NOTIFICATION_TYPES.APPOINTMENT]: "appointments",
            [NOTIFICATION_TYPES.ORDER]: "orders",
            [NOTIFICATION_TYPES.ADMIN]: "adminActivity",
          };

          const collection = collectionMap[notification.type];
          return collection
            ? updateDoc(doc(db, collection, notification.id), baseUpdate)
            : null;
        })
        .filter(Boolean);

      await Promise.all(promises);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-primary/80 hover:text-primary transition-colors"
      >
        {unreadCount > 0 ? (
          <Bell className="size-6" />
        ) : (
          <BellOff className="size-6" />
        )}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red text-background text-xs w-5 h-5 rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-background border-[1.6px] border-green2 rounded-xl shadow-lg z-50"
          >
            <div className="p-4 border-b border-green2 flex justify-between items-center">
              <h3 className="font-nunito-bold text-text">Recent Activity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSoundEnabled(!isSoundEnabled);
                  }}
                  className="text-text/60 hover:text-primary transition-colors"
                >
                  {isSoundEnabled ? (
                    <Volume2 className="size-4" />
                  ) : (
                    <VolumeX className="size-4" />
                  )}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-green2 hover:text-primary transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-200px)] divide-y divide-green2">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-text/60">
                  No recent activity
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-green3/10 cursor-pointer ${
                      notification.status === "cancelled" ? "opacity-60" : ""
                    } ${!notification.read ? "bg-green3/5" : ""} ${
                      notification.type ===
                      NOTIFICATION_TYPES.CARE_PLAN_REJECTED
                        ? "bg-blue-50/50"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-xl">
                        {NOTIFICATION_CONFIG[notification.type]?.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-text">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text/60 mt-1">
                          {getTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full self-start mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationButton;
