import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import InputField from "../components/InputField";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate("/home");
    } catch (err) {
      // Error is handled in useAuth
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div
        className="h-full w-full bg-cover bg-no-repeat absolute top-[-50px] left-0 z-0"
        style={{
          backgroundImage: `url(/images/background.svg)`,
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
      />

      <motion.div
        className="relative z-10 container mx-auto px-6 py-10 font-nunito-bold mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto bg-background/95 p-8 rounded-2xl border-[1.6px] border-green2 shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-text mb-6 tracking-wide text-center">
            Welcome Back
          </h1>

          <p className="text-text/80 mb-8 text-center tracking-wide font-nunito-semibold">
            Sign in to access your Highland PetVibes account
          </p>

          {error && (
            <div className="text-red text-sm text-center mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              id="email"
              required
            />

            <div className="relative">
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                id="password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[10px] text-text/60 hover:text-text transition-colors"
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeOffIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-green2 text-green3 focus:ring-green3"
                />
                <label htmlFor="remember" className="ml-2 text-text/80 text-sm">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-text/80 hover:text-text transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 hover:text-text/80 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="text-center mt-6 text-sm">
              <span className="text-text/80">Don't have an account? </span>
              <Link
                to="/signup"
                className="text-text hover:text-primary transition-colors"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
