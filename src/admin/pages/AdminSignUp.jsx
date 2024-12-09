import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../../components/InputField";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase-config";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";

const AdminSignUp = () => {
  console.log("AdminSignUp component rendering");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProceed, setShowProceed] = useState(false);
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0, x: "10%" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "-10%" },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 1,
  };

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
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Get the newly created user
      const user = userCredential.user;

      // Explicitly create admin document
      const adminDocRef = doc(db, "admins", user.uid);
      await setDoc(adminDocRef, {
        email: formData.email,
        role: "admin",
        createdAt: new Date(),
      });

      console.log("Admin user created:", user);
      console.log("Admin document created at:", adminDocRef.path);

      // Navigate to admin home
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Signup Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
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
            Create Admin Account
          </h1>

          <p className="text-text/80 mb-12 text-center tracking-wide font-nunito-medium">
            Sign up to access your admin account
          </p>

          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <form onSubmit={handleProceed} className="space-y-6 mt-2">
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
                    className="w-full px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 hover:text-text/80 items-center justify-center gap-1 flex"
                  >
                    Proceed <ArrowRight className="size-5" />
                  </motion.button>
                )}

                <div className="text-center mt-6 text-sm">
                  <span className="text-text/80">
                    Already have an account?{" "}
                  </span>
                  <Link
                    to="/admin/login"
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
                onSubmit={handleSubmit}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="space-y-6 mt-2"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 hover:text-text/80 disabled:opacity-50"
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
      </div>
    </motion.div>
  );
};

export default AdminSignUp;
