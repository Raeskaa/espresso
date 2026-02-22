"use client";

import { Check, Crown, Zap } from "lucide-react";

type SubscriptionTier = "free" | "starter" | "pro";

interface SubscriptionPanelProps {
  tier: SubscriptionTier;
  credits: number;
}

const PLANS = [
  {
    key: "free" as SubscriptionTier,
    name: "Free",
    price: "₹0",
    period: "",
    credits: 100,
    features: [
      "100 welcome credits",
      "Quick Fix (1 credit/photo)",
      "Dating Studio (5 credits/set)",
      "Photo history",
    ],
    cta: null,
    icon: <Zap className="w-5 h-5" />,
  },
  {
    key: "starter" as SubscriptionTier,
    name: "Starter",
    price: "₹499",
    period: "one-time",
    credits: 300,
    features: [
      "300 credits top-up",
      "All Free features",
      "Priority generation",
      "HD downloads",
    ],
    cta: process.env.NEXT_PUBLIC_DODOPAYMENTS_STARTER_LINK ?? "/pricing",
    ctaLabel: "Buy with DodoPayments",
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
  },
  {
    key: "pro" as SubscriptionTier,
    name: "Pro",
    price: "₹999",
    period: "/month",
    credits: 1000,
    features: [
      "1,000 credits / month",
      "All Starter features",
      "Unlimited history",
      "Early access to new features",
    ],
    cta: process.env.NEXT_PUBLIC_RAZORPAY_PRO_LINK ?? "/pricing",
    ctaLabel: "Subscribe with Razorpay",
    icon: <Crown className="w-5 h-5 text-purple-500" />,
  },
];

export default function SubscriptionPanel({
  tier,
  credits,
}: SubscriptionPanelProps) {
  const currentPlan = PLANS.find((p) => p.key === tier) ?? PLANS[0];

  return (
    <div className="space-y-6">
      {/* Current plan banner */}
      <div className="flex items-center gap-3 p-4 bg-[#2D4A3E]/5 rounded-2xl border border-[#2D4A3E]/10">
        <div className="p-2 bg-[#2D4A3E] rounded-lg text-[#E8FF8B]">
          {currentPlan.icon}
        </div>
        <div>
          <p className="text-xs text-[#2D4A3E]/50 font-medium uppercase tracking-wider">
            Current Plan
          </p>
          <p className="text-lg font-bold text-[#2D4A3E]">
            {currentPlan.name} · {credits} credits remaining
          </p>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isActive = plan.key === tier;
          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border p-5 ${
                isActive
                  ? "border-[#2D4A3E] bg-[#2D4A3E]/5 ring-1 ring-[#2D4A3E]"
                  : "border-[#2D4A3E]/10 bg-white"
              }`}
            >
              {isActive && (
                <span className="absolute top-3 right-3 text-xs font-semibold bg-[#2D4A3E] text-[#E8FF8B] px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#2D4A3E]">{plan.icon}</span>
                <span className="font-bold text-[#2D4A3E]">{plan.name}</span>
              </div>
              <p className="text-2xl font-bold text-[#2D4A3E] mb-0.5">
                {plan.price}
                {plan.period && (
                  <span className="text-sm font-normal text-[#2D4A3E]/50">
                    {" "}
                    {plan.period}
                  </span>
                )}
              </p>
              <p className="text-xs text-[#2D4A3E]/50 mb-4">
                {plan.credits.toLocaleString()} credits
              </p>
              <ul className="space-y-1.5 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#2D4A3E]/70">
                    <Check className="w-3.5 h-3.5 mt-0.5 text-[#2D4A3E] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.cta && !isActive ? (
                <a
                  href={plan.cta}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center px-4 py-2 bg-[#2D4A3E] text-[#E8FF8B] text-sm font-semibold rounded-xl hover:bg-[#1e3329] transition-colors"
                >
                  {plan.ctaLabel}
                </a>
              ) : isActive ? (
                <span className="block text-center px-4 py-2 border border-[#2D4A3E]/20 text-[#2D4A3E]/40 text-sm rounded-xl">
                  Current plan
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
