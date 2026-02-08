import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StatsCards, QuickActions, RecentGenerations } from "@/components/dashboard";
import { getCredits, getUserGenerations } from "@/app/actions/generation";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const credits = await getCredits();
  const generations = await getUserGenerations();
  
  // Calculate this week's generations
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekGenerations = generations.filter(
    (g) => new Date(g.createdAt) > oneWeekAgo
  ).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D4A3E] mb-1">
          Welcome back{user.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-[#2D4A3E]/60">
          Here's what's happening with your photos.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <StatsCards 
          totalGenerations={generations.length}
          thisWeek={thisWeekGenerations}
          credits={credits}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#2D4A3E] mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Recent Generations */}
      <div>
        <h2 className="text-lg font-semibold text-[#2D4A3E] mb-4">Recent Generations</h2>
        <RecentGenerations generations={generations} />
      </div>
    </div>
  );
}
