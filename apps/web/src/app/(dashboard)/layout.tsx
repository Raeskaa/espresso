import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getCredits } from "@/app/actions/generation";

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
      {/* Sidebar */}
      <Sidebar credits={credits} />
      
      {/* Main content area - offset by sidebar width */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
