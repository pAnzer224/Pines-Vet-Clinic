import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  PawPrint,
  UserCircle,
  ChevronRight,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase-config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

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
              Welcome to your dashboard, {userData?.name || "Pet Parent"}!
            </h1>
            <p className="text-sm font-nunito-medium text-primary/50">
              Pet Parent since{" "}
              {userData?.memberSince
                ? new Date(userData.memberSince).getFullYear()
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
          appointments.map((appointment, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-green3/10 rounded-lg"
            >
              <div className="p-2 rounded-full bg-green3/20 text-green2">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-nunito-bold text-green2">
                  {appointment.petName} - {appointment.type}
                </p>
                <p className="text-sm font-nunito-medium text-primary/50">
                  {new Date(
                    appointment.date.seconds * 1000
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-primary/50 text-center">
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

function WellnessTipsCard() {
  // Existing implementation remains the same
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="text-green2" size={24} />
          <h2 className="text-lg font-nunito-bold text-green2">
            Pet Wellness Tips
          </h2>
        </div>
      </div>
      <div className="flex items-start space-x-4 p-4 bg-green3/10 rounded-lg">
        <div className="p-2 rounded-full bg-green3/20 text-green2">
          <AlertCircle size={20} />
        </div>
        <div>
          <p className="text-sm font-nunito-bold text-green2">
            Dental Care Reminder
          </p>
          <p className="text-sm font-nunito-medium text-primary/50">
            Remember to brush Max's teeth regularly to maintain good oral
            health!
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button className="w-full px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
          View All Tips
        </button>
      </div>
    </div>
  );
}

function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Fetch user details from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData({
              ...userDoc.data(),
              uid: user.uid,
            });
          } else {
            console.warn("No user document found");
          }

          // Fetch upcoming appointments
          const appointmentsRef = collection(db, "appointments");
          const q = query(
            appointmentsRef,
            where("userId", "==", user.uid),
            where("date", ">=", new Date())
          );

          const querySnapshot = await getDocs(q);
          const upcomingAppointments = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setAppointments(upcomingAppointments);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Add a check to ensure the user is authenticated
    if (auth.currentUser) {
      fetchUserData();
    } else {
      // If not authenticated, wait a moment and check again
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          fetchUserData();
        } else {
          setLoading(false);
        }
      });

      // Cleanup subscription
      return () => unsubscribe();
    }
  }, []);

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
        <AppointmentCard appointments={appointments} />
        <WellnessTipsCard />
      </div>
    </div>
  );
}

export default UserDashboard;
