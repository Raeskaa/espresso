"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/HeroSection";
import { 
  Eye, 
  Move, 
  Sun, 
  ArrowRight, 
  Check,
  Camera,
  Star,
  Zap,
  Shield,
  Clock
} from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // GSAP scroll animations
  useEffect(() => {
    // Stats animation
    if (statsRef.current) {
      const items = statsRef.current.querySelectorAll(".stat-item");
      gsap.from(items, {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }

    // Features section animation
    if (featuresRef.current) {
      const cards = featuresRef.current.querySelectorAll(".feature-card");
      gsap.from(cards, {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    }

    // How it works animation
    if (howItWorksRef.current) {
      const steps = howItWorksRef.current.querySelectorAll(".step-item");
      gsap.from(steps, {
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
      });
    }

    // Pricing cards animation
    if (pricingRef.current) {
      const cards = pricingRef.current.querySelectorAll(".pricing-card");
      gsap.from(cards, {
        scrollTrigger: {
          trigger: pricingRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.7,
        stagger: 0.12,
        ease: "back.out(1.5)",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Hero Section */}
      <HeroSection />

      {/* Social Proof / Stats Bar */}
      <section ref={statsRef} className="py-12 sm:py-16 px-4 sm:px-6 bg-white border-b border-[#2D4A3E]/5 halftone-texture">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            <div className="stat-item text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-[#2D4A3E]" />
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D4A3E]">50K+</span>
              </div>
              <p className="text-xs sm:text-sm text-[#2D4A3E]/60">Photos Enhanced</p>
            </div>
            <div className="stat-item text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-4 sm:w-5 h-4 sm:h-5 text-[#2D4A3E]" />
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D4A3E]">4.9</span>
              </div>
              <p className="text-xs sm:text-sm text-[#2D4A3E]/60">User Rating</p>
            </div>
            <div className="stat-item text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-[#2D4A3E]" />
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D4A3E]">10K+</span>
              </div>
              <p className="text-xs sm:text-sm text-[#2D4A3E]/60">Happy Users</p>
            </div>
            <div className="stat-item text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-[#2D4A3E]" />
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D4A3E]">&lt;30s</span>
              </div>
              <p className="text-xs sm:text-sm text-[#2D4A3E]/60">Average Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FFFEF5] relative overflow-hidden halftone-texture">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-[#2D4A3E] text-white text-sm font-medium mb-4 sm:mb-6">
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2D4A3E] mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Everything you need to
              <br />
              <span className="text-[#2D4A3E]/60">perfect your photos</span>
            </h2>
            <p className="text-base sm:text-lg text-[#2D4A3E]/60 max-w-xl mx-auto px-4 sm:px-0">
              Select one or more enhancements. Get 5 beautiful variations every time.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="feature-card group p-6 sm:p-8 rounded-2xl bg-white border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/20 hover:shadow-xl hover:shadow-[#2D4A3E]/5 transition-all duration-300">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-[#2D4A3E] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Eye className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#2D4A3E] text-base sm:text-lg mb-2 sm:mb-3">Eye Contact</h3>
              <p className="text-[#2D4A3E]/60 leading-relaxed text-sm sm:text-base">
                Look directly at the camera with natural, engaging eye contact.
              </p>
            </div>
            
            <div className="feature-card group p-6 sm:p-8 rounded-2xl bg-white border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/20 hover:shadow-xl hover:shadow-[#2D4A3E]/5 transition-all duration-300">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-[#2D4A3E] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Move className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#2D4A3E] text-base sm:text-lg mb-2 sm:mb-3">Posture</h3>
              <p className="text-[#2D4A3E]/60 leading-relaxed text-sm sm:text-base">
                Stand tall and confident with shoulders back and chin up.
              </p>
            </div>
            
            <div className="feature-card group p-6 sm:p-8 rounded-2xl bg-white border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/20 hover:shadow-xl hover:shadow-[#2D4A3E]/5 transition-all duration-300">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-[#2D4A3E] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#2D4A3E] text-base sm:text-lg mb-2 sm:mb-3">Angle</h3>
              <p className="text-[#2D4A3E]/60 leading-relaxed text-sm sm:text-base">
                Find the most flattering perspective for your face and body.
              </p>
            </div>
            
            <div className="feature-card group p-6 sm:p-8 rounded-2xl bg-white border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/20 hover:shadow-xl hover:shadow-[#2D4A3E]/5 transition-all duration-300">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-[#2D4A3E] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Sun className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#2D4A3E] text-base sm:text-lg mb-2 sm:mb-3">Lighting</h3>
              <p className="text-[#2D4A3E]/60 leading-relaxed text-sm sm:text-base">
                Soft, natural light that flatters your features beautifully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-[#2D4A3E] relative overflow-hidden halftone-texture halftone-texture-dark">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-white/5 blur-3xl" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-4 sm:mb-6">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              How it works
            </h2>
            <p className="text-base sm:text-lg text-white/60">
              Three simple steps to perfect photos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="step-item text-center relative">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white text-[#2D4A3E] flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">
                1
              </div>
              <h3 className="font-bold text-white text-lg sm:text-xl mb-3">Upload</h3>
              <p className="text-white/60 leading-relaxed text-sm sm:text-base">
                Drop in any photo you want to enhance. We support all common formats.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-white/20" />
            </div>
            
            <div className="step-item text-center relative">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white text-[#2D4A3E] flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">
                2
              </div>
              <h3 className="font-bold text-white text-lg sm:text-xl mb-3">Select fixes</h3>
              <p className="text-white/60 leading-relaxed text-sm sm:text-base">
                Choose what to improve. Our AI analyzes your photo automatically.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-white/20" />
            </div>
            
            <div className="step-item text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white text-[#2D4A3E] flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">
                3
              </div>
              <h3 className="font-bold text-white text-lg sm:text-xl mb-3">Download</h3>
              <p className="text-white/60 leading-relaxed text-sm sm:text-base">
                Get 5 unique variations instantly. Pick your favorite and download.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FFFEF5] relative overflow-hidden halftone-texture">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-[#FFE066]/30 text-[#2D4A3E] text-sm font-medium mb-4 sm:mb-6">
              Simple Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2D4A3E] mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Start free, upgrade anytime
            </h2>
            <p className="text-base sm:text-lg text-[#2D4A3E]/60">
              No subscriptions required. Pay only for what you use.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="pricing-card p-6 sm:p-8 rounded-2xl bg-white border border-[#7EA3DC]/20 hover:shadow-xl transition-shadow">
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-[#2D4A3E] mb-1">Free</h3>
                <div className="text-3xl sm:text-4xl font-bold text-[#2D4A3E]">$0</div>
                <p className="text-xs sm:text-sm text-[#2D4A3E]/50 mt-1">Get started instantly</p>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-xs sm:text-sm">
                <li className="flex items-center gap-2 sm:gap-3 text-[#2D4A3E]/80">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#C4E86B]/30 flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  3 generations
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-[#2D4A3E]/80">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#C4E86B]/30 flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  5 variations each
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-[#2D4A3E]/80">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#C4E86B]/30 flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  All fix options
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full border-[#2D4A3E]/20 text-[#2D4A3E] hover:bg-[#2D4A3E]/5 text-sm sm:text-base">
                  Get Started
                </Button>
              </Link>
            </div>
            
            {/* Starter Tier - Popular */}
            <div className="pricing-card p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#2D4A3E] to-[#1f352d] text-white relative overflow-hidden shadow-2xl shadow-[#2D4A3E]/30 sm:scale-105 order-first sm:order-none">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-3 py-1 rounded-full bg-[#FFE066] text-[#2D4A3E] text-[10px] sm:text-xs font-semibold">
                Most Popular
              </div>
              
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold mb-1">Starter</h3>
                <div className="text-3xl sm:text-4xl font-bold">$9.99</div>
                <p className="text-xs sm:text-sm text-white/60 mt-1">one-time payment</p>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-xs sm:text-sm">
                <li className="flex items-center gap-2 sm:gap-3 text-white/90">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#FFE066] flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  50 generations
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-white/90">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#FFE066] flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  Never expires
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-white/90">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#FFE066] flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  Priority support
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button className="w-full bg-white text-[#2D4A3E] hover:bg-white/90 text-sm sm:text-base">
                  Buy Starter
                </Button>
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="pricing-card p-6 sm:p-8 rounded-2xl bg-white border border-[#7EA3DC]/20 hover:shadow-xl transition-shadow">
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-[#2D4A3E] mb-1">Pro</h3>
                <div className="text-3xl sm:text-4xl font-bold text-[#2D4A3E]">$12.99</div>
                <p className="text-xs sm:text-sm text-[#2D4A3E]/50 mt-1">/month</p>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-xs sm:text-sm">
                <li className="flex items-center gap-2 sm:gap-3 text-[#2D4A3E]/80">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#7B8FD4]/30 flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  200 generations/mo
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-[#2D4A3E]/80">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#7B8FD4]/30 flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  Rollover up to 100
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-[#2D4A3E]/80">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-[#7B8FD4]/30 flex items-center justify-center">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#2D4A3E]" />
                  </div>
                  Early access features
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full border-[#2D4A3E]/20 text-[#2D4A3E] hover:bg-[#2D4A3E]/5 text-sm sm:text-base">
                  Subscribe
                </Button>
              </Link>
            </div>
          </div>
          
          <p className="mt-10 text-center text-sm text-[#2D4A3E]/50">
            Need more? Get a 25-credit pack for $4.99 anytime.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#2D4A3E] relative overflow-hidden halftone-texture halftone-texture-dark">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6 sm:mb-8">
            <span className="text-sm font-medium text-white">Start transforming today</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to transform
            <br />
            your photos?
          </h2>
          <p className="text-lg sm:text-xl text-white/60 mb-8 sm:mb-10 max-w-xl mx-auto px-4 sm:px-0">
            Join 10,000+ users who are already creating perfect photos with AI. Start with 3 free generations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-w-[200px] h-12 sm:h-14 text-base sm:text-lg bg-white text-[#2D4A3E] hover:bg-white/90 font-bold shadow-xl shadow-black/20">
                Get started free
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-white/40 text-sm">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 bg-[#1f352d]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>ESPRESSO</span>
            </Link>
            
            <div className="flex items-center gap-6 sm:gap-8 text-sm text-white/50">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="mailto:support@espresso.app" className="hover:text-white transition-colors">Support</Link>
            </div>
            
            <p className="text-sm text-white/30">
              &copy; {new Date().getFullYear()} Espresso. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
