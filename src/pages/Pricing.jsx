import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, Lightbulb } from "lucide-react";
import { auth } from "../firebase-config";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";
import PromptModal from "../components/promptModal";
import {
  pricingTiers,
  handleSubscriptionRequest,
  isDowngrade,
  checkPhoneNumber,
} from "./plansUtils";

const PricingPage = () => {
  const [currentPlan, setCurrentPlan] = useState({
    name: "free",
    billingPeriod: "monthly",
  });
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [planStatus, setPlanStatus] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
          const userData = doc.data();
          const currentUserPlan = userData?.plan || "free";
          const userBillingPeriod = userData?.billingPeriod || "monthly";
          setCurrentPlan({
            name: currentUserPlan,
            billingPeriod: userBillingPeriod,
          });
          setBillingPeriod(userBillingPeriod);
          setPlanStatus(userData?.planStatus || null);
        });

        return () => unsubscribeDoc();
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePlanSelection = async (plan) => {
    const planName = plan.toLowerCase().replace(" care", "");

    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!(await checkPhoneNumber(auth))) {
      setShowPhonePrompt(true);
      return;
    }

    if (
      currentPlan.name === planName &&
      currentPlan.billingPeriod === billingPeriod
    ) {
      return;
    }

    if (planStatus === "Pending") {
      return;
    }

    if (isDowngrade(planName, currentPlan.name)) {
      setSelectedPlan(planName);
      setShowDowngradeWarning(true);
    } else {
      handleSubscriptionRequest({
        plan: planName,
        billingPeriod,
        auth,
        setProcessingRequest,
      });
    }
  };

  const shouldShowHighlight =
    currentPlan.name === "free" && planStatus !== "Pending";

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

          <div className="flex justify-center max-w-[14rem] m-auto mb-8">
            <div className="relative flex w-full p-1 bg-pantone/70 rounded-full">
              <span
                className="absolute inset-0 m-1 pointer-events-none"
                aria-hidden="true"
              >
                <span
                  className={`absolute inset-0 w-1/2 bg-green3 rounded-full shadow-sm shadow-green3/50 transform transition-transform duration-150 ease-in-out ${
                    billingPeriod === "yearly"
                      ? "translate-x-full"
                      : "translate-x-0"
                  }`}
                />
              </span>
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`relative flex-1 text-sm font-medium h-8 rounded-full focus-visible:outline-none focus-visible:ring focus-visible:ring-green3/30 transition-colors duration-150 ease-in-out ${
                  billingPeriod === "monthly" ? "text-text" : "text-text/60"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`relative flex-1 text-sm font-medium h-8 rounded-full focus-visible:outline-none focus-visible:ring focus-visible:ring-green3/30 transition-colors duration-150 ease-in-out ${
                  billingPeriod === "yearly" ? "text-text" : "text-text/60"
                }`}
              >
                Yearly{" "}
                <span
                  className={`ml-1 text-xs ${
                    billingPeriod === "yearly" ? "text-primary" : "text-text/40"
                  }`}
                >
                  -16%
                </span>
              </button>
            </div>
          </div>

          {isAuthenticated && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-5xl mx-auto">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-4" />
                <div className="flex-grow">
                  <p className="text-yellow-800 font-nunito-semibold">
                    Current Plan:{" "}
                    <span className="font-nunito-bold">
                      {currentPlan.name.toUpperCase()} (
                      {currentPlan.billingPeriod})
                    </span>
                  </p>
                </div>
                <div className="relative group">
                  <Lightbulb className="h-5 w-5 text-yellow-600 cursor-pointer" />
                  <div className="tracking-wide font-nunito-semibold absolute z-10 p-3 -mt-2 text-sm text-background bg-[#8BB1A0] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-64 right-0">
                    {pricingTiers
                      .find((tier) =>
                        tier.name.toLowerCase().includes(currentPlan.name)
                      )
                      ?.features.join(", ") || "Free plan limitations apply"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAuthenticated && planStatus === "Pending" && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="bg-red/20 border-l-4 border-red p-2 max-w-5xl mx-auto rounded-ee-lg rounded-bl-lg"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center"
              >
                <AlertCircle
                  strokeWidth={3}
                  className="size-5 text-red/80 mr-3 ml-2"
                />
                <div className="flex-grow">
                  <p className="text-red font-nunito-semibold text-sm">
                    You have a pending plan request. Please wait for admin
                    approval.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {pricingTiers.map((tier, index) => {
              const tierName = tier.name.toLowerCase().replace(" care", "");
              const isCurrentPlan =
                currentPlan.name === tierName &&
                currentPlan.billingPeriod === billingPeriod;

              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative rounded-2xl ${
                    isCurrentPlan
                      ? "border-transparent bg-background/80 shadow-2xl before:bg-gradient-to-b before:from-primary/70 before:via-green3/20 before:to-green3/90 before:absolute before:inset-0 before:m-[-6.2px] before:rounded-2xl before:-z-10"
                      : tier.highlighted && shouldShowHighlight
                      ? "border-green2 bg-green3/50 shadow-xl scale-105"
                      : "border-green2 bg-background/95 shadow-lg"
                  } p-6 transition-all hover:shadow-xl border-[1.6px]`}
                >
                  {tier.highlighted && shouldShowHighlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-background text-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-text mb-2">
                      {tier.name}
                    </h3>
                    <div className="text-3xl font-bold text-primary mb-1">
                      {billingPeriod === "monthly"
                        ? tier.monthlyPrice
                        : tier.yearlyPrice}
                    </div>
                    <div className="text-text/60 text-sm">
                      {billingPeriod === "monthly" ? "per month" : "per year"}
                    </div>
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
                    disabled={
                      isCurrentPlan ||
                      processingRequest ||
                      planStatus === "Pending"
                    }
                    className={`w-full px-4 py-2 rounded-full border-[1.6px] border-green2 transition-colors ${
                      isCurrentPlan
                        ? "bg-green3/60 cursor-not-allowed"
                        : processingRequest
                        ? "bg-gray-200 cursor-wait"
                        : planStatus === "Pending"
                        ? "bg-gray-200 cursor-not-allowed"
                        : tier.highlighted && shouldShowHighlight
                        ? "bg-green3 text-text hover:bg-green3/80"
                        : "bg-background text-text hover:bg-green3/20"
                    }`}
                    style={{
                      display:
                        planStatus === "Pending" && !isCurrentPlan
                          ? "none"
                          : "block",
                    }}
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : processingRequest
                      ? "Processing..."
                      : planStatus === "Pending" && isCurrentPlan
                      ? "Awaiting Confirmation"
                      : "Request Plan"}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {showDowngradeWarning && (
            <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
              <div className="bg-background p-6 rounded-2xl max-w-md mx-4">
                <h3 className="text-lg font-bold text-text mb-4">
                  Downgrade Confirmation
                </h3>
                <p className="text-text/80 mb-6 font-nunito-semibold">
                  You are about to request a downgrade from{" "}
                  {currentPlan.name.toUpperCase()} to{" "}
                  {selectedPlan.toUpperCase()}. This request will need admin
                  approval. Once approved, you'll continue to enjoy your current
                  plan benefits until the change takes effect.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDowngradeWarning(false)}
                    className="px-4 py-2 text-text/80 hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleSubscriptionRequest({
                        plan: selectedPlan,
                        billingPeriod,
                        auth,
                        setProcessingRequest,
                      });
                      setShowDowngradeWarning(false);
                    }}
                    className="px-4 py-2 bg-green3 text-text rounded-lg hover:bg-green3/80"
                  >
                    Confirm Downgrade Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPhonePrompt && (
            <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
              <div className="bg-background p-6 rounded-2xl max-w-md mx-4">
                <h3 className="text-lg font-bold text-text mb-4">
                  Phone Number Required
                </h3>
                <p className="text-text/80 mb-6 font-nunito-semibold">
                  Please add your phone number in your profile before selecting
                  a plan. This helps us provide better service and emergency
                  contact options.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowPhonePrompt(false)}
                    className="px-4 py-2 text-text/80 hover:text-text"
                  >
                    Cancel
                  </button>
                  <a
                    href="/user/profile"
                    className="px-4 py-2 bg-green3 text-text rounded-lg hover:bg-green3/80"
                  >
                    Go to Profile
                  </a>
                </div>
              </div>
            </div>
          )}

          <PromptModal
            isOpen={showAuthPrompt}
            onClose={() => setShowAuthPrompt(false)}
            title="Sign up now to choose a plan"
            message="Create an account or log in to select a membership plan for your pet's healthcare."
          />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
