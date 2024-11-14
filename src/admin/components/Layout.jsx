import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Store,
  Users,
  FileText,
  BarChart,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import Dashboard from "../pages/Dashboard"; // Import the Dashboard component
import Appointments from "../pages/appointments";
import Shop from "../pages/shop.jsx";
import Customers from "../pages/customers";
import Content from "../pages/content";
import Reports from "../pages/reports";
import SettingsPage from "../pages/settings"; // Adjust the import path as needed

// This defines the menu items for the sidebar
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  {
    icon: Calendar,
    label: "Appointments",
    path: "/admin/appointments",
  },
  { icon: Store, label: "Shop", path: "/admin/shop" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: FileText, label: "Content", path: "/admin/content" },
  { icon: BarChart, label: "Reports", path: "/admin/reports" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

function Layout() {
  // This state manages whether the sidebar is open or closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // This helps determine which page the user is currently on
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background font-nunito">
      {/* Sidebar Section */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          // This makes the sidebar slide in/out on smaller screens
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-background border-r-2 border-green3/80 `}
      >
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-green3/30">
          {/* Link to the main website (homepage) */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/HPLogo.svg" alt="Logo" className="pl-2 h-10" />
          </Link>
          {/* Close button for the sidebar (visible on smaller screens) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-green2 hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links within the sidebar */}
        <nav className="p-5 space-y-2 text-sm">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              // Close the sidebar when clicking a link
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors font-nunito-medium tracking-wide ${
                // Highlight the current page with a different color
                location.pathname === item.path
                  ? "bg-green3 text-background"
                  : "text-green2 hover:text-primary"
              }`}
            >
              {/* Displays the icon for each menu item */}
              <item.icon size={20} />
              {/* Displays the label for each menu item */}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Section */}
      <div className="md:ml-64">
        {/* Header for the main content area */}
        <header className="fixed top-0 right-0 z-30 w-full md:w-[calc(100%-16rem)] bg-background border-b-2 border-green3/30 h-[60px]">
          {" "}
          {/* U can adjust horizontal border line here */}
          <div className="flex items-center justify-between px-6 h-full ">
            {/* Responsive menu bar*/}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-green2 hover:text-primary"
            >
              <Menu size={24} />
            </button>

            {/* User information and logout button */}
            <div className="flex items-center gap-5">
              <span className="text-sm font-nunito-bold tracking-wide text-green2">
                Admin User
              </span>
              <Link
                to="/"
                className="text-sm text-background hover:text-primary flex items-center gap-1 border px-5 py-2 rounded-md bg-green3 hover:bg-green3/80 font-nunito-bold"
              >
                {/* Logout icon */}
                <LogOut size={18} />
                {/* Logout label */}
                <span>Log out</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area for each page */}
        <main className="pt-[60px] p-4 md:p-6 ">
          {/*  This is where you render the appropriate page */}
          {location.pathname === "/admin" && <Dashboard />}
          {location.pathname === "/admin/appointments" && <Appointments />}
          {location.pathname === "/admin/shop" && <Shop />}
          {location.pathname === "/admin/customers" && <Customers />}
          {location.pathname === "/admin/content" && <Content />}
          {location.pathname === "/admin/reports" && <Reports />}
          {location.pathname === "/admin/settings" && <SettingsPage />}
        </main>
      </div>

      {/* Overlay for when the sidebar is open (visible on smaller screens) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-text/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;
