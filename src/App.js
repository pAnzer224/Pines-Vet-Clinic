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
import GroomingBoarding from "./pages/GroomingBoarding";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Pages for the admin panel
import AdminLayout from "./admin/components/Layout";
import AdminDashboard from "./admin/pages/Dashboard";

// Main App component that handles routing and content display
function AppContent() {
  // Get the current URL location
  const location = useLocation();
  // Check if the current page is the homepage
  const isHomePage = location.pathname === "/home";
  // Check if the current page is within the admin panel
  const isAdminPage = location.pathname.startsWith("/admin");

  // If the current page is in the admin panel, render the admin layout
  if (isAdminPage) {
    return (
      // Use 'Routes' to handle routing within the admin panel
      <Routes location={location} key={location.pathname}>
        {/* Define the main route for the admin panel, using 'AdminLayout' */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Define routes for each page within the admin panel */}
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

  // If the current page is not in the admin panel, render the public website content
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content area for the website */}
      <div className="relative flex-grow">
        {/* Add a background image for the homepage */}
        {isHomePage && (
          <div
            className="absolute top-10 left-0 w-full h-full z-0 bg-cover bg-no-repeat"
            style={{ backgroundImage: `url('/images/background2.svg')` }}
          />
        )}

        {/* Website elements */}
        <div className="relative z-20">
          <MainHeader />
          {/* Add spacing for the subheader */}
          <div className={`${!isHomePage ? "pt-20" : ""} mb-20`}>
            <SubHeader />
          </div>

          {/* Use 'Routes' to handle routing for the public website */}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Redirect the user to the homepage if they access the root path */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              {/* Define routes for each page on the website */}
              <Route path="/home" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/services" element={<Services />} />
              <Route
                path="/grooming-boarding"
                element={<GroomingBoarding isHomePage={false} />}
              />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
      {/* Footer for the website */}
      <Footer />
    </div>
  );
}

// The main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
