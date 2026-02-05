import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExampleGallery, Testimonials, UseCases, FAQ } from "@/components/landing";
import { 
  Eye, 
  Move, 
  Sun, 
  ArrowRight, 
  Check,
  Camera
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">Espresso</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-black mb-6 leading-[1.1]">
            Fix your photos with AI
          </h1>
          
          <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Upload a photo, choose what to fix, and get 5 enhanced variations in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/sign-up">
              <Button size="lg" className="min-w-[180px]">
                Start for free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {/* Trust line */}
          <p className="text-sm text-gray-400">
            3 free generations. No credit card required.
          </p>
        </div>
      </section>

      {/* Before/After Examples */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              See the difference
            </h2>
            <p className="text-gray-500">
              Real examples of what Espresso can do.
            </p>
          </div>
          
          <ExampleGallery />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              What you can fix
            </h2>
            <p className="text-gray-500">
              Select one or more. Get 5 variations every time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <Eye className="w-6 h-6 text-black mb-4" />
              <h3 className="font-medium mb-2">Eye Contact</h3>
              <p className="text-sm text-gray-500">
                Look directly at the camera, naturally.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <Move className="w-6 h-6 text-black mb-4" />
              <h3 className="font-medium mb-2">Posture</h3>
              <p className="text-sm text-gray-500">
                Stand confident with shoulders back.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <Camera className="w-6 h-6 text-black mb-4" />
              <h3 className="font-medium mb-2">Angle</h3>
              <p className="text-sm text-gray-500">
                Find the most flattering perspective.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <Sun className="w-6 h-6 text-black mb-4" />
              <h3 className="font-medium mb-2">Lighting</h3>
              <p className="text-sm text-gray-500">
                Soft, natural light that flatters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              How it works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4 text-sm font-medium">
                1
              </div>
              <h3 className="font-medium mb-2">Upload</h3>
              <p className="text-sm text-gray-500">
                Drop in any photo you want to enhance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4 text-sm font-medium">
                2
              </div>
              <h3 className="font-medium mb-2">Select fixes</h3>
              <p className="text-sm text-gray-500">
                Choose what to improve.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4 text-sm font-medium">
                3
              </div>
              <h3 className="font-medium mb-2">Download</h3>
              <p className="text-sm text-gray-500">
                Get 5 variations. Pick your favorite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              Perfect for any use case
            </h2>
            <p className="text-gray-500">
              Whether it's professional or personal, we've got you covered.
            </p>
          </div>
          
          <UseCases />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              Pricing
            </h2>
            <p className="text-gray-500">
              Start free. Pay only when you need more.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="p-6 rounded-lg border border-gray-200">
              <div className="mb-6">
                <h3 className="font-medium mb-1">Free</h3>
                <div className="text-3xl font-semibold">$0</div>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>3 generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>5 variations each</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>All fix options</span>
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </div>
            
            {/* Starter Tier */}
            <div className="p-6 rounded-lg border-2 border-black">
              <div className="mb-6">
                <h3 className="font-medium mb-1">Starter</h3>
                <div className="text-3xl font-semibold">$9.99</div>
                <p className="text-sm text-gray-500">one-time</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>50 generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Never expires</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button className="w-full">Buy Starter</Button>
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="p-6 rounded-lg border border-gray-200">
              <div className="mb-6">
                <h3 className="font-medium mb-1">Pro</h3>
                <div className="text-3xl font-semibold">$12.99</div>
                <p className="text-sm text-gray-500">/month</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>200 generations/mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Rollover up to 100</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Early access</span>
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full">Subscribe</Button>
              </Link>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-500">
            Need more? Get a 25-credit pack for $4.99 anytime.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              Loved by thousands
            </h2>
            <p className="text-gray-500">
              See what our users are saying.
            </p>
          </div>
          
          <Testimonials />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              Frequently asked questions
            </h2>
          </div>
          
          <FAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">
            Ready to fix your photos?
          </h2>
          <p className="text-gray-400 mb-8">
            Start with 3 free generations.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              Get started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-medium">Espresso</span>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
