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

// Pages for the public website
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Services from "./pages/Services";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";

// Pages for the admin panel
import AdminLayout from "./admin/components/Layout";
import AdminDashboard from "./admin/pages/Dashboard";

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  const isAdminPage = location.pathname.startsWith("/admin");

  if (isAdminPage) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="appointments" element={<div>Appointments Page</div>} />
          <Route path="shop" element={<div>Shop Management Page</div>} />
          <Route path="customers" element={<div>Customers Page</div>} />
          <Route path="content" element={<div>Content Management Page</div>} />
          <Route path="reports" element={<div>Reports Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative flex-grow">
        {isHomePage && (
          <div
            className="absolute top-10 left-0 w-full h-full z-0 bg-cover bg-no-repeat"
            style={{ backgroundImage: `url('/images/background2.svg')` }}
          />
        )}

        <div className="relative z-20">
          <MainHeader />
          <div className={`${!isHomePage ? "pt-20" : ""} mb-20`}>
            <SubHeader />
          </div>

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
            </Routes>
          </AnimatePresence>
        </div>
      </div>
      <Footer />
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
