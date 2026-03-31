import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Search, MessageCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100">
            <Heart className="h-10 w-10 text-orange-500" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            pet<span className="text-orange-500">Matcher</span>
          </h1>
        </div>

        {/* Hero Image */}
        <div className="relative mb-8 h-64 w-full max-w-sm overflow-hidden rounded-3xl bg-orange-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-6xl">🐕 🐈 🐰</div>
              <p className="text-sm text-gray-500">Find your perfect match</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Search className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-xs text-gray-600">Discover Pets</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Heart className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-xs text-gray-600">Swipe & Match</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <MessageCircle className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-xs text-gray-600">Contact Shelter</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Link href="/register" className="w-full">
            <Button className="w-full" size="lg">
              Create Account
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full" size="lg">
              Log In
            </Button>
          </Link>
        </div>
      </section>


    </main>
  );
}
