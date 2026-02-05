"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    gsap.from(contentRef.current.children, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
    });
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 px-6 dark overflow-hidden"
    >
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 animate-gradient" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise" />
      
      {/* Floating orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 right-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl animate-pulse-glow" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full" />
      <div className="absolute top-1/2 left-5 w-2 h-24 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
      <div className="absolute top-1/4 right-10 w-2 h-16 bg-gradient-to-b from-transparent to-white/20 rounded-full" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center" ref={contentRef}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-8">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-white/90">Start transforming today</span>
        </div>
        
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Ready to transform
          <br />
          your photos?
        </h2>
        
        {/* Subhead */}
        <p className="text-xl text-white/80 mb-12 max-w-xl mx-auto leading-relaxed">
          Start with 3 free generations. No credit card required.
          <br className="hidden sm:block" />
          See the difference AI can make.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button 
              size="lg" 
              className="min-w-[220px] h-14 text-base font-medium bg-white text-violet-700 hover:bg-white/90 shadow-xl shadow-black/20 transition-all duration-300 hover:scale-[1.02]"
            >
              Get started free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="#pricing">
            <Button 
              size="lg" 
              variant="outline"
              className="min-w-[220px] h-14 text-base font-medium bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
            >
              View pricing
            </Button>
          </Link>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>3 free generations</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
