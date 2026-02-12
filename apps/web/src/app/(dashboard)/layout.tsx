import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { getCredits } from "@/app/actions/generation";

// Allow long-running operations (up to 60s on Pro, 10s on Hobby)
export const maxDuration = 60;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const credits = await getCredits();

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Mobile Header */}
      <MobileHeader credits={credits} />

      {/* Sidebar - hidden on mobile, fixed on desktop */}
      <div className="hidden md:block">
        <Sidebar credits={credits} />
      </div>

      {/* Main content area - offset by sidebar width on desktop only */}
      <main className="md:ml-64 min-h-[calc(100vh-64px)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}
