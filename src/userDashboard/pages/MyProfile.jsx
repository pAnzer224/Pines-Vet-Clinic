import React from "react";
import {
  PawPrint,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Building2,
  CreditCard,
  Bell,
  Clock,
  Shield,
  Settings,
  Calendar,
} from "lucide-react";

function ProfilePicture() {
  return (
    <div className="flex flex-col items-center bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="h-32 w-32 bg-green3/10 rounded-full flex items-center justify-center mb-4">
        <User size={64} className="text-green2" />
      </div>
      <button className="flex items-center px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
        <Upload size={16} className="mr-2" />
        Upload Photo
      </button>
    </div>
  );
}

function PersonalInformation() {
  const userInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Pet St, Animalia, PA 12345",
    preferredBranch: "Highland PetVibes - Maginhawa",
    memberSince: "January 2020",
    preferredVet: "Dr. Sarah Smith",
    paymentMethod: "Credit Card ending in 4242",
    notificationPreferences: "Email & SMS",
    appointmentReminders: "24 hours before",
    careLevel: "Premium Care Plan",
    lastVisit: "May 1, 2024",
  };

  return (
    <div className="space-y-6">
      <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-nunito-bold text-green2">
            Personal Information
          </h2>
          <button className="flex items-center px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
            <Pencil size={16} className="mr-2" />
            Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <User className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">Name</p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Email
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Phone
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Address
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
        <h2 className="text-lg font-nunito-bold text-green2 mb-6">
          Clinic Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Building2 className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Preferred Branch
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.preferredBranch}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Preferred Veterinarian
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.preferredVet}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CreditCard className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Payment Method
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.paymentMethod}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Last Visit
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.lastVisit}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
        <h2 className="text-lg font-nunito-bold text-green2 mb-6">
          Account Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Bell className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Notification Preferences
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.notificationPreferences}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Appointment Reminders
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.appointmentReminders}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Care Plan Level
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.careLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Settings className="text-green2" size={20} />
            <div>
              <p className="text-sm text-primary/50 font-nunito-medium">
                Member Since
              </p>
              <p className="text-base font-nunito-bold text-green2">
                {userInfo.memberSince}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyProfile() {
  return (
    <div className="space-y-6 mt-14">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">
          Account Settings
        </h1>
        <div className="flex items-center mt-5">
          <PawPrint className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your profile and personal information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfilePicture />
        </div>
        <div className="md:col-span-2">
          <PersonalInformation />
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
