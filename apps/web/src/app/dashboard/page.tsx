import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Plus, 
  CreditCard, 
  Clock, 
  Image as ImageIcon,
  Settings,
  LogOut
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // TODO: Fetch from database
  const credits: number = 3;
  const generations: { id: string; createdAt: Date; status: string; thumbnail?: string }[] = [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Espresso</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Credits Display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{credits} credits</span>
            </div>
            
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.firstName || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Ready to enhance some photos?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* New Generation Card */}
          <Link href="/generate">
            <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">New Generation</h3>
                <p className="text-muted-foreground text-sm">
                  Upload a photo and fix eye contact, posture, or lighting
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Credits Card */}
          <Card>
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4">
                <CreditCard className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{credits} Credits</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {credits === 0 ? "You're out of credits" : `${credits} generation${credits === 1 ? '' : 's'} remaining`}
              </p>
              <Link href="/pricing">
                <Button variant="outline" size="sm">Get More</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
              <p className="text-muted-foreground text-sm">
                {generations.length === 0 
                  ? "No generations yet. Create your first one!"
                  : `${generations.length} generation${generations.length === 1 ? '' : 's'} this week`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Generation History */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Generations</h2>
            {generations.length > 0 && (
              <Button variant="ghost" size="sm">View All</Button>
            )}
          </div>

          {generations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No generations yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first photo to see it transformed
                </p>
                <Link href="/generate">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Generation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generations.map((gen) => (
                <Link href={`/generation/${gen.id}`} key={gen.id}>
                  <Card className="overflow-hidden hover:border-primary/50 transition-all">
                    <div className="aspect-square bg-muted relative">
                      {gen.thumbnail ? (
                        <img 
                          src={gen.thumbnail} 
                          alt="Generation thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/80 text-xs font-medium">
                        {gen.status}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm text-muted-foreground">
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
