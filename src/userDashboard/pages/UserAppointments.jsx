import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Bell,
  PawPrint,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getStoredAppointments } from "../../pages/appointmentsUtils";
import { toast } from "react-toastify";

function AppointmentCard({ appointment }) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-green3/10 rounded-lg mb-4">
      <div className="p-2 rounded-full bg-green3/20 text-green2">
        <Clock size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-nunito-bold text-green2">
          {appointment.petName} - {appointment.service}
        </h3>
        <p className="text-sm font-nunito-semibold text-primary/50 mt-1">
          {appointment.date}
        </p>
      </div>
      <Link
        to="/appointments"
        className="flex items-center text-sm font-nunito-bold text-green2 hover:text-green2/80"
      >
        <span>View</span>
        <ChevronRight size={16} className="ml-1" />
      </Link>
    </div>
  );
}

function ActivityCard({ activity }) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-green3/10 rounded-lg mb-4">
      <div className="p-2 rounded-full bg-green3/20 text-green2">
        <Bell size={20} />
      </div>
      <div>
        <h3 className="text-sm font-nunito-bold text-green2">
          {activity.type}
        </h3>
        <p className="text-sm font-nunito-semibold text-primary/50 mt-1">
          {activity.description}
        </p>
        <p className="text-xs font-nunito-semibold text-primary/40 mt-1">
          {activity.time}
        </p>
      </div>
    </div>
  );
}

function Appointments() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser) return;

      try {
        const allAppointments = await getStoredAppointments();

        const userAppointments = allAppointments.filter(
          (apt) => apt.userId === currentUser.uid
        );

        const sortedAppointments = userAppointments.sort(
          (a, b) =>
            new Date(b.createdAt.toDate()) - new Date(a.createdAt.toDate())
        );

        setAllAppointments(sortedAppointments);
        setUpcomingAppointments(sortedAppointments.slice(0, 2));

        const activities = sortedAppointments.map((apt, index) => ({
          id: apt.id,
          type: index === 0 ? "Upcoming Appointment" : "Past Appointment",
          description: `${apt.service} for ${apt.petName || "Pet"}`,
          time: formatTimeAgo(apt.createdAt.toDate()),
        }));

        setAllActivities(activities);
        setRecentActivities(activities.slice(0, 2));
      } catch (error) {
        toast.error("Failed to fetch appointments");
      }
    };

    fetchAppointments();
  }, [currentUser]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  };

  const needsScroll = (items) => items.length > 6;

  return (
    <div className="space-y-6 mt-14">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-nunito-bold text-green2">
            Pet Dashboard
          </h1>
          <div className="flex items-center mt-5">
            <PawPrint className="mr-2 text-primary size-7" />
            <p className="text-xl text-primary font-nunito-bold tracking-wide">
              Keep track of your pet's health and appointments
            </p>
          </div>
        </div>
        <Link
          to="/appointments"
          className="flex items-center px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30"
        >
          <Plus size={16} className="mr-2" />
          Schedule New Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary" size={24} />
              <h2 className="text-lg font-nunito-bold text-primary">
                {showAllAppointments
                  ? "All Appointments"
                  : "Upcoming Appointments"}
              </h2>
            </div>
          </div>
          <div
            className={`space-y-4 ${
              needsScroll(
                showAllAppointments ? allAppointments : upcomingAppointments
              )
                ? "max-h-96 overflow-y-auto pr-2"
                : ""
            }`}
          >
            {showAllAppointments ? (
              allAppointments.length > 0 ? (
                allAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              ) : (
                <p className="text-center text-primary/50 font-nunito-semibold">
                  No appointments found
                </p>
              )
            ) : upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            ) : (
              <p className="text-center text-primary/50 font-nunito-semibold">
                No upcoming appointments
              </p>
            )}
          </div>
          <button
            className="w-full mt-4 px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30"
            onClick={() => setShowAllAppointments(!showAllAppointments)}
          >
            {showAllAppointments ? "Show Less" : "View All Appointments"}
          </button>
        </div>

        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="text-primary" size={24} />
              <h2 className="text-lg font-nunito-bold text-primary">
                {showAllActivities ? "All Activity" : "Recent Activity"}
              </h2>
            </div>
          </div>
          <div
            className={`space-y-4 ${
              needsScroll(showAllActivities ? allActivities : recentActivities)
                ? "max-h-96 overflow-y-auto pr-2"
                : ""
            }`}
          >
            {showAllActivities ? (
              allActivities.length > 0 ? (
                allActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))
              ) : (
                <p className="text-center text-primary/50 font-nunito-semibold">
                  No activities found
                </p>
              )
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-center text-primary/50 font-nunito-semibold">
                No recent activities
              </p>
            )}
          </div>
          <button
            className="w-full mt-4 px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30"
            onClick={() => setShowAllActivities(!showAllActivities)}
          >
            {showAllActivities ? "Show Less" : "View All Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
