import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import InputField from "../components/InputField";

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign Up submitted:", formData);
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
            Create Account
          </h1>

          <p className="text-text/80 mb-12 text-center tracking-wide font-nunito-medium">
            Sign up to access your Highland PetVibes account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <InputField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              id="email"
              required
            />
            <InputField
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              id="password"
              required
            />
            <InputField
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              id="confirmPassword"
              required
            />

            <button
              type="submit"
              className="w-full px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 hover:text-text/80"
            >
              Sign Up
            </button>

            <div className="text-center mt-6 text-sm">
              <span className="text-text/80">Already have an account? </span>
              <Link
                to="/login"
                className="text-text hover:text-primary transition-colors"
              >
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default SignUp;
