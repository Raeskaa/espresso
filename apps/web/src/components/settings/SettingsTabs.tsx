"use client";

import { useState } from "react";
import { User, Zap, Crown } from "lucide-react";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "credits", label: "Credits", icon: Zap },
  { key: "subscription", label: "Subscription", icon: Crown },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function SettingsTabs({
  children,
}: {
  children: React.ReactNode[];
}) {
  const [active, setActive] = useState<Tab>("profile");
  const index = TABS.findIndex((t) => t.key === active);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-[#2D4A3E]/5 rounded-xl mb-6 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-[#2D4A3E] shadow-sm"
                  : "text-[#2D4A3E]/50 hover:text-[#2D4A3E]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div>{children[index]}</div>
    </div>
  );
}
