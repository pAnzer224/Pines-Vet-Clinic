import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  PawPrint,
  Calendar,
  MessageCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";

// Import your page components
import Dashboard from "../pages/userDashboard";
import Profile from "../pages/MyProfile";
import Pets from "../pages/MyPets";
import Appointments from "../pages/Appointments";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/user" },
  { icon: UserCircle, label: "My Profile", path: "/user/profile" },
  { icon: PawPrint, label: "My Pets", path: "/user/pets" },
  { icon: Calendar, label: "Appointments", path: "/user/appointments" },
];

function UserLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background font-nunito">
      {/* Sidebar Section */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-background border-r-2 border-green3/80`}
      >
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-green3/30">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/HPLogo.svg" alt="Logo" className="pl-2 h-10" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-green2 hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-5 space-y-2 text-sm">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors font-nunito-medium tracking-wide ${
                location.pathname === item.path
                  ? "bg-green3 text-background"
                  : "text-green2 hover:text-primary"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Section */}
      <div className="md:ml-64">
        <header className="fixed top-0 right-0 z-30 w-full md:w-[calc(100%-16rem)] bg-background border-b-2 border-green3/30 h-[60px]">
          <div className="flex items-center justify-between px-6 h-full">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-green2 hover:text-primary"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-5">
              <span className="text-sm font-nunito-bold tracking-wide text-green2">
                User Name
              </span>
              <Link
                to="/"
                className="text-sm text-background hover:text-primary flex items-center gap-1 border px-5 py-2 rounded-md bg-green3 hover:bg-green3/80 font-nunito-bold"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area for each page */}
        <main className="pt-[60px] p-4 md:p-6">
          {location.pathname === "/user" && <Dashboard />}
          {location.pathname === "/user/profile" && <Profile />}
          {location.pathname === "/user/pets" && <Pets />}
          {location.pathname === "/user/appointments" && <Appointments />}
        </main>
      </div>

      {/* Overlay for when the sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-text/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default UserLayout;
