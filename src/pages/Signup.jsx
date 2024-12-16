import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../components/InputField";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase-config";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProceed, setShowProceed] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update user profile with full name
      await updateProfile(userCredential.user, {
        displayName: formData.fullName,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: formData.email,
        fullName: formData.fullName,
        createdAt: new Date(),
      });

      navigate("/home");
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
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

          <p className="text-text/80 mb-12 text-center tracking-wide font-nunito-medium">
            Sign up to access your Highland PetVibes account
          </p>

          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
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
                <h2 className="text-lg font-nunito-medium text-text/80 mb-4 text-left">
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
    </div>
  );
};

export default SignUp;
