"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eye, Move, Camera, Sun, Wand2, Sparkles } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: Eye,
    title: "Eye Contact",
    description: "Natural, engaging eye contact that connects with your audience instantly.",
    gradient: "from-violet-500 to-purple-600",
    glowColor: "violet",
  },
  {
    icon: Move,
    title: "Posture",
    description: "Confident body language with shoulders back and perfect positioning.",
    gradient: "from-cyan-400 to-blue-500",
    glowColor: "cyan",
  },
  {
    icon: Camera,
    title: "Angle",
    description: "Find the most flattering perspective for your unique features.",
    gradient: "from-fuchsia-500 to-pink-600",
    glowColor: "fuchsia",
  },
  {
    icon: Sun,
    title: "Lighting",
    description: "Soft, professional lighting that highlights your best qualities.",
    gradient: "from-amber-400 to-orange-500",
    glowColor: "amber",
  },
  {
    icon: Wand2,
    title: "Auto Enhance",
    description: "AI automatically detects and fixes multiple issues at once.",
    gradient: "from-emerald-400 to-teal-500",
    glowColor: "emerald",
  },
  {
    icon: Sparkles,
    title: "5 Variations",
    description: "Get 5 unique options to choose from with every generation.",
    gradient: "from-rose-400 to-red-500",
    glowColor: "rose",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".feature-card");
    
    gsap.from(cards, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-white/70">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-white">Everything you need to</span>
            <br />
            <span className="text-gradient-primary">perfect your photos</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Select one or more enhancements. Our AI handles the rest, 
            delivering stunning results in seconds.
          </p>
        </div>

        {/* Feature cards */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="feature-card group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gradient-primary transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-white/50 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Corner accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-[0.03] rounded-full -translate-y-16 translate-x-16 group-hover:opacity-[0.08] transition-opacity duration-500`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
