"use client";

import Link from "next/link";
import { ImageIcon, Loader2, ArrowRight } from "lucide-react";

interface Generation {
  id: string;
  status: string;
  generatedImageUrls: string[] | null;
  createdAt: Date;
}

interface RecentGenerationsProps {
  generations: Generation[];
}

export function RecentGenerations({ generations }: RecentGenerationsProps) {
  if (generations.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-[#2D4A3E]/20 rounded-2xl bg-[#FFFEF5]">
        <ImageIcon className="w-10 h-10 text-[#2D4A3E]/20 mx-auto mb-4" />
        <p className="text-[#2D4A3E]/60 mb-4">No generations yet</p>
        <Link href="/generate">
          <button className="px-6 py-2.5 bg-[#2D4A3E] text-white rounded-xl font-medium hover:bg-[#1f352d] transition-colors">
            Create your first
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {generations.slice(0, 10).map((gen) => (
          <Link href={`/generation/${gen.id}`} key={gen.id}>
            <div className="group aspect-square rounded-xl border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/30 transition-all overflow-hidden relative bg-[#FFFEF5] hover:shadow-lg">
              {gen.generatedImageUrls && gen.generatedImageUrls.length > 0 ? (
                <>
                  <img 
                    src={gen.generatedImageUrls[0]} 
                    alt="Generation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-[#2D4A3E]" />
                    </div>
                  </div>
                </>
              ) : gen.status === 'processing' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-[#2D4A3E]/40 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-[#2D4A3E]/50">Processing</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[#2D4A3E]/20" />
                </div>
              )}
              
              {/* Status badge */}
              {gen.status === 'processing' && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-[10px] font-medium bg-[#FFE066] text-[#2D4A3E] rounded-full">
                    Processing
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {generations.length > 10 && (
        <div className="mt-4 text-center">
          <Link href="/history">
            <button className="text-sm text-[#2D4A3E]/60 hover:text-[#2D4A3E] font-medium inline-flex items-center gap-1">
              View all {generations.length} generations
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
