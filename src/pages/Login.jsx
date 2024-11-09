import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Login submitted:", formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <motion.div
      className="min-h-screen bg-background relative"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <div
        className="h-full w-full bg-cover bg-no-repeat absolute top-[-50px] left-0 z-0"
        style={{
          backgroundImage: `url(/images/background.svg)`,
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-20 font-nunito-bold mt-20">
        <div className="max-w-md mx-auto bg-background/95 p-8 rounded-2xl border-[1.6px] border-green2 shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-text mb-6 tracking-wide text-center">
            Welcome Back
          </h1>

          <p className="text-text/80 mb-8 text-center tracking-wide font-nunito-medium">
            Sign in to access your Highland PetVibes account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-text mb-2 tracking-wide"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="font-nunito-medium w-full px-4 py-2 rounded-xl border-[1.6px] border-green2 bg-green3/10 text-text focus:outline-none focus:border-green3 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-text mb-2 tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="font-nunito-medium w-full px-4 py-2 rounded-xl border-[1.6px] border-green2 bg-green3/10 text-text focus:outline-none focus:border-green3 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/60 hover:text-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-green2 text-green3 focus:ring-green3"
                />
                <label htmlFor="remember" className="ml-2 text-text/80 text-sm">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className=" text-sm text-text/80 hover:text-text transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 hover:text-text/80"
            >
              Sign In
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
      </div>
    </motion.div>
  );
};

export default Login;
