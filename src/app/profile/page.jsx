'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronRight, Heart } from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ viewed: 0, favorites: 0 });

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        setUser({
          email: authUser.email || '',
          name: authUser.user_metadata?.name || 'Pet Lover',
        });

        // Fetch real stats in parallel
        const [viewedRes, favoritesRes] = await Promise.all([
          supabase
            .from('interactions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authUser.id),
          supabase
            .from('interactions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .in('type', ['like', 'favourite']),
        ]);

        setStats({
          viewed: viewedRes.count || 0,
          favorites: favoritesRes.count || 0,
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
  ];

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

      {/* Stats */}
      <div className="-mt-4 mx-auto max-w-2xl px-4">
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-white p-4 shadow-md">
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-500">{stats.viewed}</p>
          <p className="text-xs text-gray-500">Pets Viewed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{stats.favorites}</p>
          <p className="text-xs text-gray-500">Favorites</p>
        </div>
      </div>
      </div>

      {/* Menu Items */}
      <div className="mx-auto max-w-2xl mt-6 px-4">
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
