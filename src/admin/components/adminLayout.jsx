import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Store,
  Users,
  BarChart,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import SessionChecker from "../../admin/components/SessionChecker";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  {
    icon: Calendar,
    label: "Appointments",
    path: "/admin/appointments",
  },
  { icon: Store, label: "Shop", path: "/admin/shop" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: BarChart, label: "Reports", path: "/admin/reports" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("adminAuthenticated") === "true";

    // Redirect to login for all admin routes except login if not authenticated
    if (!isAuthenticated && location.pathname !== "/admin/login") {
      navigate("/admin/login");
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem("adminAuthenticated");

    // Redirect to login page
    navigate("/admin/login");
  };

  // If on login page, just render the login component
  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  // Check authentication for other routes
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";

  // If not authenticated, don't render anything (navigation will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-nunito-semibold">
      <SessionChecker />
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-background border-r-2 border-green3/80 `}
      >
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-green3/30">
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
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
              className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors font-nunito-semibold tracking-wide ${
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

      <div className="md:ml-64">
        <header className="fixed top-0 right-0 z-30 w-full md:w-[calc(100%-16rem)] bg-background border-b-2 border-green3/30 h-[60px]">
          <div className="flex items-center justify-between px-6 h-full ">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-green2 hover:text-primary"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-5">
              <span className="text-sm font-nunito-bold tracking-wide text-green2">
                Admin
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

        <main className="pt-[60px] p-4 md:p-6 ">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-text/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;
