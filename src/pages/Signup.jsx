import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../components/InputField";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase-config";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProceed, setShowProceed] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  // Set up RecaptchaVerifier when component mounts
  useEffect(() => {
    // Ensure this is only set up once
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber
            console.log("Recaptcha solved");
          },
          "expired-callback": () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            setError("Verification expired. Please try again.");
          },
        }
      );
    }
  }, []);

  // Handle input changes and validate password match
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Show proceed button only when passwords match
    if (name === "confirmPassword" && formData.password === value) {
      setShowProceed(true);
    } else if (name === "confirmPassword") {
      setShowProceed(false);
    }
  };

  // Move to phone verification step
  const handleProceed = (e) => {
    e.preventDefault();
    setStep(2);
  };

  // Send OTP to phone number
  const sendOTP = async () => {
    try {
      // Ensure RecaptchaVerifier is rendered
      await window.recaptchaVerifier.render();

      // Clean and format phone number
      const phoneNumber = "+" + formData.phoneNumber.replace(/\D/g, "");

      // Send OTP to the phone number
      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );

      // Store the confirmation result for later verification
      setConfirmationResult(result);
      setError(null);
    } catch (err) {
      console.error("OTP Send Error:", err);
      setError(err.message);
    }
  };

  // Verify OTP and complete sign up
  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (confirmationResult) {
        // Confirm the OTP
        await confirmationResult.confirm(formData.otp);

        // Create user with email and password
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Navigate to home page after successful signup
        navigate("/home");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Validate form before proceeding
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const pageVariants = {
    initial: { opacity: 0, x: "10%" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "-10%" },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 1, // Adjust here for animation speed
  };

  return (
    <motion.div
      className="min-h-screen bg-background relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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
      <div className="relative z-10 container mx-auto px-6 py-10 font-nunito-bold mt-20">
        <div className="max-w-md mx-auto bg-background/95 p-8 rounded-2xl border-[1.6px] border-green2 shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-text mb-6 tracking-wide text-center">
            Create Account
          </h1>

          <p className="text-text/80 mb-12 text-center tracking-wide font-nunito-medium">
            Sign up to access your Highland PetVibes account
          </p>

          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}

          {/* Recaptcha container for invisible verification */}
          <div id="recaptcha-container"></div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-6 mt-2">
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleProceed}
                    className="w-full px-6 py-2 bg-green3 text-text rounded-full 
                      hover:bg-green3/80 transition-colors 
                      border-[1.6px] border-green2 
                      hover:text-text/80"
                  >
                    Proceed <span className="ml-2">→</span>
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
              </form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                onSubmit={verifyOTP}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants} // Slower, constrained animation
                transition={pageTransition}
                className="space-y-6 mt-2"
              >
                <InputField
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <div className="relative">
                  <InputField
                    label="Phone Number"
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={sendOTP}
                    className="absolute right-2 top-1/2 -translate-y-1/2 
                      px-3 py-1 bg-green3 text-text rounded-full 
                      text-xs hover:bg-green3/80 transition-colors"
                  >
                    Send Code
                  </button>
                </div>
                <InputField
                  label="OTP"
                  type="text"
                  name="otp"
                  value={formData.otp}
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

                <div className="text-center mt-6 text-sm">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-text hover:text-primary transition-colors"
                  >
                    ← Go Back
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SignUp;
