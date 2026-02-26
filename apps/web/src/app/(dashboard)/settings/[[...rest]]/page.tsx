import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { getCredits, getCreditHistory, getUserProfile } from "@/app/actions/generation";
import SettingsTabs from "@/components/settings/SettingsTabs";
import CreditsPanel from "@/components/settings/CreditsPanel";
import SubscriptionPanel from "@/components/settings/SubscriptionPanel";

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [credits, history, profile] = await Promise.all([
    getCredits(),
    getCreditHistory(),
    getUserProfile(),
  ]);

  const tier = profile?.subscriptionTier ?? "free";

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D4A3E] mb-1">Settings</h1>
        <p className="text-[#2D4A3E]/60">
          Manage your account, credits, and subscription.
        </p>
      </div>

      <SettingsTabs>
        {/* Tab 0 — Profile */}
        <div className="bg-white rounded-2xl border border-[#2D4A3E]/10 overflow-hidden">
          <UserProfile
            path="/settings"
            routing="path"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none",
                navbar: "hidden",
                pageScrollBox: "p-0",
              },
            }}
          />
        </div>

        {/* Tab 1 — Credits */}
        <CreditsPanel credits={credits} history={history} />

        {/* Tab 2 — Subscription */}
        <SubscriptionPanel tier={tier} credits={credits} />
      </SettingsTabs>
    </div>
  );
}

