"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const testimonials = [
  {
    id: "1",
    quote: "This completely changed my LinkedIn game. The eye contact fix is pure magic — I finally have a professional photo I'm proud of.",
    author: "Sarah Chen",
    role: "Product Manager at Stripe",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: "2",
    quote: "Used it for my dating profile and got way more matches. The subtle posture and lighting improvements made a huge difference.",
    author: "Marcus Johnson",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: "3",
    quote: "Our entire team's headshots look incredibly professional now. HR couldn't believe the transformation. Worth every penny.",
    author: "Emily Rodriguez",
    role: "People Operations at Notion",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: "4",
    quote: "As a content creator, having great photos is essential. Espresso saves me hours of editing and the results are consistently amazing.",
    author: "Alex Kim",
    role: "Content Creator",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: "5",
    quote: "The 5 variations feature is genius. I always find at least 2-3 options I love. It's like having a professional photographer on demand.",
    author: "Jessica Liu",
    role: "Founder at TechStart",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: "6",
    quote: "Finally, a tool that actually delivers on its promises. The AI understands exactly what makes a photo look professional.",
    author: "David Park",
    role: "Photographer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".testimonial-card");
    
    gsap.from(cards, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f]" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Gradient accents */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm mb-6">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-white/70">Loved by thousands</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-white">What our</span>{" "}
            <span className="text-gradient-primary">users say</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Join 10,000+ happy users who've transformed their photos with Espresso.
          </p>
        </div>

        {/* Testimonials grid */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="testimonial-card relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 group"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-8 h-8 text-violet-400" />
              </div>
              
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-white/70 leading-relaxed mb-8 line-clamp-4">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                />
                <div>
                  <div className="font-medium text-white">{testimonial.author}</div>
                  <div className="text-sm text-white/40">{testimonial.role}</div>
                </div>
              </div>
              
              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
