import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PricingPage = () => {
  const pricingTiers = [
    {
      name: "Basic Care",
      price: "₱1,000",
      period: "per visit",
      description: "Essential veterinary services for your pet's basic needs",
      features: [
        "General health check-up",
        "Basic vaccinations",
        "Parasite prevention",
        "Basic grooming services",
        "Email support",
      ],
      highlighted: false,
    },
    {
      name: "Premium Care",
      price: "₱2,000",
      period: "per visit",
      description: "Comprehensive care package with priority services",
      features: [
        "All Basic Care features",
        "Priority scheduling",
        "Health screenings",
        "Dental cleaning",
        "Emergency care",
      ],
      highlighted: true,
    },
    {
      name: "Ultimate Care",
      price: "₱3,000",
      period: "per visit",
      description: "Complete pet healthcare with exclusive benefits",
      features: [
        "All Premium Care features",
        "Home visits",
        "Specialized treatments",
        "Pet insurance",
        "Unlimited consultations",
        "Personal vet",
        "VIP emergency response",
      ],
      highlighted: false,
    },
  ];

  return (
    <div id="pricing" className="min-h-screen bg-transparent">
      <div className="container mx-auto px-6 pb-20 font-nunito-bold">
        <div className="max-w-5xl mx-auto sm:pt-20 lg:pt-0">
          <h1 className="text-4xl font-bold text-text mb-2 tracking-wide text-center">
            Simple, Transparent Pricing
          </h1>
          <p className="text-text/80 mb-12 tracking-wide font-nunito-medium text-center max-w-2xl mx-auto">
            Choose the perfect care package for your beloved pet. All plans
            include our commitment to exceptional veterinary care.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  relative rounded-2xl border-[1.6px] border-green2 p-6
                  ${
                    tier.highlighted
                      ? "bg-green3/30 shadow-xl scale-105"
                      : "bg-background/95 shadow-lg"
                  }
                  transition-all hover:shadow-xl
                `}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-white text-sm">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-text mb-2">
                    {tier.name}
                  </h3>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {tier.price}
                  </div>
                  <div className="text-text/60 text-sm">{tier.period}</div>
                </div>

                <p className="text-text/80 text-md text-center mb-6">
                  {tier.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-text/80 text-sm"
                    >
                      <Check className="w-5 h-5 text-green2 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`
                    w-full px-4 py-2 rounded-full border-[1.6px] border-green2
                    transition-colors
                    ${
                      tier.highlighted
                        ? "bg-green3 text-text hover:bg-green3/80"
                        : "bg-background text-text hover:bg-green3/20"
                    }
                  `}
                >
                  Choose Plan
                </button>
              </motion.div>
            ))}
          </div>

          <p className="text-text/60 text-sm text-center mt-12">
            All plans come with a 100% satisfaction guarantee. Prices may vary
            based on pet size and specific needs. Contact us for a personalized
            quote.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
