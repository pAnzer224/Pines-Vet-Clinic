import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainHeader from "./components/MainHeader";
import SubHeader from "./components/SubHeader";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Services from "./pages/Services";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";

import UserDashboard from "./userDashboard/pages/UserDashboard";
import UserProfile from "./userDashboard/pages/UserProfile";
import UserPets from "./userDashboard/pages/UserPets";
import UserAppointments from "./userDashboard/pages/UserAppointments";
import UserOrders from "./userDashboard/pages/UserOrders";

import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminAppointments from "./admin/pages/AdminAppointments";
import AdminShop from "./admin/pages/AdminShop";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminReports from "./admin/pages/Reports/AdminReports";
import AdminSettings from "./admin/pages/Settings Tabs/AdminSettings";

import UserLayout from "./userDashboard/components/userLayout";
import AdminLayout from "./admin/components/adminLayout";

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  const isUserDashboard = location.pathname.startsWith("/user");
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative flex-grow">
        {isHomePage && (
          <div
            className="absolute top-10 left-0 w-full h-full z-0 bg-cover bg-no-repeat"
            style={{ backgroundImage: `url('/images/background2.svg')` }}
          />
        )}

        {!isUserDashboard && !isAdminPage && (
          <div className="relative z-20">
            <MainHeader />
            <div className={`${!isHomePage ? "pt-20" : ""} mb-20`}>
              <SubHeader />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route path="/user" element={<UserLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="pets" element={<UserPets />} />
              <Route path="appointments" element={<UserAppointments />} />
              <Route path="orders" element={<UserOrders />} />
            </Route>

            <Route path="/admin">
              <Route path="login" element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="shop" element={<AdminShop />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
        </AnimatePresence>
      </div>

      {!isUserDashboard && !isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
