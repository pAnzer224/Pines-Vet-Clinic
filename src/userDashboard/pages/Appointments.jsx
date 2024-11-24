import {
  Calendar,
  Clock,
  Bell,
  PawPrint,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const upcomingAppointments = [
  {
    id: 1,
    petName: "Max",
    type: "Annual Checkup",
    date: "May 15, 2024",
    time: "10:00 AM",
  },
  {
    id: 2,
    petName: "Luna",
    type: "Vaccination",
    date: "May 20, 2024",
    time: "2:30 PM",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "Appointment Completed",
    description: "Grooming session for Max",
    time: "2 days ago",
  },
  {
    id: 2,
    type: "Prescription Refill",
    description: "Monthly heartworm medication",
    time: "1 week ago",
  },
];

function AppointmentCard({ appointment }) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-green3/10 rounded-lg mb-4">
      <div className="p-2 rounded-full bg-green3/20 text-green2">
        <Clock size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-nunito-bold text-green2">
          {appointment.petName} - {appointment.type}
        </h3>
        <p className="text-sm font-nunito-medium text-primary/50 mt-1">
          {appointment.date} at {appointment.time}
        </p>
      </div>
      <button className="flex items-center text-sm font-nunito-bold text-green2 hover:text-green2/80">
        <span>View</span>
        <ChevronRight size={16} className="ml-1" />
      </button>
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
        <p className="text-sm font-nunito-medium text-primary/50 mt-1">
          {activity.description}
        </p>
        <p className="text-xs font-nunito-medium text-primary/40 mt-1">
          {activity.time}
        </p>
      </div>
    </div>
  );
}

function Appointments() {
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
        {/* Upcoming Appointments */}
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
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
            View All Appointments
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="text-green2" size={24} />
              <h2 className="text-lg font-nunito-bold text-green2">
                Recent Activity
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
