"use client";

import { ArrowUpCircle, ArrowDownCircle, Zap } from "lucide-react";

type CreditRow = {
  id: string;
  amount: number;
  reason: string;
  generationId: string | null;
  createdAt: Date;
};

interface CreditsPanelProps {
  credits: number;
  history: CreditRow[];
}

const reasonLabel: Record<string, string> = {
  generation: "Quick Fix generation",
  dating_generation: "Dating Studio generation",
  purchase: "Credit purchase",
  subscription: "Subscription grant",
  signup: "Welcome bonus",
  refund: "Refund",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function CreditsPanel({ credits, history }: CreditsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="flex items-center gap-4 p-5 bg-[#2D4A3E]/5 rounded-2xl border border-[#2D4A3E]/10">
        <div className="p-3 bg-[#2D4A3E] rounded-xl">
          <Zap className="w-6 h-6 text-[#E8FF8B]" />
        </div>
        <div>
          <p className="text-sm text-[#2D4A3E]/60 font-medium">Credit Balance</p>
          <p className="text-3xl font-bold text-[#2D4A3E]">{credits}</p>
        </div>
        <a
          href="/pricing"
          className="ml-auto px-4 py-2 bg-[#2D4A3E] text-[#E8FF8B] text-sm font-semibold rounded-xl hover:bg-[#1e3329] transition-colors"
        >
          Buy Credits
        </a>
      </div>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-[#2D4A3E]/60 uppercase tracking-wider mb-3">
          Transaction History
        </h3>

        {history.length === 0 ? (
          <div className="text-center py-12 text-[#2D4A3E]/40">
            No transactions yet. Generate your first photo to get started.
          </div>
        ) : (
          <div className="divide-y divide-[#2D4A3E]/8 rounded-2xl border border-[#2D4A3E]/10 bg-white overflow-hidden">
            {history.map((row) => (
              <div key={row.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`p-1.5 rounded-lg ${
                    row.amount > 0
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {row.amount > 0 ? (
                    <ArrowUpCircle className="w-4 h-4" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2D4A3E] truncate">
                    {reasonLabel[row.reason] ?? row.reason}
                  </p>
                  <p className="text-xs text-[#2D4A3E]/40">
                    {formatDate(row.createdAt)}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold ${
                    row.amount > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {row.amount > 0 ? "+" : ""}
                  {row.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
