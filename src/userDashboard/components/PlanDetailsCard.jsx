import React from "react";
import {
  Crown,
  Calendar,
  Sparkles,
  ShieldPlus,
  Clock,
  Tag,
  ChevronRight,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const PlanDetailsCard = ({ planData }) => {
  const getPlanColor = (plan) => {
    const colors = {
      premium: "text-[#DD47BC]",
      standard: "text-[#54E25A]",
      basic: "text-[#478CDD]",
      free: "text-primary",
    };
    return colors[plan] || colors.free;
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case "premium":
        return <Crown strokeWidth={2} className="size-5 text-[#DD47BC]" />;
      case "standard":
        return (
          <ShieldPlus strokeWidth={2.5} className="size-5 text-[#54E25A]" />
        );
      case "basic":
        return <Calendar strokeWidth={2.5} className="size-5 text-[#478CDD]" />;
      default:
        return <AlertCircle className="size-5" />;
    }
  };

  const getNextBillingDate = () => {
    // Check for subscription date in different possible locations
    const subscriptionDate =
      planData.subscriptionHistory?.lastChanged ||
      planData.subscriptionHistory?.effectiveDate;

    if (!subscriptionDate) return "Not available";

    const startDate = new Date(subscriptionDate);
    const today = new Date();

    // For yearly subscriptions
    if (planData.billingPeriod?.toLowerCase() === "yearly") {
      let nextRenewal = new Date(startDate);
      nextRenewal.setFullYear(startDate.getFullYear() + 1);

      // If the calculated renewal date is in the past, add years until it's in the future
      while (nextRenewal < today) {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      }

      return nextRenewal.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // For monthly subscriptions
    let nextMonth = new Date(startDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // If the calculated date is in the past, keep adding months until we get a future date
    while (nextMonth < today) {
      nextMonth.setMonth(nextMonth.getMonth() + 1);
    }

    return nextMonth.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanFeatures = (plan) => {
    const features = {
      premium: [
        "6 consultations per month",
        "2 grooming services",
        "20% discount on products",
        "Priority emergency services",
        "Monthly dental check-ups",
        "Personalized health tracking",
      ],
      standard: [
        "4 consultations per month",
        "1 grooming service",
        "15% discount on products",
        "Priority scheduling",
        "Monthly dental check-up",
        "Basic health tracking",
      ],
      basic: [
        "2 consultations per month",
        "No grooming services",
        "10% discount on products",
        "Regular scheduling",
        "Basic appointment reminders",
        "Access to wellness tips",
      ],
      free: [
        "Pay-per-visit consultations",
        "Regular pricing for services",
        "No included benefits",
        "Regular scheduling",
        "Basic appointment system",
        "Limited features access",
      ],
    };
    return features[plan] || features.free;
  };

  if (!planData || planData.plan === "free") {
    return (
      <div className="bg-pantone/80 p-6 rounded-lg shadow-sm border-2 border-green3/60">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-green2" size={24} />
            <h2 className="text-lg font-nunito-bold tracking-wide text-green2">
              Pet Care Plans
            </h2>
          </div>
        </div>

        <div className="text-center space-y-4 mb-6">
          <p className="text-primary/70 font-nunito-bold text-md">
            Discover our care plans starting from ₱599/month
          </p>
          <div className="space-y-1 font-nunito-semibold">
            <p className="text-sm text-primary/60">
              • Monthly consultations included
            </p>
            <p className="text-sm text-primary/60">
              • Save up to 20% on products
            </p>
            <p className="text-sm text-primary/60">
              • Grooming services included
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            to="/pricing"
            className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-lg bg-green2 px-6 py-2 text-sm font-nunito-semibold text-background transition-colors hover:bg-green2/90"
          >
            <span className="translate-x-0 opacity-100 transition group-hover:-translate-x-[150%] group-hover:opacity-0">
              View Plans
            </span>
            <span className="absolute translate-x-[150%] opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-green2" size={24} />
          <h2 className="text-lg font-nunito-bold tracking-wide text-green2">
            Your Plan Details
          </h2>
        </div>
        <Link
          to="/pricing"
          className="flex items-center px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30"
        >
          Change Plan
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      <div className="border-2 border-primary/40 bg-green3/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getPlanIcon(planData.plan)}
            <span
              className={`text-lg font-nunito-bold ${getPlanColor(
                planData.plan
              )}`}
            >
              {planData.plan.charAt(0).toUpperCase() + planData.plan.slice(1)}{" "}
              Plan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} strokeWidth={2} className="text-primary/60" />
            <span className="text-sm text-primary/60 font-nunito-bold">
              Renews {getNextBillingDate()}
            </span>
          </div>
        </div>

        {planData.nextMonthPlan && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r mb-4">
            <div className="flex items-center text-sm">
              <AlertCircle className="size-4 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-nunito-semibold tracking-wide">
                Changing to {planData.nextMonthPlan.toUpperCase()} plan next
                month
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Tag size={16} strokeWidth={2.5} className="text-primary/60" />
          <span className="text-sm text-primary/60 font-nunito-bold">
            {planData.billingPeriod?.toLowerCase() === "yearly"
              ? "Yearly subscription (-16%)"
              : "Monthly subscription"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-nunito-bold text-primary">
          Current Plan Benefits:
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {getPlanFeatures(planData.plan).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-green2" />
              <span className="text-sm text-primary/60 font-nunito-bold">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-green3/20">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-nunito-bold text-primary">
              Usage This Month
            </h4>
            <p className="text-xs text-primary/60 font-nunito-semibold tracking-wide">
              Updated in real-time
            </p>
          </div>
          <Link
            to="/appointments"
            className="text-sm text-green2 hover:text-green3 font-nunito-bold flex items-center gap-1"
          >
            Book Services
            <ChevronRight strokeWidth={3} className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsCard;
