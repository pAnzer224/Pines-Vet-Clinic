import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Services from "./Services";
import { Phone } from "lucide-react";

const Home = () => {
  useEffect(() => {
    const handleScroll = () => {};

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const smoothScroll = (targetPosition, duration = 700) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const easeInOutCubic = (progress) => {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      };

      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  };

  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      smoothScroll(offsetPosition, 700);
    }
  };
  return (
    <motion.div
      id="home"
      className="relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen relative pt-12">
        <div className="container mx-auto font-nunito-bold tracking-wider max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="flex flex-col gap-6 items-center md:items-start">
              <div className="w-full max-w-[400px]">
                <img
                  src="/images/dog.jpg"
                  alt="Black pug wearing a sweater"
                  className="w-full h-auto rounded-4xl border-[1.6px] border-text motion-preset-fade motion-duration-75"
                />
              </div>

              <div className="w-full max-w-[400px] text-text/80 tracking-normal font-nunito-bold text-center md:text-left">
                Our mission is to provide exceptional veterinary care and
                support for pet owners, ensuring the health and happiness of
                every pet.
              </div>

              <div className="w-full max-w-[400px] flex gap-4 tracking-normal justify-center">
                <Link
                  to="/appointments"
                  className="h-12 px-6 inline-flex items-center justify-center bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2"
                >
                  Book Now
                </Link>

                {/* Option 2: Using button with programmatic navigation */}
                {/* 
                <button
                  onClick={handleAppointmentClick}
                  className="px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2"
                >
                  Book Now
                </button>
                */}

                <button
                  onClick={() => handleScrollToSection("footer")}
                  className="group relative inline-flex h-12 items-center justify-center rounded-full border border-green3 px-6 text-text/60 hover:bg-green3/80 hover:text-text/90 transition-colors"
                >
                  <div className="w-0 -translate-x-[100%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:opacity-100 group-hover:mr-2">
                    <Phone className="size-5" />
                  </div>
                  <span>Contact Us</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-10 mt-10">
              {[
                "Improved access to veterinary care",
                "Enhanced pet health and well-being",
                "Increased community engagement and support",
              ].map((benefit, index) => (
                <div
                  key={index}
                  className={`items-center py-7 px-8 rounded-full text-text/80 text-lg font-nunito-bold transform border-text border-[1.6px] text-center shadow-md relative overflow-hidden
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
                  <div
                    className="absolute inset-0 mix-blend-overlay opacity-50"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      backgroundSize: "100px 100px",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)`,
                    }}
                  />
                  <span className="relative z-10">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="services" className="min-h-screen">
        <Services />
      </div>
    </motion.div>
  );
};

export default Home;
