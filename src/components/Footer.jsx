import React, { useState } from "react";
import { Link } from "react-router-dom";
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

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    setEmail("");
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
    <footer className="bg-green2 text-background font-nunito-medium">
      <div className="bg-gray-100">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-nunito-bold mb-4 text-green2">
              Stay Updated with PetVibes
            </h3>
            <p className="text-green2/80 mb-6">
              Subscribe to our newsletter for pet care tips, updates, and
              exclusive offers!
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-full bg-background border-2 border-green2/20 focus:border-green2 focus:outline-none placeholder:text-primary/30 text-green2"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green2 text-gray-100 rounded-full hover:bg-green2/90 transition-colors font-nunito-bold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-nunito-bold mb-6">About PetVibes</h3>
            <p className="text-background/80 mb-6">
              Your trusted partner in pet care, providing quality services and
              products for your beloved companions since 2020.
            </p>
            <div className="flex gap-4">
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

          <div>
            <h3 className="text-2xl font-nunito-bold mb-6">Quick Links</h3>
            <div className="flex flex-col gap-3">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/appointments", label: "Book Appointment" },
                { to: "/grooming-boarding", label: "Grooming & Boarding" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-background/80 hover:text-background transition-colors inline-block"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-nunito-bold mb-6">Business Hours</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaClock className="text-background/60" />
                <div>
                  <p className="text-background/80">Monday - Saturday</p>
                  <p className="text-background font-semibold">
                    9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-background/60" />
                <div>
                  <p className="text-background/80">Sunday</p>
                  <p className="text-background font-semibold">
                    10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-nunito-bold mb-6">Contact Us</h3>
            <div className="space-y-4">
              {locations.map((location) => (
                <div key={location.name} className="space-y-2">
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
                  href="mailto:info@petvibes.com"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  info@petvibes.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-background/60 text-sm">
            <p>© 2024 PetVibes. All rights reserved.</p>
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
