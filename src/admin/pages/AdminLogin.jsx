import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { verifyAdminCredentials } from "./adminAuth.js";

function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("adminToken");
      const expiry = sessionStorage.getItem("adminTokenExpiry");

      if (token && expiry && new Date().getTime() < parseInt(expiry)) {
        navigate("/admin/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const isValid = await verifyAdminCredentials(adminId, password);

      if (isValid) {
        const expiry = new Date().getTime() + 30 * 60 * 1000;
        sessionStorage.setItem("adminToken", "authenticated");
        sessionStorage.setItem("adminTokenExpiry", expiry.toString());
        navigate("/admin/dashboard");
      } else {
        setError("Invalid admin ID or password");
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-nunito">
      <div className="w-full max-w-md p-8 space-y-6 bg-background border-2 border-green3/80 rounded-xl shadow-sm">
        <div className="text-center">
          <img
            src="/images/HPLogo.svg"
            alt="Logo"
            className="mx-auto h-16 mb-4"
          />
          <h2 className="text-2xl font-nunito-bold text-green2 tracking-wide">
            Admin Login
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="adminId"
              className="block text-sm font-nunito-semibold text-green2"
            >
              Admin ID
            </label>
            <input
              type="text"
              id="adminId"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-green3/60 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green3 focus:border-green3 text-primary font-nunito-semibold"
              required
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-nunito-semibold text-green2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 pr-10 border border-green3/60 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green3 focus:border-green3 text-primary font-nunito-semibold"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-green2 hover:text-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red/90 text-sm text-center font-nunito-semibold tracking-wide">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-green3 text-background rounded-md hover:bg-green3/80 transition-colors font-nunito-bold tracking-wide"
          >
            Log In
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-green2 font-nunito-semibold">
          <Link
            to="/"
            className="hover:underline hover:text-primary tracking-wide"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
