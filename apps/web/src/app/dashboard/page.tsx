import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { getCredits, getUserGenerations } from "@/app/actions/generation";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const credits = await getCredits();
  const generations = await getUserGenerations();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-lg">
            Espresso
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {credits} credit{credits !== 1 ? 's' : ''}
            </span>
            
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold mb-2">
            Welcome back{user.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-gray-500">
            Upload a photo to get started.
          </p>
        </div>

        {/* New Generation CTA */}
        <Link href="/generate">
          <div className="p-8 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-medium">New generation</h2>
                <p className="text-sm text-gray-500">
                  Upload a photo and select fixes
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Generation History */}
        <div>
          <h2 className="text-lg font-medium mb-6">Your generations</h2>

          {generations.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-gray-200 rounded-lg">
              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No generations yet</p>
              <Link href="/generate">
                <Button>Create your first</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generations.map((gen) => (
                <Link href={`/generation/${gen.id}`} key={gen.id}>
                  <div className="aspect-square rounded-lg border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden relative bg-gray-50">
                    {gen.generatedImageUrls && gen.generatedImageUrls.length > 0 ? (
                      <img 
                        src={gen.generatedImageUrls[0]} 
                        alt="Generation"
                        className="w-full h-full object-cover"
                      />
                    ) : gen.status === 'processing' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
                      gen.status === 'completed' ? 'bg-white text-black' :
                      gen.status === 'processing' ? 'bg-white text-gray-500' :
                      'bg-white text-gray-500'
                    }`}>
                      {gen.status}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(gen.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
