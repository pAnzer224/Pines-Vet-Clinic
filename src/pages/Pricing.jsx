import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PricingPage = () => {
  const pricingTiers = [
    {
      name: "Basic Plan",
      price: "₱599",
      period: "per month",
      description: "Essential veterinary care for budget-conscious pet owners",
      features: [
        "2 consultations per month",
        "10% discount on products",
        "Basic appointment reminders",
        "Access to pet wellness tips",
      ],
      highlighted: false,
    },
    {
      name: "Standard Plan",
      price: "₱1,199",
      period: "per month",
      description: "Enhanced care with added benefits for your pet",
      features: [
        "Basic Care features",
        "4 consultations per month",
        "1 grooming service per month",
        "15% discount on products",
        "Priority appointment scheduling",
        "Monthly dental check-ups",
      ],
      highlighted: true,
    },
    {
      name: "Premium Plan",
      price: "₱1,599",
      period: "per month",
      description: "Complete pet healthcare with exclusive benefits",
      features: [
        "Standard Care features",
        "6 consultations per month",
        "2 grooming services per month",
        "20% discount on products",
        "Personalized pet health tracking",
        "Priority emergency services",
      ],
      highlighted: false,
    },
  ];

  return (
    <div id="pricing" className="min-h-screen bg-transparent">
      <div className="container mx-auto px-6 pb-20 font-nunito-bold">
        <div className="max-w-5xl mx-auto sm:pt-20 lg:pt-0">
          <h1 className="text-4xl font-bold text-text mb-2 tracking-wide text-center">
            Pines Vet Clinic Membership Plans
          </h1>
          <p className="text-text/80 mb-12 tracking-wide font-nunito-semibold text-center max-w-2xl mx-auto">
            Choose the perfect monthly membership plan for your pet. All plans
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
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-background text-sm">
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
            All plans include a 30-day satisfaction guarantee. Small pets
            include cats and dogs under 15kg. Basic grooming includes bath &
            brush service. Full-service grooming includes complete grooming
            package. Emergency services surcharge applies for holidays.
            Additional fees may apply for specialized treatments or services not
            covered in the plan. Contact us for more details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
