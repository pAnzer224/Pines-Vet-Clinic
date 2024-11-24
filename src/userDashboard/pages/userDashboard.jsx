import React from "react";
import {
  Calendar,
  Clock,
  PawPrint,
  MessageCircle,
  AlertCircle,
  Activity,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

function WelcomeCard({ name, memberSince }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green3/10 text-green2">
            <UserCircle size={24} />
          </div>
          <div>
            <h1 className="text-lg font-nunito-bold text-green2">
              Welcome to your dashboard, {name}!
            </h1>
            <p className="text-sm font-nunito-medium text-primary/50">
              Pet Parent since {memberSince}
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

function AppointmentCard() {
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
        <div className="flex items-start space-x-4 p-4 bg-green3/10 rounded-lg">
          <div className="p-2 rounded-full bg-green3/20 text-green2">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-sm font-nunito-bold text-green2">
              Annual checkup for Max
            </p>
            <p className="text-sm font-nunito-medium text-primary/50">
              May 15, 2024
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <button className="w-full px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
          View All Appointments
        </button>
      </div>
    </div>
  );
}

function WellnessTipsCard() {
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

      <WelcomeCard name="John" memberSince="2020" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppointmentCard />
        <WellnessTipsCard />
      </div>
    </div>
  );
}

export default UserDashboard;
