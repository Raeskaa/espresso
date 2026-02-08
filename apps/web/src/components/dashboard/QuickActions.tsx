"use client";

import Link from "next/link";
import { Sparkles, Heart, ArrowRight } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Quick Fix",
      description: "Fix one photo instantly",
      icon: <Sparkles className="w-6 h-6" />,
      href: "/generate",
      color: "from-[#2D4A3E] to-[#1f352d]",
      textColor: "text-white",
    },
    {
      title: "Dating Studio",
      description: "Create your perfect dating profile",
      icon: <Heart className="w-6 h-6" />,
      href: "/dating-studio",
      color: "from-[#FFE066] to-[#ffd633]",
      textColor: "text-[#2D4A3E]",
      badge: "NEW",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <div 
            className={`
              relative p-6 rounded-2xl bg-gradient-to-br ${action.color} 
              hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden group
            `}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
            </div>
            
            {action.badge && (
              <span className="absolute top-4 right-4 px-2 py-1 text-[10px] font-bold bg-white text-[#2D4A3E] rounded-full">
                {action.badge}
              </span>
            )}
            
            <div className={`relative ${action.textColor}`}>
              <div className="mb-4 p-3 rounded-xl bg-white/20 inline-block">
                {action.icon}
              </div>
              
              <h3 className="text-lg font-bold mb-1">{action.title}</h3>
              <p className="text-sm opacity-80 mb-4">{action.description}</p>
              
              <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                Get started
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
