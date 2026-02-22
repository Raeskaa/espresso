"use client";

import Link from "next/link";
import { ArrowRight, Loader2, ImageIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteGeneration } from "@/app/actions/generation";

interface Generation {
  id: string;
  generatedImageUrls: string[] | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export function GenerationCard({ generation }: { generation: Generation }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Delete this generation?")) return;

    setIsDeleting(true);
    try {
      await deleteGeneration(generation.id);
      setIsDeleted(true);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete generation:", error);
      alert("Failed to delete generation");
      setIsDeleting(false);
    }
  };

  if (isDeleted) return null;

  return (
    <div className="group aspect-square rounded-xl border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/30 transition-all overflow-hidden relative bg-white hover:shadow-lg">
        <Link href={`/generation/${generation.id}`} className="absolute inset-0 z-0">
          <span className="sr-only">View Generation</span>
        </Link>
        
        {generation.generatedImageUrls && generation.generatedImageUrls.length > 0 ? (
          <>
            <img 
              src={generation.generatedImageUrls[0]} 
              alt="Generation"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {/* Action Buttons - safely outside the Link via z-index or sibling, but here we just position them absolute over the Link */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
               <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors shadow-sm cursor-pointer"
                title="Delete"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
              
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center pointer-events-none">
                <ArrowRight className="w-4 h-4 text-[#2D4A3E]" />
              </div>
            </div>
            
            {/* Fixes applied indicator */}
            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="px-2 py-1 rounded-full bg-white/90 text-xs font-medium text-[#2D4A3E]">
                {generation.generatedImageUrls?.length || 0} variations
              </div>
            </div>
          </>
        ) : generation.status === 'processing' ? (
          <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-[#2D4A3E]/40 animate-spin mx-auto mb-2" />
              <span className="text-xs text-[#2D4A3E]/50">Processing</span>
            </div>
          </div>
        ) : generation.status === 'failed' ? (
          <div className="w-full h-full flex items-center justify-center bg-red-50 relative">
            <div className="text-center pointer-events-none">
              <span className="text-2xl mb-2 block">❌</span>
              <span className="text-xs text-red-500">Failed</span>
            </div>
             <button
                onClick={handleDelete}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-100 text-red-500 transition-colors z-10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <ImageIcon className="w-8 h-8 text-[#2D4A3E]/20 pointer-events-none" />
             <button
                onClick={handleDelete}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-100 text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
    </div>
  );
}
