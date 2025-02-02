import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, Lightbulb } from "lucide-react";
import { auth } from "../firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { toast } from "react-toastify";

const PricingPage = () => {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nextMonthPlan, setNextMonthPlan] = useState(null);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingSubscription, setProcessingSubscription] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setCurrentPlan(userData?.plan || "free");
        setNextMonthPlan(userData?.nextMonthPlan || null);
      }
    });
    return () => unsubscribe();
  }, []);

  const getPlanValue = (plan) => {
    const values = {
      premium: 3,
      standard: 2,
      basic: 1,
      free: 0,
    };
    return values[plan];
  };

  const isDowngrade = (newPlan) => {
    return getPlanValue(newPlan) < getPlanValue(currentPlan);
  };

  const handleSubscription = async (plan) => {
    if (!isAuthenticated) return;

    try {
      setProcessingSubscription(true);

      const planBenefits = {
        basic: { consultations: 2, grooming: 0, discount: 0.1 },
        standard: { consultations: 4, grooming: 1, discount: 0.15 },
        premium: { consultations: 6, grooming: 2, discount: 0.2 },
        free: { consultations: 0, grooming: 0, discount: 0 },
      };

      const benefits = planBenefits[plan];
      const now = new Date();
      const subscriptionDate = now.toISOString();

      if (isDowngrade(plan)) {
        // For downgrades, set the next month's plan
        const firstDayNextMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1
        );

        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          nextMonthPlan: plan,
          nextMonthPlanDate: firstDayNextMonth.toISOString(),
          subscriptionHistory: {
            lastChanged: subscriptionDate,
            previousPlan: currentPlan,
            newPlan: plan,
            effectiveDate: firstDayNextMonth.toISOString(),
            type: "downgrade",
          },
        });

        setNextMonthPlan(plan);
        toast.success(
          `Your plan will be downgraded to ${plan} on ${firstDayNextMonth.toLocaleDateString()}`
        );
      } else {
        // For upgrades or same-level changes, apply immediately
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          plan: plan,
          remainingConsultations: benefits.consultations,
          remainingGrooming: benefits.grooming,
          discount: benefits.discount,
          nextMonthPlan: null,
          nextMonthPlanDate: null,
          subscriptionHistory: {
            lastChanged: subscriptionDate,
            previousPlan: currentPlan,
            newPlan: plan,
            effectiveDate: subscriptionDate,
            type: "upgrade",
          },
        });

        setCurrentPlan(plan);
        setNextMonthPlan(null);
        toast.success(`Successfully upgraded to ${plan} plan!`);
      }

      // Store the subscription transaction
      await updateDoc(doc(db, "transactions", auth.currentUser.uid), {
        subscriptions: [
          {
            date: subscriptionDate,
            plan: plan,
            amount: pricingTiers.find((tier) =>
              tier.name.toLowerCase().includes(plan)
            ).price,
            paymentMethod: "Cash",
            status: "Completed",
          },
        ],
      });
    } catch (error) {
      toast.error("Error updating plan");
    } finally {
      setProcessingSubscription(false);
      setShowDowngradeWarning(false);
      setSelectedPlan(null);
    }
  };

  const handlePlanSelection = (plan) => {
    const planName = plan.toLowerCase().replace(" care", "");

    if (currentPlan === planName) return;

    if (isDowngrade(planName)) {
      setSelectedPlan(planName);
      setShowDowngradeWarning(true);
    } else {
      handleSubscription(planName);
    }
  };

  const pricingTiers = [
    {
      name: "Basic Care",
      price: "₱599",
      period: "per month",
      description: "Essential veterinary care for budget-conscious pet owners",
      features: [
        "2 consultations per month",
        "10% discount on products",
        "Basic appointment reminders",
        "Access to pet wellness tips",
      ],
      benefits: {
        consultations: 2,
        grooming: 0,
        discount: 0.1,
      },
      highlighted: false,
    },
    {
      name: "Standard Care",
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
      benefits: {
        consultations: 4,
        grooming: 1,
        discount: 0.15,
      },
      highlighted: true,
    },
    {
      name: "Premium Care",
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
      benefits: {
        consultations: 6,
        grooming: 2,
        discount: 0.2,
      },
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

          {isAuthenticated && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 max-w-5xl mx-auto">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-4" />
                <div className="flex-grow">
                  <p className="text-yellow-800 font-nunito-semibold">
                    Current Plan:{" "}
                    <span className="font-nunito-bold">
                      {currentPlan.toUpperCase()}
                    </span>
                    {nextMonthPlan && (
                      <span className="ml-2 text-sm">
                        (Changing to {nextMonthPlan.toUpperCase()} next month)
                      </span>
                    )}
                  </p>
                </div>
                <div className="relative group">
                  <Lightbulb className="h-5 w-5 text-yellow-600 cursor-pointer" />
                  <div className="tracking-wide font-nunito-semibold absolute z-10 p-3 -mt-2 text-sm text-background bg-[#8BB1A0] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-64 right-0">
                    {pricingTiers
                      .find((tier) =>
                        tier.name.toLowerCase().includes(currentPlan)
                      )
                      ?.features.join(", ") || "Free plan limitations apply"}
                  </div>
                </div>
              </div>
              {nextMonthPlan && (
                <div className="mt-2 flex items-start gap-2">
                  <p className="text-sm text-yellow-700">
                    Your plan will be changed to {nextMonthPlan.toUpperCase()}{" "}
                    on the first day of next month. Until then, you'll continue
                    to enjoy your current plan benefits.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => {
              const tierName = tier.name.toLowerCase().replace(" care", "");
              const isCurrentPlan = currentPlan === tierName;
              const isDisabled = isDowngrade(tierName) && !showDowngradeWarning;

              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative rounded-2xl border-[1.6px] border-green2 p-6
                    ${
                      tier.highlighted
                        ? "bg-green3/50 shadow-xl scale-105"
                        : "bg-background/95 shadow-lg"
                    }
                    transition-all hover:shadow-xl
                    ${isDisabled ? "opacity-50" : ""}`}
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
                    onClick={() => handlePlanSelection(tier.name)}
                    disabled={isCurrentPlan || processingSubscription}
                    className={`
                      w-full px-4 py-2 rounded-full border-[1.6px] border-green2
                      transition-colors
                      ${
                        isCurrentPlan
                          ? "bg-green3/60 cursor-not-allowed"
                          : processingSubscription
                          ? "bg-gray-200 cursor-wait"
                          : isDisabled
                          ? "bg-gray-200 cursor-not-allowed"
                          : tier.highlighted
                          ? "bg-green3 text-text hover:bg-green3/80"
                          : "bg-background text-text hover:bg-green3/20"
                      }
                    `}
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : processingSubscription
                      ? "Processing..."
                      : "Choose Plan"}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {showDowngradeWarning && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl max-w-md mx-4">
                <h3 className="text-lg font-bold text-text mb-4">
                  Downgrade Confirmation
                </h3>
                <p className="text-text/80 mb-6 font-nunito-semibold">
                  You are about to downgrade from {currentPlan.toUpperCase()} to{" "}
                  {selectedPlan.toUpperCase()}. This change will take effect on
                  the first day of next month. Until then, you'll continue to
                  enjoy your current plan benefits. You will be charged the new
                  plan rate now.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDowngradeWarning(false)}
                    className="px-4 py-2 text-text/80 hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubscription(selectedPlan)}
                    className="px-4 py-2 bg-green3 text-text rounded-lg hover:bg-green3/80"
                  >
                    Confirm Downgrade
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
