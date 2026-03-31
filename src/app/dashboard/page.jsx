'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PawPrint, Plus, Building2, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [shelter, setShelter] = useState(null);
  const [stats, setStats] = useState({ totalPets: 0 });
  const [recentPets, setRecentPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get shelter info
      const { data: shelterData } = await supabase
        .from('shelters')
        .select('id, name')
        .eq('owner_user_id', user.id)
        .single();

      if (!shelterData) {
        setIsLoading(false);
        return;
      }

      setShelter(shelterData);

      // Get stats
      const { count: petCount } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('shelter_id', shelterData.id);

      setStats({
        totalPets: petCount || 0,
      });

      // Get recent pets
      const { data: pets } = await supabase
        .from('pets')
        .select('*')
        .eq('shelter_id', shelterData.id)
        .order('created_at', { ascending: false })
        .limit(4);

      setRecentPets(pets || []);
      setIsLoading(false);
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!shelter) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">No Shelter Found</h1>
          <p className="mt-2 text-gray-600">Your account is not associated with a shelter.</p>
          <Link href="/browse">
            <Button className="mt-4">Go to Browse</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shelter.name}</h1>
            <p className="text-sm text-gray-600">Shelter Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Link href="/dashboard/pets/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Pet
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-orange-100 p-3">
              <PawPrint className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPets}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/pets" className="block">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 transition">
              <PawPrint className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-900">Manage Pets</h3>
              <p className="text-sm text-gray-600 mt-1">View and edit your pet listings</p>
            </div>
          </Link>
          <Link href="/dashboard/messages" className="block">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 transition">
              <MessageSquare className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600 mt-1">Chat with potential adopters</p>
            </div>
          </Link>
        </div>

        {/* Recent Pets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Pets</h2>
            <Link href="/dashboard/pets" className="text-sm text-orange-500 hover:text-orange-600">
              View all
            </Link>
          </div>

          {recentPets.length === 0 ? (
            <div className="p-6 text-center">
              <PawPrint className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-gray-600">No pets listed yet</p>
              <Link href="/dashboard/pets/new">
                <Button variant="outline" className="mt-4">Add your first pet</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentPets.map((pet) => (
                <div key={pet.id} className="flex items-center gap-4 p-4">
                  <div
                    className="h-12 w-12 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${pet.photos[0] || '/placeholder.png'})` }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-600">{pet.breed} · {pet.species}</p>
                  </div>
                  <Link href={`/dashboard/pets/${pet.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
