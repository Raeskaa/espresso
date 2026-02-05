"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Upload, Sliders, Download, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your photo",
    description: "Drop in any photo you want to enhance. We support all common formats including JPG, PNG, and WebP.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    number: "02",
    icon: Sliders,
    title: "Select enhancements",
    description: "Choose what to improve — eye contact, posture, angle, or lighting. Or let AI decide for you.",
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    number: "03",
    icon: Download,
    title: "Get 5 variations",
    description: "In seconds, receive 5 unique enhanced versions. Pick your favorite and download in high resolution.",
    gradient: "from-cyan-400 to-blue-500",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !stepsRef.current) return;

    const stepItems = stepsRef.current.querySelectorAll(".step-item");
    
    // Animate steps
    gsap.from(stepItems, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
      },
      x: -60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
    });

    // Animate connecting line
    if (lineRef.current) {
      gsap.from(lineRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.5,
        ease: "power2.out",
        delay: 0.3,
      });
    }
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 px-6 dark overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f]" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm mb-6">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span className="text-white/70">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-white">How it</span>{" "}
            <span className="text-gradient-secondary">works</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Three simple steps to transform your photos into professional-quality images.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-3xl mx-auto">
          {/* Connecting line */}
          <div 
            ref={lineRef}
            className="absolute left-8 md:left-10 top-16 bottom-16 w-px bg-gradient-to-b from-violet-500 via-fuchsia-500 to-cyan-500 hidden md:block"
          />
          
          <div ref={stepsRef} className="space-y-12 md:space-y-16">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="step-item relative flex gap-8 md:gap-12 items-start"
              >
                {/* Step number/icon */}
                <div className="relative flex-shrink-0">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg shadow-violet-500/20`}>
                    <step.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0a0a0f] border-2 border-white/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-white/70">{step.number}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="pt-2">
                  <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-lg leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
