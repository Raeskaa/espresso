"use client";

import { Sparkles, TrendingUp, CreditCard, Clock } from "lucide-react";

interface StatsCardsProps {
  totalGenerations: number;
  thisWeek: number;
  credits: number;
  avgTime?: string;
}

export function StatsCards({ 
  totalGenerations, 
  thisWeek, 
  credits,
  avgTime = "<30s" 
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Generations",
      value: totalGenerations.toString(),
      icon: <Sparkles className="w-5 h-5" />,
      color: "bg-[#C4E86B]/20 text-[#2D4A3E]",
    },
    {
      label: "This Week",
      value: thisWeek.toString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-[#7EA3DC]/20 text-[#2D4A3E]",
      trend: thisWeek > 0 ? "+12%" : undefined,
    },
    {
      label: "Credits Left",
      value: credits.toString(),
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-[#FFE066]/20 text-[#2D4A3E]",
    },
    {
      label: "Avg. Time",
      value: avgTime,
      icon: <Clock className="w-5 h-5" />,
      color: "bg-[#2D4A3E]/10 text-[#2D4A3E]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-5 rounded-2xl bg-white border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/20 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            {stat.trend && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-[#2D4A3E]">{stat.value}</p>
            <p className="text-sm text-[#2D4A3E]/50">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
