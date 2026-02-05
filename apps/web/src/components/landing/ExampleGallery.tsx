"use client";

import { useState } from "react";
import { BeforeAfter } from "./BeforeAfter";

interface Example {
  id: string;
  title: string;
  fix: string;
  beforeImage: string;
  afterImage: string;
}

// Placeholder examples - replace with real images later
const EXAMPLES: Example[] = [
  {
    id: "1",
    title: "Professional headshot",
    fix: "Eye contact + Posture",
    beforeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    afterImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
  },
  {
    id: "2",
    title: "Natural portrait",
    fix: "Lighting",
    beforeImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
    afterImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face",
  },
  {
    id: "3",
    title: "Casual photo",
    fix: "Angle + Eye contact",
    beforeImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face",
    afterImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face",
  },
];

export function ExampleGallery() {
  const [activeExample, setActiveExample] = useState(EXAMPLES[0]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main before/after slider */}
      <div className="mb-8">
        <BeforeAfter
          beforeImage={activeExample.beforeImage}
          afterImage={activeExample.afterImage}
          beforeLabel="Original"
          afterLabel="Enhanced"
        />
      </div>

      {/* Example selector */}
      <div className="flex justify-center gap-4">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            onClick={() => setActiveExample(example)}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${activeExample.id === example.id 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="text-sm font-medium mb-1">{example.title}</div>
            <div className="text-xs text-gray-500">{example.fix}</div>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        Drag the slider to compare
      </p>
    </div>
  );
}
