import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const GroomingBoarding = ({ isHomePage }) => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If not on home page and coming from home, show all services
  useEffect(() => {
    if (!isHomePage && location.state?.fromHome) {
      setShowMore(true);
    }
  }, [isHomePage, location]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const services = [
    {
      title: "Professional Grooming",
      description:
        "Keep your pet looking and feeling their best with our expert grooming services.",
      estimatedTime: "1-2 hours",
    },
    {
      title: "Day Care",
      description: "Supervised play and care for your pet during the day.",
      estimatedTime: "4-8 hours",
    },
    {
      title: "Overnight Boarding",
      description:
        "Safe and comfortable overnight accommodation for your pets when you're away.",
      estimatedTime: "24+ hours",
      hidden: true,
    },
    {
      title: "Pet Spa Services",
      description:
        "Luxury treatments including massage, special baths, and nail care for your pet.",
      estimatedTime: "2-3 hours",
      hidden: true,
    },
  ];

  const handleMoreClick = () => {
    if (isHomePage) {
      // Navigate to standalone page with state to indicate coming from home
      navigate("/grooming-boarding", { state: { fromHome: true } });
    } else {
      setShowMore(!showMore);
    }
  };

  return (
    <motion.div
      className={`${isHomePage ? "" : "min-h-screen"}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      id="grooming-boarding"
    >
      <div className="container mx-auto px-6 font-nunito-bold">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-text mb-8">
            Grooming & Boarding
          </h1>

          <p className="text-text/80 mb-12 tracking-wide">
            Our professional grooming and boarding services ensure your pets
            receive the highest quality care and attention they deserve. Whether
            it's a quick grooming session or extended day care, we treat every
            pet as our own.
          </p>

          <div className="grid gap-6">
            {services.map(
              (service, index) =>
                (!service.hidden || (!isHomePage && showMore)) && (
                  <div
                    key={index}
                    className="border-[1.6px] border-green2 rounded-2xl p-6 bg-pantone"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-text mb-2">
                          {service.title}
                        </h3>
                        <p className="text-text/80 mb-4">
                          {service.description}
                        </p>
                        <p className="text-primary/80 text-sm">
                          Estimated time: {service.estimatedTime}
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 border-[1.6px] border-green2 transition-colors"
                        onClick={() => {}}
                      >
                        <Mail className="w-4 h-4" />
                        Book Now
                      </button>
                    </div>
                  </div>
                )
            )}
          </div>

          <div className="flex justify-center mt-12">
            <button
              onClick={handleMoreClick}
              className="mb-5 px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 border-[1.6px] border-green2 transition-colors"
            >
              {isHomePage ? "More" : showMore ? "Show Less" : "More"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroomingBoarding;
