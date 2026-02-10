"use client";

import { cn } from "@/lib/utils";

interface ShimmerCardProps {
    index: number;
    total: number;
    isRevealed?: boolean;
    imageUrl?: string;
    label?: string;
}

export function ShimmerCard({ index, total, isRevealed, imageUrl, label }: ShimmerCardProps) {
    if (isRevealed && imageUrl) {
        return (
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#2D4A3E]/10 animate-in fade-in zoom-in-95 duration-500">
                <img
                    src={imageUrl}
                    alt={label || `Variation ${index + 1}`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                    <span className="text-white text-xs font-medium capitalize">
                        {label || `Variation ${index + 1}`}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-[#2D4A3E]/5 to-[#2D4A3E]/10 border border-[#2D4A3E]/10"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
                    style={{
                        background: "linear-gradient(90deg, transparent, rgba(45,74,62,0.06), transparent)",
                        animationDelay: `${index * 200}ms`,
                    }}
                />
            </div>

            {/* Placeholder content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D4A3E]/8 flex items-center justify-center">
                    <span className="text-[#2D4A3E]/30 text-sm font-medium">{index + 1}</span>
                </div>
                <div className="space-y-2 w-3/4">
                    <div className="h-2 bg-[#2D4A3E]/8 rounded-full mx-auto w-2/3" />
                    <div className="h-2 bg-[#2D4A3E]/6 rounded-full mx-auto w-1/2" />
                </div>
            </div>
        </div>
    );
}

export function ShimmerCardGrid({
    total = 5,
    revealedUrls = [],
    labels = [],
}: {
    total?: number;
    revealedUrls?: string[];
    labels?: string[];
}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: total }).map((_, index) => (
                <ShimmerCard
                    key={index}
                    index={index}
                    total={total}
                    isRevealed={index < revealedUrls.length}
                    imageUrl={revealedUrls[index]}
                    label={labels[index]}
                />
            ))}
        </div>
    );
}
