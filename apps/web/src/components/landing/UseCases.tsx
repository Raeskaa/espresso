"use client";

import { Briefcase, Heart, Users, Share2 } from "lucide-react";

interface UseCase {
  id: string;
  icon: typeof Briefcase;
  title: string;
  description: string;
  examples: string[];
}

const USE_CASES: UseCase[] = [
  {
    id: "linkedin",
    icon: Briefcase,
    title: "LinkedIn & Professional",
    description: "Look confident and approachable in your professional profile.",
    examples: ["Headshots", "About page photos", "Speaker bios"],
  },
  {
    id: "dating",
    icon: Heart,
    title: "Dating Apps",
    description: "Show your best self with natural-looking enhancements.",
    examples: ["Profile pictures", "Full body shots", "Candid moments"],
  },
  {
    id: "team",
    icon: Users,
    title: "Team Photos",
    description: "Create consistent, professional team pages.",
    examples: ["Company pages", "Team directories", "Press kits"],
  },
  {
    id: "social",
    icon: Share2,
    title: "Social Media",
    description: "Stand out on Instagram, Twitter, and more.",
    examples: ["Profile photos", "Stories", "Content creation"],
  },
];

export function UseCases() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {USE_CASES.map((useCase) => {
        const Icon = useCase.icon;
        return (
          <div 
            key={useCase.id}
            className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <Icon className="w-8 h-8 text-black mb-4" />
            <h3 className="font-medium mb-2">{useCase.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{useCase.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {useCase.examples.map((example) => (
                <span 
                  key={example}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
