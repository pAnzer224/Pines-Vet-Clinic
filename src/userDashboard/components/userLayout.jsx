import { useState, useEffect } from "react";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  PawPrint,
  Calendar,
  Menu,
  X,
  LogOut,
  ShoppingBag,
} from "lucide-react";

import { auth } from "../../firebase-config";
import PromptModal from "../../components/promptModal";

import Dashboard from "../pages/UserDashboard";
import Profile from "../pages/UserProfile";
import Pets from "../pages/UserPets";
import Appointments from "../pages/UserAppointments";
import Orders from "../pages/UserOrders";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/user" },
  { icon: Calendar, label: "Appointments", path: "/user/appointments" },
  { icon: PawPrint, label: "My Pets", path: "/user/pets" },
  { icon: ShoppingBag, label: "My Orders", path: "/user/orders" },
  { icon: UserCircle, label: "Profile", path: "/user/profile" },
];

function UserLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setIsPromptOpen(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return (
      <PromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        title="Access Restricted"
        message="You must be logged in to access this page."
      />
    );
  }

  const firstName = auth.currentUser?.displayName
    ? auth.currentUser.displayName.split(" ")[0]
    : "User";

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background font-nunito">
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-background border-r-2 border-green3/80`}
      >
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-green3/30">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/PVClogo.svg" alt="Logo" className="pl-2 h-10" />
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
              className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors font-nunito-semibold tracking-wide ${
                location.pathname === item.path
                  ? "bg-green2 text-background"
                  : "text-primary hover:text-green2"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

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
                {firstName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-background hover:text-primary flex items-center gap-1 border px-5 py-2 rounded-md bg-green3 hover:bg-green3/80 font-nunito-bold"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="pt-[60px] p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default UserLayout;
