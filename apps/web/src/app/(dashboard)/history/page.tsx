import { currentUser } from "@clerk/nextjs/server";
import { DatingPhotoHistory } from "@/components/dating-preview/DatingPhotoHistory";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ImageIcon, Calendar } from "lucide-react";
import { getUserGenerations, getUserDatingPhotoHistory } from "@/app/actions/generation";
import { GenerationCard } from "@/components/GenerationCard";

export default async function HistoryPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  const [generations, datingHistory] = await Promise.all([
    getUserGenerations(),
    getUserDatingPhotoHistory()
  ]);

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
                  <GenerationCard key={gen.id} generation={gen} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dating Photo History Section */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-[#2D4A3E] mb-4">Dating Photo History</h2>
        <DatingPhotoHistory initialPhotos={datingHistory} />
      </div>
    </div>
  );
}
