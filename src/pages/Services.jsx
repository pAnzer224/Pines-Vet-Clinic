import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

const Services = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [fadeWidth, setFadeWidth] = useState("8rem"); // Default 32px for mobile

  useEffect(() => {
    const updateFadeWidth = () => {
      if (window.innerWidth >= 1024) {
        setFadeWidth("8rem"); // 32px for desktop
      } else if (window.innerWidth >= 640) {
        setFadeWidth("6rem"); // 24px for tablet
      } else {
        setFadeWidth("4rem"); // 16px for mobile
      }
    };

    updateFadeWidth();
    window.addEventListener("resize", updateFadeWidth);
    return () => window.removeEventListener("resize", updateFadeWidth);
  }, []);

  const services = [
    {
      title: "Veterinary Information & Online Appointment Scheduling",
      content:
        "A centralized platform for easy access to reliable veterinary clinics and streamlined appointment booking, reducing confusion and saving time.",
    },
    {
      title: "Community Connections",
      content:
        "Platform for connecting pet owners with local resources and community initiatives.",
    },
  ];

  const clinicServices = [
    {
      title: "Consultation",
      description:
        "Our veterinarians focus on preventive care, providing personalized treatment plans for every pet.",
      image: "/images/card1.jpg",
      bookable: true,
    },
    {
      title: "Confinement",
      description:
        "We offer inpatient care for pets recovering from illness or surgery, ensuring their comfort and safety.",
      image: "/images/card2.jpg",
      bookable: true,
    },
    {
      title: "Surgery",
      description:
        "Equipped for various surgical procedures, we prioritize your pet's safety and comfort during every operation.",
      image: "/images/card3.jpg",
      bookable: true,
    },
    {
      title: "Dental Care",
      description:
        "Regular dental check-ups and cleanings help maintain your pet's oral health and overall well-being.",
      image: "/images/card4.jpg",
      bookable: true,
    },
    {
      title: "Pet Grooming",
      description:
        "Professional grooming services to keep your pets clean, healthy, and looking their best with specialized care for all breeds.",
      image: "/images/card5.jpg",
      bookable: true,
    },
    {
      title: "Pet Boarding",
      description:
        "Safe and comfortable accommodation for your pets when you're away, with 24/7 monitoring and personalized care. Walk-in service only.",
      image: "/images/card6.jpg",
      bookable: false,
    },
    {
      title: "Home Service",
      description:
        "Convenient veterinary care at your doorstep, perfect for routine check-ups and pets who are more comfortable at home.",
      image: "/images/card7.jpg",
      bookable: true,
    },
    {
      title: "Emergency Cases",
      description:
        "Round-the-clock emergency veterinary care for urgent cases. Walk-in service only - no appointment needed.",
      image: "/images/card8.jpg",
      bookable: false,
    },
  ];

  return (
    <div id="services" className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-16 lg:pb-20 font-nunito-bold">
        <div className="max-w-5xl mx-auto pt-12 sm:pt-16 lg:pt-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-6 sm:mb-8 tracking-wide">
            What Pines Vet Clinic has to offer
          </h1>

          <p className="text-sm sm:text-base text-text/80 mb-8 sm:mb-12 tracking-wide">
            We provide a centralized platform for veterinary information and
            online appointment scheduling. Our service connects pet owners with
            local resources and initiatives, promoting responsible pet ownership
            and enhancing overall pet welfare in Baguio City.
          </p>

          <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16 lg:mb-20 tracking-wide">
            {services.map((service, index) => (
              <div
                key={index}
                className="border-[1.6px] border-green2 rounded-xl sm:rounded-2xl overflow-hidden"
              >
                <button
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center transition-colors ${
                    activeAccordion === index
                      ? "bg-green3/20"
                      : "bg-pantone hover:bg-green3/20"
                  }`}
                  onClick={() =>
                    setActiveAccordion(activeAccordion === index ? null : index)
                  }
                >
                  <span className="text-base sm:text-lg font-nunito-semibold text-text">
                    {service.title}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-text transition-transform ${
                      activeAccordion === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {activeAccordion === index && (
                  <div className="px-4 sm:px-6 py-5 sm:py-7 bg-background">
                    <p className="text-sm sm:text-base text-text/80 tracking-normal font-nunito-bold">
                      {service.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-8 sm:mb-12">
            Clinic Services
          </h2>

          <div className="relative">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"
              style={{ width: fadeWidth }}
            ></div>
            <div
              className="absolute inset-y-0 right-0 bg-gradient-to-l from-background via-background/80 to-transparent z-10"
              style={{ width: fadeWidth }}
            ></div>
            <Swiper
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              loop={true}
              slidesPerView={1.1}
              coverflowEffect={{
                rotate: 0,
                stretch: 100,
                depth: 100,
                modifier: 1,
                slideShadows: false,
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              modules={[EffectCoverflow, Autoplay]}
              className="w-full"
              breakpoints={{
                640: {
                  slidesPerView: 1.8,
                  coverflowEffect: {
                    stretch: 150,
                    depth: 150,
                  },
                },
                1024: {
                  slidesPerView: 2.5,
                  coverflowEffect: {
                    stretch: 200,
                    depth: 200,
                  },
                },
              }}
            >
              {clinicServices.map((service, index) => (
                <SwiperSlide key={index} className="p-2 sm:p-3 lg:p-4">
                  <div className="transform transition-all duration-300 hover:scale-105">
                    <div className="rounded-xl sm:rounded-2xl overflow-hidden border-[1.6px] border-green2 bg-background">
                      <div className="h-48 sm:h-56 lg:h-64">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="p-4 sm:p-5 lg:p-6">
                        <h3 className="text-xl sm:text-2xl font-semibold text-text mb-2">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-[14px] font-nunito-semibold text-text/80 leading-relaxed tracking-wide">
                          {service.description}
                        </p>
                        {!service.bookable && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green3/20 text-green2 text-xs rounded-full">
                            Walk-in only
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
