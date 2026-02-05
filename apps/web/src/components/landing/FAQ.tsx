"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does Espresso work?",
    answer: "Upload any photo, select what you want to fix (eye contact, posture, angle, or lighting), and our AI generates 5 enhanced variations. Pick your favorite and download it instantly.",
  },
  {
    question: "Will it look like me?",
    answer: "Yes! Our AI is specifically designed to preserve your identity while making subtle improvements. We prioritize natural-looking results that still look authentically you.",
  },
  {
    question: "What photos work best?",
    answer: "Clear photos where your face is visible work best. Avoid heavily filtered images, extreme angles, or photos with multiple people. Both portrait and headshot orientations work well.",
  },
  {
    question: "How long does it take?",
    answer: "Most generations complete in 15-30 seconds. You'll get 5 variations to choose from, each with a slightly different style.",
  },
  {
    question: "Can I use the photos commercially?",
    answer: "Yes! You own full rights to any photos you generate. Use them for LinkedIn, dating profiles, company websites, or anywhere else.",
  },
  {
    question: "What if I'm not happy with the results?",
    answer: "Each generation gives you 5 variations. If none work, you can try again with different settings. We also offer refunds for unused credits within 30 days.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto divide-y divide-gray-100">
      {FAQ_ITEMS.map((item, index) => (
        <div key={index} className="py-4">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="font-medium">{item.question}</span>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {openIndex === index && (
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
