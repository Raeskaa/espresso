import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ImageIcon, Loader2, ArrowRight, Calendar } from "lucide-react";
import { getUserGenerations } from "@/app/actions/generation";

export default async function HistoryPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const generations = await getUserGenerations();

  // Group by date
  const groupedByDate = generations.reduce((acc, gen) => {
    const date = new Date(gen.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(gen);
    return acc;
  }, {} as Record<string, typeof generations>);
  console.log(generations);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D4A3E] mb-1">History</h1>
        <p className="text-[#2D4A3E]/60">
          All your previous generations.
        </p>
      </div>

      {generations.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#2D4A3E]/20 rounded-2xl bg-white">
          <ImageIcon className="w-12 h-12 text-[#2D4A3E]/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#2D4A3E] mb-2">No generations yet</h3>
          <p className="text-[#2D4A3E]/60 mb-6">Create your first generation to see it here.</p>
          <Link href="/generate">
            <button className="px-6 py-3 bg-[#2D4A3E] text-white rounded-xl font-medium hover:bg-[#1f352d] transition-colors">
              Create your first
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, gens]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-[#2D4A3E]/40" />
                <h2 className="text-sm font-medium text-[#2D4A3E]/60">{date}</h2>
                <span className="text-xs text-[#2D4A3E]/40">({gens.length})</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {gens.map((gen) => (
                  <Link href={`/generation/${gen.id}`} key={gen.id}>
                    <div className="group aspect-square rounded-xl border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/30 transition-all overflow-hidden relative bg-white hover:shadow-lg">
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
                          
                          {/* Fixes applied indicator */}
                          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-2 py-1 rounded-full bg-white/90 text-xs font-medium text-[#2D4A3E]">
                              {gen.generatedImageUrls?.length || 0} variations
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
                      ) : gen.status === 'failed' ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                          <div className="text-center">
                            <span className="text-2xl mb-2 block">❌</span>
                            <span className="text-xs text-red-500">Failed</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-[#2D4A3E]/20" />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
