import Link from "next/link";
import { Check, Zap, Crown, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Espresso AI Photo Enhancement. Start free, top up when you need more.",
};

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    period: "",
    badge: null,
    credits: 100,
    costPerCredit: null,
    description: "Perfect for trying Espresso",
    features: [
      "100 welcome credits",
      "Quick Fix — 1 credit / photo",
      "Dating Studio — 5 credits / set",
      "HD downloads",
      "Photo history (30 days)",
    ],
    cta: "/sign-up",
    ctaLabel: "Get Started Free",
    ctaStyle: "outline",
  },
  {
    key: "starter",
    name: "Starter",
    price: "₹499",
    period: "one-time",
    badge: "Most Popular",
    credits: 300,
    costPerCredit: "₹1.66",
    description: "One-time top-up, never expires",
    features: [
      "300 credits added to account",
      "All Free features",
      "Priority generation queue",
      "Credits never expire",
    ],
    cta: process.env.NEXT_PUBLIC_DODOPAYMENTS_STARTER_LINK ?? "#",
    ctaLabel: "Buy with DodoPayments",
    ctaStyle: "primary",
    external: true,
  },
  {
    key: "pro",
    name: "Pro",
    price: "₹999",
    period: "/month",
    badge: null,
    credits: 1000,
    costPerCredit: "₹0.99",
    description: "For power users, refreshed monthly",
    features: [
      "1,000 credits / month",
      "All Starter features",
      "Unlimited photo history",
      "Early access to new features",
      "Priority support",
    ],
    cta: process.env.NEXT_PUBLIC_RAZORPAY_PRO_LINK ?? "#",
    ctaLabel: "Subscribe with Razorpay",
    ctaStyle: "dark",
    external: true,
  },
];

const FAQ = [
  {
    q: "What is a credit?",
    a: "One credit lets you apply one Quick Fix enhancement to a photo. Dating Studio sets cost 5 credits and generate 4 optimised profile photos.",
  },
  {
    q: "Do credits expire?",
    a: "Free and Starter credits never expire. Pro credits refresh every month.",
  },
  {
    q: "Can I try before buying?",
    a: "Yes! You get 100 free credits on sign-up — enough for 100 Quick Fix enhancements or 20 Dating Studio sets.",
  },
  {
    q: "How is the Starter payment processed?",
    a: "Starter uses DodoPayments, a fast global checkout. Your credits are added to your account automatically within seconds.",
  },
  {
    q: "How is the Pro subscription billed?",
    a: "Pro uses Razorpay and is billed monthly. Cancel any time — your credits remain until the billing cycle ends.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-[#F5F0E8]/80 backdrop-blur-md border-b border-[#2D4A3E]/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#2D4A3E]/60 hover:text-[#2D4A3E] text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <Link href="/" className="font-bold text-[#2D4A3E] text-lg ml-1">
            Espresso ☕
          </Link>
          <div className="ml-auto flex gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-[#2D4A3E]/60 hover:text-[#2D4A3E]"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold bg-[#2D4A3E] text-[#E8FF8B] px-4 py-1.5 rounded-lg hover:bg-[#1e3329] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-[#2D4A3E] mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-[#2D4A3E]/60 text-lg max-w-xl mx-auto">
            Start free. Top up when you need more. No subscriptions required.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.badge
                  ? "border-[#2D4A3E] ring-2 ring-[#2D4A3E] bg-white"
                  : "border-[#2D4A3E]/15 bg-white"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8FF8B] text-[#2D4A3E] text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              {/* Icon */}
              <div className="mb-4">
                {plan.key === "pro" ? (
                  <Crown className="w-6 h-6 text-purple-500" />
                ) : (
                  <Zap
                    className={`w-6 h-6 ${plan.key === "starter" ? "text-yellow-500" : "text-[#2D4A3E]/40"}`}
                  />
                )}
              </div>

              <h2 className="text-lg font-bold text-[#2D4A3E] mb-1">
                {plan.name}
              </h2>
              <p className="text-sm text-[#2D4A3E]/50 mb-4">
                {plan.description}
              </p>

              <div className="mb-1">
                <span className="text-3xl font-bold text-[#2D4A3E]">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-[#2D4A3E]/50 ml-1">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#2D4A3E]/40 mb-6">
                {plan.credits.toLocaleString()} credits
                {plan.costPerCredit && ` · ${plan.costPerCredit} / credit`}
              </p>

              <ul className="space-y-2 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-[#2D4A3E]/70"
                  >
                    <Check className="w-3.5 h-3.5 text-[#2D4A3E] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.external ? (
                <a
                  href={plan.cta}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.ctaStyle === "primary"
                      ? "bg-[#E8FF8B] text-[#2D4A3E] hover:bg-[#d9f070]"
                      : "bg-[#2D4A3E] text-[#E8FF8B] hover:bg-[#1e3329]"
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              ) : (
                <Link
                  href={plan.cta}
                  className="block text-center px-5 py-2.5 rounded-xl font-semibold text-sm border border-[#2D4A3E]/20 text-[#2D4A3E] hover:bg-[#2D4A3E]/5 transition-colors"
                >
                  {plan.ctaLabel}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Credit table */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-[#2D4A3E] mb-4 text-center">
            What do credits cost?
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[#2D4A3E]/10 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D4A3E]/10 bg-[#2D4A3E]/3">
                  <th className="text-left px-5 py-3 font-semibold text-[#2D4A3E]/60">
                    Feature
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-[#2D4A3E]/60">
                    Credits used
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D4A3E]/8">
                {[
                  ["Quick Fix (1 variation)", "1 credit"],
                  ["Quick Fix (3 variations)", "3 credits"],
                  ["Dating Studio (4-photo set)", "5 credits"],
                  ["AI Analysis", "Free"],
                ].map(([feature, cost]) => (
                  <tr key={feature}>
                    <td className="px-5 py-3 text-[#2D4A3E]">{feature}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#2D4A3E]">
                      {cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[#2D4A3E] mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="p-5 bg-white rounded-2xl border border-[#2D4A3E]/10"
              >
                <p className="font-semibold text-[#2D4A3E] mb-1">{q}</p>
                <p className="text-sm text-[#2D4A3E]/60">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
