import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { toast } from "react-toastify";

export const getPlanExpirationDate = (nextBillingDate) => {
  if (!nextBillingDate) return "N/A";
  const expiryDate = new Date(nextBillingDate);
  return expiryDate.toLocaleDateString();
};

export const handleSubscriptionRequest = async ({
  plan,
  billingPeriod,
  auth,
  setProcessingRequest,
}) => {
  try {
    setProcessingRequest(true);
    const subscriptionDate = new Date();
    const expiryDate = new Date(subscriptionDate);
    if (billingPeriod === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      if (subscriptionDate.getDate() !== expiryDate.getDate()) {
        expiryDate.setDate(0);
      }
    } else if (billingPeriod === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const updateData = {
      planRequest: {
        requestedPlan: plan,
        billingPeriod: billingPeriod,
        requestDate: subscriptionDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      },
      planStatus: "Pending",
    };

    await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
    toast.success(
      "Plan request submitted successfully! Awaiting admin approval."
    );
  } catch (error) {
    console.error("Error submitting plan request:", error);
    toast.error("Error submitting plan request");
  } finally {
    setProcessingRequest(false);
  }
};

export const pricingTiers = [
  {
    name: "Basic Care",
    monthlyPrice: "₱599",
    yearlyPrice: "₱5,990",
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
    monthlyPrice: "₱1,199",
    yearlyPrice: "₱11,990",
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
    monthlyPrice: "₱1,599",
    yearlyPrice: "₱15,990",
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

const planBenefits = {
  basic: { consultations: 2, grooming: 0, discount: 0.1 },
  standard: { consultations: 4, grooming: 1, discount: 0.15 },
  premium: { consultations: 6, grooming: 2, discount: 0.2 },
  free: { consultations: 0, grooming: 0, discount: 0 },
};

export const getPlanValue = (plan) => {
  const values = {
    premium: 3,
    standard: 2,
    basic: 1,
    free: 0,
  };
  return values[plan];
};

export const isDowngrade = (newPlan, currentPlan) => {
  return getPlanValue(newPlan) < getPlanValue(currentPlan);
};

export const handleSubscription = async ({
  plan,
  billingPeriod,
  currentPlan,
  auth,
  setProcessingSubscription,
  setNextMonthPlan,
  setCurrentPlan,
}) => {
  try {
    setProcessingSubscription(true);

    const benefits = planBenefits[plan];
    const now = new Date();
    const subscriptionDate = now.toISOString();

    // expiry date
    const expiryDate = new Date(now);
    if (billingPeriod === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      if (now.getDate() !== expiryDate.getDate()) {
        expiryDate.setDate(0);
      }
    } else if (billingPeriod === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const updateData = {
      billingPeriod: billingPeriod,
      remainingConsultations: benefits.consultations,
      remainingGrooming: benefits.grooming,
      discount: benefits.discount,
      subscriptionStartDate: subscriptionDate,
      subscriptionExpiryDate: expiryDate.toISOString(),
      subscriptionHistory: {
        lastChanged: subscriptionDate,
        previousPlan: currentPlan.name,
        newPlan: plan,
        billingPeriod: billingPeriod,
        effectiveDate: subscriptionDate,
        expiryDate: expiryDate.toISOString(),
        type: "change",
      },
    };

    if (isDowngrade(plan, currentPlan.name)) {
      const firstDayNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );

      updateData.nextMonthPlan = plan;
      updateData.nextMonthPlanDate = firstDayNextMonth.toISOString();
      updateData.subscriptionHistory.type = "downgrade";

      setNextMonthPlan(plan);
      toast.success(
        `Your plan will be changed to ${plan} on ${firstDayNextMonth.toLocaleDateString()}`
      );
    } else {
      updateData.plan = plan;
      updateData.nextMonthPlan = null;
      updateData.nextMonthPlanDate = null;

      setCurrentPlan({
        name: plan,
        billingPeriod: billingPeriod,
      });
      setNextMonthPlan(null);
      toast.success(`Successfully updated to ${plan} plan!`);
    }

    await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);

    await updateDoc(doc(db, "transactions", auth.currentUser.uid), {
      subscriptions: [
        {
          date: subscriptionDate,
          plan: plan,
          amount: pricingTiers.find((tier) =>
            tier.name.toLowerCase().includes(plan)
          )[billingPeriod === "monthly" ? "monthlyPrice" : "yearlyPrice"],
          paymentMethod: "Cash",
          status: "Completed",
          expiryDate: expiryDate.toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    toast.error("Error updating plan");
  } finally {
    setProcessingSubscription(false);
  }
};

export const checkPhoneNumber = async (auth) => {
  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
  const userData = userDoc.data();
  return userData?.phone && userData?.phone !== "Add Now";
};
