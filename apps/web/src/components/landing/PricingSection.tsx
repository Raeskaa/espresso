"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out",
    price: "$0",
    period: "",
    icon: Sparkles,
    gradient: "from-slate-500 to-slate-600",
    features: [
      "3 generations",
      "5 variations each",
      "All enhancement options",
      "Standard quality",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Starter",
    description: "Most popular choice",
    price: "$9.99",
    period: "one-time",
    icon: Zap,
    gradient: "from-violet-500 to-fuchsia-600",
    features: [
      "50 generations",
      "5 variations each",
      "All enhancement options",
      "High quality exports",
      "Priority processing",
      "Never expires",
    ],
    buttonText: "Buy Starter",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Pro",
    description: "For power users",
    price: "$12.99",
    period: "/month",
    icon: Crown,
    gradient: "from-amber-400 to-orange-500",
    features: [
      "200 generations/mo",
      "5 variations each",
      "All enhancement options",
      "Ultra quality exports",
      "Priority processing",
      "Rollover up to 100",
      "Early access features",
    ],
    buttonText: "Subscribe",
    buttonVariant: "outline" as const,
    popular: false,
  },
];

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".pricing-card");
    
    gsap.from(cards, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
      },
      y: 60,
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.5)",
    });
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 px-6 dark overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Gradient accents */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm mb-6">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-white/70">Simple Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-white">Start free,</span>{" "}
            <span className="text-gradient-warm">upgrade anytime</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            No subscriptions required. Pay only for what you use.
          </p>
        </div>

        {/* Pricing cards */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`pricing-card relative p-8 rounded-2xl transition-all duration-500 ${
                plan.popular 
                  ? "bg-gradient-to-b from-violet-500/20 to-fuchsia-500/10 border-2 border-violet-500/30 scale-105 z-10" 
                  : "bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1]"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium shadow-lg shadow-violet-500/25">
                    Most Popular
                  </div>
                </div>
              )}
              
              {/* Plan icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6`}>
                <plan.icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Plan info */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm">{plan.description}</p>
              </div>
              
              {/* Price */}
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                {plan.period && (
                  <span className="text-white/40 ml-2">{plan.period}</span>
                )}
              </div>
              
              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-white/70">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <Link href="/sign-up" className="block">
                <Button 
                  className={`w-full h-12 text-base font-medium transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <p className="text-center text-white/40 mt-12">
          Need more? Get a 25-credit pack for <span className="text-white/60">$4.99</span> anytime.
        </p>
      </div>
    </section>
  );
}
