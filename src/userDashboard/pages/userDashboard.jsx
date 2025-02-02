import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  PawPrint,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getStoredAppointments } from "../../pages/appointmentsUtils";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import PlanDetailsCard from "../components/PlanDetailsCard";
import WellnessTipsCard from "../components/WellnessTipsCard";

function WelcomeCard({ userData }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green3/10 text-green2">
            <UserCircle size={24} />
          </div>
          <div>
            <h1 className="text-lg font-nunito-bold text-green2">
              Welcome to your dashboard,
              {userData?.fullName ? (
                <span className="text-primary"> {userData.fullName}</span>
              ) : (
                "Pet Parent"
              )}
              !
            </h1>
            <p className="text-sm font-nunito-semibold text-primary/70">
              - Pet Parent since{" "}
              {userData?.createdAt
                ? new Date(userData.createdAt.toDate()).getFullYear()
                : new Date().getFullYear()}
            </p>
          </div>
        </div>
        <Link
          to="/user/profile"
          className="flex items-center px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30"
        >
          View Profile
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
}

function AppointmentCard({ appointments }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-green2" size={24} />
          <h2 className="text-lg font-nunito-bold text-green2">
            Upcoming Appointments
          </h2>
        </div>
      </div>
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-start space-x-4 p-4 bg-green3/10 rounded-lg"
            >
              <div className="p-2 rounded-full bg-green3/20 text-green2">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-nunito-bold text-green2">
                  {appointment.petName} - {appointment.service}
                </p>
                <p className="text-sm font-nunito-semibold text-primary/50">
                  {appointment.date}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-primary/50 text-center font-nunito-semibold">
            No upcoming appointments
          </p>
        )}
      </div>
      <div className="mt-4">
        <Link
          to="/appointments"
          className="w-full block text-center px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30"
        >
          View All Appointments
        </Link>
      </div>
    </div>
  );
}

function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [planData, setPlanData] = useState({
    plan: "free",
    nextMonthPlan: null,
    nextMonthPlanDate: null,
    remainingBenefits: {
      consultations: 0,
      grooming: 0,
      dentalCheckups: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user details from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setPlanData({
            plan: data.plan || "free",
            nextMonthPlan: data.nextMonthPlan || null,
            nextMonthPlanDate: data.nextMonthPlanDate || null,
            remainingBenefits: {
              consultations: data.remainingConsultations || 0,
              grooming: data.remainingGrooming || 0,
              dentalCheckups: data.remainingDentalCheckups || 0,
            },
          });
        }

        // Fetch appointments
        const allAppointments = await getStoredAppointments();
        const userAppointments = allAppointments
          .filter((apt) => apt.userId === currentUser.uid)
          .sort((a, b) => {
            const dateA = a.createdAt
              ? new Date(a.createdAt.toDate())
              : new Date(0);
            const dateB = b.createdAt
              ? new Date(b.createdAt.toDate())
              : new Date(0);
            return dateB - dateA;
          });

        setUpcomingAppointments(userAppointments.slice(0, 2));
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-6 mt-14">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-14">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Dashboard</h1>
        <div className="flex items-center mt-5">
          <PawPrint className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Welcome back! Here's what's happening with your pets today.
          </p>
        </div>
      </div>

      {userData && <WelcomeCard userData={userData} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlanDetailsCard planData={planData} />
        <AppointmentCard appointments={upcomingAppointments} />
      </div>

      <WellnessTipsCard />
    </div>
  );
}

export default UserDashboard;
