'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronRight, Heart, Star, Info } from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        setUser({
          email: authUser.email || '',
          name: authUser.user_metadata?.name || 'Pet Lover',
        });

      }
      setLoading(false);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const menuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      href: '/profile/edit',
      description: 'Update your personal information',
    },
    {
      icon: Heart,
      label: 'Preferences',
      href: '/profile/preferences',
      description: 'Manage your pet preferences',
    },
    {
      icon: Star,
      label: 'My Favourites',
      href: '/favorites',
      description: 'View your saved pets',
    },
  ];

  const [showAbout, setShowAbout] = useState(false);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center pb-20">
        <div className="animate-pulse text-gray-400">Loading...</div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-dvh pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-orange-400 to-orange-500 px-4 pb-8 pt-6 text-white">
        <h1 className="mb-4 text-xl font-bold">Profile</h1>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.name || 'Guest'}</h2>
            <p className="text-sm opacity-90">{user?.email || 'Not logged in'}</p>
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <div className="mx-auto max-w-2xl mt-4 px-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-gray-50 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <item.icon className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* About PetMatcher */}
      <div className="mx-auto max-w-2xl mt-4 px-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Info className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">About PetMatcher</p>
              <p className="text-xs text-gray-500">Learn more about this app</p>
            </div>
            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${showAbout ? 'rotate-90' : ''}`} />
          </button>
          {showAbout && (
            <div className="border-t border-gray-100 px-4 py-4 text-sm text-gray-600 space-y-2">
              <p className="font-semibold text-gray-900">PetMatcher</p>
              <p>
                A swipe-based, preference-aware web app designed to connect adopters
                with shelter pets. Browse adoptable animals, get personalized
                recommendations, and message shelters directly.
              </p>
              <p className="font-semibold text-gray-900 mt-3">Why PetMatcher?</p>
              <p>
                Canadian shelters receive approximately 80,000 animals annually, yet only
                44% of dogs and 62% of cats find adoptive homes in time. With surrenders
                rising 21% as of 2024, traditional list-style platforms contribute to
                decision fatigue and lower engagement. PetMatcher offers an interactive,
                gamified experience to help younger adopters discover their perfect match
                faster.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      {user && (
        <div className="mx-auto max-w-2xl mt-6 px-4">
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-500 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      )}


      <BottomNav />
    </main>
  );
}
