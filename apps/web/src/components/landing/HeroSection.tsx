"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Play } from "lucide-react";

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline({ delay: 0.2 });

    // Animate content
    if (contentRef.current) {
      tl.from(contentRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      });
    }

    // Animate image/preview area
    if (imageRef.current) {
      tl.from(imageRef.current, {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power3.out",
      }, "-=0.5");
    }
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen bg-[#FFFEF5] overflow-hidden halftone-texture">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2D4A3E]/[0.02] via-transparent to-[#2D4A3E]/[0.03]" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#2D4A3E]/5 blur-3xl" />
      <div className="absolute top-40 right-20 w-80 h-80 rounded-full bg-[#2D4A3E]/5 blur-3xl" />
      <div className="absolute bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#2D4A3E]/5 blur-3xl" />

      {/* Navigation */}
      <nav className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D4A3E]" style={{ fontFamily: 'var(--font-display)' }}>ESPRESSO</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-medium">
          <a href="#features" className="text-[#2D4A3E]/70 hover:text-[#2D4A3E] transition-colors">Features</a>
          <a href="#how-it-works" className="text-[#2D4A3E]/70 hover:text-[#2D4A3E] transition-colors">How it works</a>
          <a href="#pricing" className="text-[#2D4A3E]/70 hover:text-[#2D4A3E] transition-colors">Pricing</a>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-[#2D4A3E] font-medium hover:bg-[#2D4A3E]/5 text-sm sm:text-base">
              Log in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-[#2D4A3E] hover:bg-[#1f352d] text-white font-medium px-4 sm:px-6 text-sm sm:text-base">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-32">
        <div ref={contentRef} className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2D4A3E]/5 border border-[#2D4A3E]/10 mb-8">
            <div className="flex items-center -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#FFE066] text-[#FFE066]" />
              ))}
            </div>
            <span className="text-sm font-medium text-[#2D4A3E]">Loved by 10,000+ users</span>
          </div>

          {/* Headline */}
          <h1 
            ref={headlineRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#2D4A3E] mb-6 sm:mb-8 leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your space for
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">perfect photos</span>
              <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-3 sm:h-4 text-[#2D4A3E]/20" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-[#2D4A3E]/60 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0">
            Fix eye contact, improve posture, adjust angles, and enhance lighting with AI. 
            Get 5 beautiful variations in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4 sm:px-0">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto min-w-[200px] sm:min-w-[220px] h-12 sm:h-14 text-base sm:text-lg bg-[#2D4A3E] hover:bg-[#1f352d] text-white font-semibold shadow-xl shadow-[#2D4A3E]/20"
              >
                Get Started Free
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto min-w-[200px] sm:min-w-[220px] h-12 sm:h-14 text-base sm:text-lg border-[#2D4A3E]/20 text-[#2D4A3E] font-semibold hover:bg-[#2D4A3E]/5"
            >
              <Play className="w-4 sm:w-5 h-4 sm:h-5 mr-2 fill-[#2D4A3E]" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <p className="text-[#2D4A3E]/50 text-sm">
            No credit card required · 3 free generations included
          </p>
        </div>

        {/* Preview/Mockup Area */}
        <div ref={imageRef} className="mt-20 max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-2xl shadow-[#2D4A3E]/10 border border-[#2D4A3E]/10">
            {/* Browser bar mockup */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F8F5] border-b border-[#2D4A3E]/10">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#2D4A3E]/20" />
                <div className="w-3 h-3 rounded-full bg-[#2D4A3E]/20" />
                <div className="w-3 h-3 rounded-full bg-[#2D4A3E]/20" />
              </div>
              <div className="flex-1 mx-8">
                <div className="max-w-md mx-auto h-7 rounded-md bg-white border border-[#2D4A3E]/10 flex items-center px-3">
                  <span className="text-xs text-[#2D4A3E]/40">espresso.app/generate</span>
                </div>
              </div>
            </div>
            
            {/* App preview content */}
            <div className="p-8 bg-gradient-to-b from-[#FFFEF5] to-white">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Before */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#2D4A3E]/10 text-[#2D4A3E] text-sm font-medium">Before</span>
                  </div>
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[#E5E5E0] to-[#D5D5D0] flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#2D4A3E]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-[#2D4A3E]/40 text-sm">Original photo</p>
                    </div>
                  </div>
                </div>
                
                {/* After */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#2D4A3E]/10 text-[#2D4A3E] text-sm font-medium">After</span>
                  </div>
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[#2D4A3E]/5 via-[#FFFEF5] to-[#2D4A3E]/10 flex items-center justify-center border-2 border-dashed border-[#2D4A3E]/20">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#2D4A3E]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-[#2D4A3E]/60 text-sm">AI enhanced</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Feature pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                {["Eye Contact", "Posture", "Lighting", "Angle"].map((feature) => (
                  <div key={feature} className="px-4 py-2 rounded-full bg-[#2D4A3E]/5 text-[#2D4A3E] text-sm font-medium border border-[#2D4A3E]/10">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
          <path
            d="M0,40 C480,60 960,20 1440,40 L1440,60 L0,60 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
