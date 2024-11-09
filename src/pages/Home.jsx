import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Services from "./Services";
import GroomingBoarding from "./GroomingBoarding";

const Home = () => {
  // State variable to track if the user has scrolled past a certain point
  const [showMore, setShowMore] = useState(false); // Renamed from isScrolled

  // useEffect hook to track scrolling and update the state
  useEffect(() => {
    const handleScroll = () => {
      // Update the state when the user scrolls past a specific point (750 pixels in this case)
      setShowMore(window.scrollY > 750);
    };

    // Add an event listener to track scroll events
    window.addEventListener("scroll", handleScroll);
    // Remove the event listener when the component unmounts to prevent memory leaks
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // The empty dependency array ensures this effect runs only once on mount

  // Function to perform smooth scrolling to a specific position
  const smoothScroll = (targetPosition, duration = 700) => {
    const startPosition = window.pageYOffset; // Current scroll position
    const distance = targetPosition - startPosition; // Distance to scroll
    let startTime = null; // Variable to store the start time of the animation

    // Animation function to handle smooth scrolling
    function animation(currentTime) {
      // If this is the first time the function is called, set the start time
      if (startTime === null) startTime = currentTime;
      // Calculate the time elapsed since the animation started
      const timeElapsed = currentTime - startTime;
      // Calculate the progress of the animation (between 0 and 1)
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function (easeInOutCubic) to create a smooth animation
      const easeInOutCubic = (progress) => {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      };

      // Calculate the new scroll position based on the progress and easing
      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      // If the animation hasn't completed, request the next animation frame
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    // Start the animation by requesting the first frame
    requestAnimationFrame(animation);
  };

  // Function to handle scrolling to a specific section
  const handleScrollToSection = (id) => {
    const element = document.getElementById(id); // Get the element with the specified ID

    if (element) {
      // Calculate the scroll position to target the element
      const headerOffset = 120; // Adjust this for the height of your header or other elements
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      // Perform smooth scrolling to the calculated position
      smoothScroll(offsetPosition, 700);
    }
  };

  return (
    // Use a 'motion.div' to enable Framer Motion animations
    <motion.div
      id="home" // Set an ID for the main div
      className="relative z-10" // Add positioning and z-index for styling
      initial={{ opacity: 0, y: 20 }} // Initial animation state (start offscreen and slightly below)
      animate={{ opacity: 1, y: 0 }} // Animated state (fade in and move to the visible position)
      exit={{ opacity: 0, y: -20 }} // Exit animation state (fade out and move offscreen)
      transition={{ duration: 0.5 }} // Animation duration
    >
      {/* Content for the homepage */}
      <div className="min-h-screen relative pt-12">
        <div className="container mx-auto font-nunito-bold tracking-wider max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Left side of the grid (image and text) */}
            <div className="flex flex-col gap-6 items-center md:items-start">
              {/* Image container */}
              <div className="w-full max-w-[400px]">
                <img
                  src="/images/dog.jpg"
                  alt="Black pug wearing a sweater"
                  className="w-full h-auto rounded-4xl border-[1.6px] border-text motion-preset-fade motion-duration-75" // Add a fade-in effect
                />
              </div>

              {/* Text content about the company */}
              <div className="w-full max-w-[400px] text-text/80 tracking-normal font-nunito-bold text-center md:text-left">
                Our mission is to provide exceptional veterinary care and
                support for pet owners, ensuring the health and happiness of
                every pet.
              </div>

              {/* Buttons for navigation */}
              <div className="w-full max-w-[400px] flex gap-4 tracking-normal justify-center">
                {/* Button to scroll to the Services section */}
                <button
                  onClick={() => handleScrollToSection("services")}
                  className="px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2"
                >
                  Our Services
                </button>

                {/* Button to scroll to the Contact Us section (footer) */}
                <button
                  onClick={() => handleScrollToSection("footer")}
                  className="text-text/60 px-6 py-2 border border-green3 rounded-full hover:bg-green3/80 transition-colors flex items-center gap-2"
                >
                  Contact Us
                </button>
              </div>
            </div>

            {/* Right side of the grid (company benefits) */}
            <div className="flex flex-col gap-6 pt-10 mt-10">
              {/* Array of benefits for the company */}
              {[
                "Improved access to veterinary care",
                "Enhanced pet health and well-being",
                "Increased community engagement and support",
              ].map((benefit, index) => (
                // Created a div for each benefit with specific styling
                <div
                  key={index}
                  className={`items-center py-7 px-8 rounded-full text-text/80 text-lg font-medium transform border-text border-[1.6px] text-center shadow-md relative overflow-hidden
                    ${
                      index === 0
                        ? "bg-peach"
                        : index === 1
                        ? "bg-peach/90 md:translate-x-10"
                        : "bg-peach/80"
                    }
                    md:rotate-[-4deg]
                  `}
                >
                  {/* Added a noise overlay for visual effect */}
                  <div
                    className="absolute inset-0 mix-blend-overlay opacity-50"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      backgroundSize: "100px 100px",
                    }}
                  />
                  {/* Added a gradient overlay for visual effect */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)`,
                    }}
                  />
                  {/* Display the benefit text */}
                  <span className="relative z-10">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services section */}
      <div id="services" className="min-h-screen">
        <Services />
      </div>

      {/* Grooming and Boarding section */}
      <div id="grooming-boarding" className="min-h-screen">
        <GroomingBoarding isHomePage={true} />
      </div>
    </motion.div>
  );
};

export default Home;
