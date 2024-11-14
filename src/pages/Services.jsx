import React, { useState } from "react";
import { ChevronDown, MoveUpRight } from "lucide-react";

const Services = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const services = [
    {
      title: "Veterinary Information & Online Appointment Scheduling",
      content:
        "A centralized platform for easy access to reliable veterinary clinics and streamlined appointment booking, reducing confusion and saving time.",
    },
    {
      title: "Navigation Assistance, Educational Resources & AI Integration",
      content:
        "Comprehensive navigation tools and educational materials enhanced with AI technology to provide better pet care guidance.",
    },
    {
      title: "Community Connections",
      content:
        "Platform for connecting pet owners with local resources and community initiatives.",
    },
  ];

  return (
    <div id="services" className="min-h-screen bg-transparent">
      <div className="container mx-auto px-6 pb-20  font-nunito-bold">
        <div className="max-w-5xl mx-auto sm:pt-20 lg:pt-0">
          <h1 className="text-4xl font-bold text-text mb-8 tracking-wide">
            What Highland PetVibes has to offer
          </h1>

          <p className="text-text/80 mb-12 tracking-wide">
            We provide a centralized platform for veterinary information and
            online appointment scheduling. Our service connects pet owners with
            local resources and initiatives, promoting responsible pet ownership
            and enhancing overall pet welfare in Baguio City.
          </p>

          <div className="space-y-4 mb-20 tracking-wide">
            {services.map((service, index) => (
              <div
                key={index}
                className="border-[1.6px] border-green2 rounded-2xl overflow-hidden"
              >
                <button
                  className={`w-full px-6 py-4 flex justify-between items-center transition-colors ${
                    activeAccordion === index
                      ? "bg-green3/20"
                      : "bg-pantone hover:bg-green3/20"
                  }`}
                  onClick={() =>
                    setActiveAccordion(activeAccordion === index ? null : index)
                  }
                >
                  <span className="text-lg font-medium text-text">
                    {service.title}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-text transition-transform ${
                      activeAccordion === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {activeAccordion === index && (
                  <div className="px-6 py-7 bg-background">
                    <p className="text-text/80 tracking-normal font-nunito-bold">
                      {service.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-text mb-12">
            Clinic Services
          </h2>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full h-full md:w-1/2 border-[1.6px] border-green2 rounded-2xl">
                <div className="flex items-center justify-center h-full bg-green3/10">
                  <img
                    src="/images/card1.jpg"
                    alt="Card"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-semibold text-text mb-4">
                  Consultation
                </h3>
                <p className="text-text/80 leading-relaxed tracking-wide">
                  Our veterinarians focus on preventive care, providing
                  personalized treatment plans for every pet.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <h3 className="text-2xl font-semibold text-text mb-4">
                  Confinement
                </h3>
                <p className="text-text/80 leading-relaxed tracking-wide">
                  We offer inpatient care for pets recovering from illness or
                  surgery, ensuring their comfort and safety.
                </p>
              </div>
              <div className="w-full md:w-1/2 border-[1.6px] border-green2 rounded-2xl order-1 md:order-2">
                <div className="flex items-center justify-center h-50 bg-green3/10">
                  <img
                    src="/images/card2.jpg"
                    alt="Card"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>
            {showMore && (
              <>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/2 border-[1.6px] border-green2 rounded-2xl">
                    <div className="flex items-center justify-center h-50 bg-green3/10">
                      <img
                        src="/images/card3.jpg"
                        alt="Card"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <h3 className="text-2xl font-semibold text-text mb-4">
                      Surgery
                    </h3>
                    <p className="text-text/80 leading-relaxed tracking-wide">
                      Equipped for various surgical procedures, we prioritize
                      your pet's safety and comfort during every operation.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/2">
                    <h3 className="text-2xl font-semibold text-text mb-4">
                      Dental Care
                    </h3>
                    <p className="text-text/80 leading-relaxed tracking-wide">
                      Regular dental check-ups and cleanings help maintain your
                      pet's oral health and overall well-being."
                    </p>
                  </div>
                  <div className="w-full md:w-1/2 border-[1.6px] border-green2 rounded-2xl order-1 md:order-2">
                    <div className="flex items-center justify-center h-full bg-green3/10">
                      <img
                        src="/images/card4.jpg"
                        alt="Dental Care"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 mt-12">
            <button
              onClick={() => setShowMore(!showMore)}
              className="mb-5 px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 border-[1.6px] border-green2 transition-colors"
            >
              {showMore ? "Show Less" : "More"}
            </button>
            {showMore && (
              <a
                href="/appointments"
                className="mb-5 flex items-center gap-2 text-text hover:text-text/80 transition-colors"
              >
                View All Options
                <MoveUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
