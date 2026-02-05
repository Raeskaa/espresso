"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    gsap.from(navRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  }, []);

  return (
    <>
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "py-3 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.05]" 
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Espresso</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/70 hover:text-white hover:bg-white/5"
              >
                Log in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/25"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu content */}
        <div 
          className={`absolute top-20 left-6 right-6 p-6 rounded-2xl bg-[#0f0f18] border border-white/10 transition-all duration-300 ${
            isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 mb-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-lg text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          
          <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
            <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
              <Button 
                variant="outline" 
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Log in
              </Button>
            </Link>
            <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
              <Button 
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
