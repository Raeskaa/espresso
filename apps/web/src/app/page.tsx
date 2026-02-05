"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { ArtisticHero } from "@/components/artistic";
import { 
  Eye, 
  Move, 
  Sun, 
  ArrowRight, 
  Check,
  Camera,
  Sparkles,
  Star
} from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  // GSAP scroll animations
  useEffect(() => {
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

    // Parallax decorations
    gsap.utils.toArray<HTMLElement>(".parallax-slow").forEach((el) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        y: -50,
      });
    });

    gsap.utils.toArray<HTMLElement>(".parallax-fast").forEach((el) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        y: -100,
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#7EA3DC]/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F8B4C4] via-[#FFE066] to-[#C4E86B] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#2D4A3E]">Espresso</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-[#2D4A3E]/70 hover:text-[#2D4A3E] transition-colors">Features</a>
            <a href="#how-it-works" className="text-[#2D4A3E]/70 hover:text-[#2D4A3E] transition-colors">How it works</a>
            <a href="#pricing" className="text-[#2D4A3E]/70 hover:text-[#2D4A3E] transition-colors">Pricing</a>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-[#2D4A3E]">Log in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-[#2D4A3E] hover:bg-[#1f352d] text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <ArtisticHero />

      {/* Social Proof Bar */}
      <section className="py-12 px-6 bg-white border-b border-[#7EA3DC]/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl font-bold text-[#2D4A3E]">50K+</div>
              <div className="text-sm text-[#2D4A3E]/60">Photos Enhanced</div>
            </div>
            <div className="w-px h-10 bg-[#7EA3DC]/20 hidden md:block" />
            <div>
              <div className="text-3xl font-bold text-[#2D4A3E]">4.9</div>
              <div className="text-sm text-[#2D4A3E]/60 flex items-center gap-1 justify-center">
                <Star className="w-3 h-3 fill-[#FFE066] text-[#FFE066]" />
                Rating
              </div>
            </div>
            <div className="w-px h-10 bg-[#7EA3DC]/20 hidden md:block" />
            <div>
              <div className="text-3xl font-bold text-[#2D4A3E]">10K+</div>
              <div className="text-sm text-[#2D4A3E]/60">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="parallax-slow absolute top-20 right-10 w-32 h-32 opacity-40">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="#F8B4C4" opacity="0.5" />
          </svg>
        </div>
        <div className="parallax-fast absolute bottom-40 left-5 w-24 h-24 opacity-30">
          <svg viewBox="0 0 100 100">
            {[...Array(8)].map((_, i) => (
              <rect key={i} x="47" y="20" width="6" height="25" rx="3" fill="#C4E86B" transform={`rotate(${i * 45} 50 50)`} />
            ))}
          </svg>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F8B4C4]/20 text-[#2D4A3E] text-sm font-medium mb-4">
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2D4A3E] mb-4">
              What you can fix
            </h2>
            <p className="text-lg text-[#2D4A3E]/60 max-w-xl mx-auto">
              Select one or more enhancements. Get 5 beautiful variations every time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="feature-card group p-6 rounded-2xl bg-white border border-[#7EA3DC]/20 hover:border-[#F8B4C4]/50 hover:shadow-lg hover:shadow-[#F8B4C4]/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F8B4C4] to-[#F8B4C4]/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-[#2D4A3E] mb-2">Eye Contact</h3>
              <p className="text-sm text-[#2D4A3E]/60">
                Look directly at the camera with natural, engaging eye contact.
              </p>
            </div>
            
            <div className="feature-card group p-6 rounded-2xl bg-white border border-[#7EA3DC]/20 hover:border-[#C4E86B]/50 hover:shadow-lg hover:shadow-[#C4E86B]/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C4E86B] to-[#C4E86B]/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Move className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-[#2D4A3E] mb-2">Posture</h3>
              <p className="text-sm text-[#2D4A3E]/60">
                Stand tall and confident with shoulders back and chin up.
              </p>
            </div>
            
            <div className="feature-card group p-6 rounded-2xl bg-white border border-[#7EA3DC]/20 hover:border-[#7B8FD4]/50 hover:shadow-lg hover:shadow-[#7B8FD4]/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7B8FD4] to-[#7B8FD4]/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-[#2D4A3E] mb-2">Angle</h3>
              <p className="text-sm text-[#2D4A3E]/60">
                Find the most flattering perspective for your face and body.
              </p>
            </div>
            
            <div className="feature-card group p-6 rounded-2xl bg-white border border-[#7EA3DC]/20 hover:border-[#FFE066]/50 hover:shadow-lg hover:shadow-[#FFE066]/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFE066] to-[#FFE066]/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sun className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-[#2D4A3E] mb-2">Lighting</h3>
              <p className="text-sm text-[#2D4A3E]/60">
                Soft, natural light that flatters your features beautifully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="py-24 px-6 bg-gradient-to-b from-[#7EA3DC]/10 to-transparent relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#7B8FD4]/20 text-[#2D4A3E] text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2D4A3E] mb-4">
              How it works
            </h2>
            <p className="text-lg text-[#2D4A3E]/60">
              Three simple steps to perfect photos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="step-item text-center relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F8B4C4] to-[#FFE066] text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-[#F8B4C4]/30">
                1
              </div>
              <h3 className="font-semibold text-[#2D4A3E] text-lg mb-2">Upload</h3>
              <p className="text-[#2D4A3E]/60">
                Drop in any photo you want to enhance. We support all common formats.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#F8B4C4] to-[#C4E86B]" />
            </div>
            
            <div className="step-item text-center relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C4E86B] to-[#7B8FD4] text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-[#C4E86B]/30">
                2
              </div>
              <h3 className="font-semibold text-[#2D4A3E] text-lg mb-2">Select fixes</h3>
              <p className="text-[#2D4A3E]/60">
                Choose what to improve. Our AI analyzes your photo automatically.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#C4E86B] to-[#7B8FD4]" />
            </div>
            
            <div className="step-item text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7B8FD4] to-[#F8B4C4] text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-[#7B8FD4]/30">
                3
              </div>
              <h3 className="font-semibold text-[#2D4A3E] text-lg mb-2">Download</h3>
              <p className="text-[#2D4A3E]/60">
                Get 5 unique variations instantly. Pick your favorite and download.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFE066]/30 text-[#2D4A3E] text-sm font-medium mb-4">
              Simple Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2D4A3E] mb-4">
              Start free, upgrade anytime
            </h2>
            <p className="text-lg text-[#2D4A3E]/60">
              No subscriptions required. Pay only for what you use.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="pricing-card p-8 rounded-2xl bg-white border border-[#7EA3DC]/20 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="font-semibold text-[#2D4A3E] mb-1">Free</h3>
                <div className="text-4xl font-bold text-[#2D4A3E]">$0</div>
                <p className="text-sm text-[#2D4A3E]/50 mt-1">Get started instantly</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-3 text-[#2D4A3E]/80">
                  <div className="w-5 h-5 rounded-full bg-[#C4E86B]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  3 generations
                </li>
                <li className="flex items-center gap-3 text-[#2D4A3E]/80">
                  <div className="w-5 h-5 rounded-full bg-[#C4E86B]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  5 variations each
                </li>
                <li className="flex items-center gap-3 text-[#2D4A3E]/80">
                  <div className="w-5 h-5 rounded-full bg-[#C4E86B]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  All fix options
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full border-[#2D4A3E]/20 text-[#2D4A3E] hover:bg-[#2D4A3E]/5">
                  Get Started
                </Button>
              </Link>
            </div>
            
            {/* Starter Tier - Popular */}
            <div className="pricing-card p-8 rounded-2xl bg-gradient-to-b from-[#2D4A3E] to-[#1f352d] text-white relative overflow-hidden shadow-2xl shadow-[#2D4A3E]/30 scale-105">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#FFE066] text-[#2D4A3E] text-xs font-semibold">
                Most Popular
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-1">Starter</h3>
                <div className="text-4xl font-bold">$9.99</div>
                <p className="text-sm text-white/60 mt-1">one-time payment</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full bg-[#FFE066] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  50 generations
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full bg-[#FFE066] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  Never expires
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full bg-[#FFE066] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  Priority support
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button className="w-full bg-white text-[#2D4A3E] hover:bg-white/90">
                  Buy Starter
                </Button>
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="pricing-card p-8 rounded-2xl bg-white border border-[#7EA3DC]/20 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="font-semibold text-[#2D4A3E] mb-1">Pro</h3>
                <div className="text-4xl font-bold text-[#2D4A3E]">$12.99</div>
                <p className="text-sm text-[#2D4A3E]/50 mt-1">/month</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-3 text-[#2D4A3E]/80">
                  <div className="w-5 h-5 rounded-full bg-[#7B8FD4]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  200 generations/mo
                </li>
                <li className="flex items-center gap-3 text-[#2D4A3E]/80">
                  <div className="w-5 h-5 rounded-full bg-[#7B8FD4]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  Rollover up to 100
                </li>
                <li className="flex items-center gap-3 text-[#2D4A3E]/80">
                  <div className="w-5 h-5 rounded-full bg-[#7B8FD4]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2D4A3E]" />
                  </div>
                  Early access features
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full border-[#2D4A3E]/20 text-[#2D4A3E] hover:bg-[#2D4A3E]/5">
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
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7EA3DC] via-[#7B8FD4] to-[#F8B4C4]" />
        
        {/* Decorative flowers */}
        <div className="absolute top-10 left-10 w-20 h-20 opacity-30">
          <svg viewBox="0 0 100 100">
            <ellipse cx="50" cy="20" rx="12" ry="25" fill="white" />
            <ellipse cx="75" cy="45" rx="12" ry="25" fill="white" transform="rotate(72 50 50)" />
            <ellipse cx="65" cy="80" rx="12" ry="25" fill="white" transform="rotate(144 50 50)" />
            <ellipse cx="35" cy="80" rx="12" ry="25" fill="white" transform="rotate(216 50 50)" />
            <ellipse cx="25" cy="45" rx="12" ry="25" fill="white" transform="rotate(288 50 50)" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-10 w-24 h-24 opacity-25">
          <svg viewBox="0 0 100 100">
            {[...Array(10)].map((_, i) => (
              <rect key={i} x="47" y="15" width="6" height="30" rx="3" fill="white" transform={`rotate(${i * 36} 50 50)`} />
            ))}
          </svg>
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Ready to transform your photos?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Start with 3 free generations. No credit card required.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-[#2D4A3E] hover:bg-white/90 h-14 px-8 text-lg shadow-xl shadow-black/20">
              Get started free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#2D4A3E] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F8B4C4] via-[#FFE066] to-[#C4E86B] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Espresso</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-white/60">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <span>&copy; {new Date().getFullYear()} Espresso</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
