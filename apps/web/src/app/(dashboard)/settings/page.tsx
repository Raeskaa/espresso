import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";

export default async function SettingsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D4A3E] mb-1">Settings</h1>
        <p className="text-[#2D4A3E]/60">
          Manage your account and preferences.
        </p>
      </div>

      {/* Clerk User Profile */}
      <div className="bg-white rounded-2xl border border-[#2D4A3E]/10 overflow-hidden">
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-none",
              navbar: "hidden",
              pageScrollBox: "p-0",
            }
          }}
        />
      </div>
    </div>
  );
}
