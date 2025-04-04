import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      // Check if email already exists
      const emailDoc = doc(db, "newsletter-subscribers", email);
      const emailSnapshot = await getDoc(emailDoc);

      if (emailSnapshot.exists()) {
        setStatus({
          type: "error",
          message: "This email is already subscribed to our newsletter",
        });
        return;
      }

      // Adds new subscriber
      await setDoc(emailDoc, {
        email,
        subscribedAt: new Date().toISOString(),
        active: true,
      });

      setStatus({
        type: "success",
        message: "Thank you for subscribing to our newsletter!",
      });
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: <FaFacebookF />, label: "Facebook", url: "https://facebook.com" },
    { icon: <FaInstagram />, label: "Instagram", url: "https://instagram.com" },
    { icon: <FaTwitter />, label: "Twitter", url: "https://twitter.com" },
  ];

  const locations = [
    {
      name: "Maginhawa Branch",
      address: "208 Lower East Camp 7",
      phone: "712-5577, 946-1906",
    },
    {
      name: "Katipunan Branch",
      address: "123 Katipunan Ave",
      phone: "349-0091, 917-1522",
    },
  ];

  return (
    <footer
      id="footer"
      className="bg-green2 text-background font-nunito-semibold"
    >
      <div className="bg-gray-100">
        <div
          className={`container mx-auto px-6 py-12 ${isHomePage ? "mt-5" : ""}`}
        >
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-nunito-bold mb-4 text-green2">
              Stay Updated with Pines Vet Clinic
            </h3>
            <p className="text-green2/80 mb-6">
              Subscribe to our newsletter for pet care tips, updates, and
              exclusive offers!
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-full bg-background border-2 border-green2/20 focus:border-green2 focus:outline-none placeholder:text-primary/30 text-green2"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-green2 text-gray-100 rounded-full hover:bg-green2/90 transition-colors font-nunito-bold ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </div>

              {status.message && (
                <div
                  className={`rounded-lg p-4 text-sm ${
                    status.type === "error"
                      ? "bg-red/30 text-red"
                      : "bg-green2/40 text-primary"
                  }`}
                >
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Rest of your footer content remains the same */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <h3 className="text-lg font-nunito-bold mb-6">
              About Pines Vet Clinic
            </h3>
            <p className="text-background/80 mb-6 text-sm">
              Your trusted partner in pet care, providing quality services and
              products for your beloved companions since 2020.
            </p>
            <div className="flex justify-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background/10 hover:bg-background/20 rounded-full p-3 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-nunito-bold mb-6">Business Hours</h3>
            <div className="space-y-3 text-sm inline-block text-left">
              <div className="flex items-center gap-2">
                <FaClock className="text-background/60 mt-5" />
                <div>
                  <p className="text-background/80">Monday - Saturday</p>
                  <p className="text-background font-semibold">
                    9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-background/60 mt-5" />
                <div>
                  <p className="text-background/80">Sunday</p>
                  <p className="text-background font-semibold">
                    10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-nunito-bold mb-6">Contact Us</h3>
            <div className="space-y-4 inline-block text-left">
              {locations.map((location) => (
                <div key={location.name} className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-background/60 mt-1" />
                    <div>
                      <p className="font-semibold">{location.name}</p>
                      <p className="text-background/80">{location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-background/60" />
                    <p className="text-background/80">{location.phone}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-background/60" />
                <a
                  href="mailto:info@pinesvetclinic.com"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  info@pinesvetclinic.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-background/60 text-sm">
            <p>© 2024 Pines Vet Clinic. All rights reserved.</p>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="hover:text-background transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-background transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
