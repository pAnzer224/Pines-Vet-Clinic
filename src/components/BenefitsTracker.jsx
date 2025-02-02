import React from "react";
import { Calendar, Scissors, Stethoscope, PawPrint, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const RemainingBenefits = ({
  plan,
  remainingConsultations,
  remainingGrooming,
  remainingDentalCheckups,
  onClose,
}) => {
  const getBenefitCard = (icon, title, remaining, total) => {
    const Icon = icon;
    const isFree = remaining > 0;

    return (
      <div className="bg-background border-[1.6px] border-green2 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="size-5 text-primary" />
          <h3 className="text-sm font-semibold text-primary/80">{title}</h3>
        </div>
        <div className="text-primary">
          <span className="font-nunito-bold">{remaining}</span>
          <span className="text-primary/80 text-sm"> remaining of </span>
          <span className="font-bold">{total}</span>
        </div>
        <div className="mt-2 text-xs">
          {isFree ? (
            <span className="text-green2">Next visit: FREE</span>
          ) : (
            <span className="text-primary">Regular pricing applies</span>
          )}
        </div>
      </div>
    );
  };

  const getPlanTotals = () => {
    const totals = {
      basic: { consultations: 2, grooming: 0, dental: 0 },
      standard: { consultations: 4, grooming: 1, dental: 1 },
      premium: { consultations: 6, grooming: 2, dental: 2 },
      free: { consultations: 0, grooming: 0, dental: 0 },
    };
    return totals[plan] || totals.free;
  };

  const getPlanName = () => {
    const names = {
      basic: <span className="text-[#478CDD]">Basic Care</span>,
      standard: <span className="text-[#54E25A]">Standard Care</span>,
      premium: <span className="text-[#DD47BC]">Premium Care</span>,
      free: "Free",
    };
    return names[plan] || "Free";
  };

  const planTotals = getPlanTotals();
  const isFreeUser = plan === "free";

  return (
    <div className="max-w-5xl mx-auto mt-8 mb-8">
      <div className="bg-pantone/70 shadow-sm rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-green2 hover:text-primary transition-colors"
        >
          <X strokeWidth={5} className="size-5" />
        </button>

        {isFreeUser ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <PawPrint className="size-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-primary mb-2">
              You're not currently subscribed to a plan
            </h2>
            <p className="text-primary/80 mb-6 text-sm">
              Discover our range of pet care plans and their exclusive benefits
            </p>
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
        ) : (
          <>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <PawPrint className="size-5" />
              You're currently subscribed to a {getPlanName()} Plan
            </h2>
            <p className="text-primary/80 text-sm mb-4 tracking-wide">
              Enjoy these exclusive benefits:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getBenefitCard(
                Stethoscope,
                "Consultations",
                remainingConsultations,
                planTotals.consultations
              )}
              {getBenefitCard(
                Scissors,
                "Grooming Services",
                remainingGrooming,
                planTotals.grooming
              )}
              {getBenefitCard(
                Calendar,
                "Dental Check-ups",
                remainingDentalCheckups,
                planTotals.dental
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RemainingBenefits;
