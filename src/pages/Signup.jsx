import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../components/InputField";
import FeatureOverlay from "../components/FeauterOverlay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [showProceed, setShowProceed] = useState(false);
  const [overlaySettings, setOverlaySettings] = useState({
    isEnabled: false,
    title: "",
    message: "",
  });
  const navigate = useNavigate();
  const { signup, error, loading } = useAuth();

  useEffect(() => {
    const savedOverlaySettings = localStorage.getItem("overlaySettings");
    if (savedOverlaySettings) {
      const settings = JSON.parse(savedOverlaySettings);
      if (settings.signup) {
        setOverlaySettings({
          isEnabled: settings.signup.isEnabled,
          title: settings.signup.title,
          message: settings.signup.message,
        });
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "confirmPassword" && formData.password === value) {
      setShowProceed(true);
    } else if (name === "confirmPassword") {
      setShowProceed(false);
    }
  };

  const handleProceed = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      await signup(formData.email, formData.password, {
        fullName: formData.fullName,
        plan: "free",
        remainingConsultations: 0,
        remainingGrooming: 0,
        remainingDentalCheckups: 0,
        discount: 0,
        welcomeShown: false,
      });
      navigate("/home");
    } catch (err) {
      // Error is handled in useAuth
    }
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
            Create Account
          </h1>

          <p className="text-text/80 mb-12 text-center tracking-wide font-nunito-semibold">
            Sign up to access your Pines Vet Clinic account
          </p>

          {error && (
            <div className="text-red text-sm text-center mb-4">{error}</div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                onSubmit={handleProceed}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 mt-2"
              >
                <InputField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                {showProceed && (
                  <motion.button
                    type="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full px-6 py-2 bg-green3 text-text rounded-full 
                      hover:bg-green3/80 transition-colors 
                      border-[1.6px] border-green2 
                      hover:text-text/80 items-center justify-center gap-1 flex"
                  >
                    Proceed <ArrowRight className="size-5" />
                  </motion.button>
                )}

                <div className="text-center mt-6 text-sm">
                  <span className="text-text/80">
                    Already have an account?{" "}
                  </span>
                  <Link
                    to="/login"
                    className="text-text hover:text-primary transition-colors"
                  >
                    Log in
                  </Link>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 mt-2"
              >
                <h2 className="text-lg font-nunito-semibold text-text/80 mb-4 text-left">
                  What should we call you?
                </h2>
                <InputField
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-2 bg-green3 text-text rounded-full 
                    hover:bg-green3/80 transition-colors 
                    border-[1.6px] border-green2 
                    hover:text-text/80 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <div className="text-center mt-6 text-sm justify-center flex">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-text hover:text-primary transition-colors flex gap-1"
                  >
                    <ArrowLeft className="size-5" /> Go Back
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <FeatureOverlay
        isEnabled={overlaySettings.isEnabled}
        title={overlaySettings.title}
        message={overlaySettings.message}
      />
    </div>
  );
};

export default SignUp;
