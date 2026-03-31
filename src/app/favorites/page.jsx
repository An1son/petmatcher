'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, MapPin, Loader2, MessageSquare } from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { formatAge, capitalize } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function fetchFavorites() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      // Fetch liked/favourited interactions, most recent first
      const { data: interactions } = await supabase
        .from('interactions')
        .select('pet_id')
        .eq('user_id', user.id)
        .in('type', ['like', 'favourite'])
        .order('created_at', { ascending: false });

      if (!interactions || interactions.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch the corresponding pets with shelter info
      const petIds = interactions.map((i) => i.pet_id);
      const { data: pets } = await supabase
        .from('pets')
        .select('*, shelter:shelters(id, name)')
        .in('id', petIds);

      if (pets) {
        // Maintain the interaction order (most recently liked first)
        const petMap = {};
        for (const pet of pets) {
          petMap[pet.id] = pet;
        }
        const ordered = petIds
          .map((id) => petMap[id])
          .filter(Boolean);
        setFavorites(ordered);
      }

      setIsLoading(false);
    }

    fetchFavorites();
  }, []);

  const handleRemove = async (petId) => {
    setFavorites((prev) => prev.filter((p) => p.id !== petId));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('pet_id', petId);
    }
  };

  const handleMessage = async (pet) => {
    if (!userId || !pet.shelter) return;

    const supabase = createClient();

    // Check for existing conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('adopter_id', userId)
      .eq('shelter_id', pet.shelter.id)
      .eq('pet_id', pet.id)
      .single();

    if (existing) {
      router.push(`/messages/${existing.id}`);
      return;
    }

    // Create new conversation
    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({
        adopter_id: userId,
        shelter_id: pet.shelter.id,
        pet_id: pet.id,
      })
      .select('id')
      .single();

    if (!error && newConvo) {
      router.push(`/messages/${newConvo.id}`);
    }
  };

  return (
    <main className="min-h-dvh pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-xl font-bold">
          <Heart className="mr-2 inline-block h-5 w-5 text-orange-500" fill="currentColor" />
          Favorites
        </h1>
        <p className="text-sm text-gray-500">{favorites.length} pets saved</p>
      </header>

      {/* Favorites List */}
      <div className="mx-auto max-w-2xl p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-gray-600">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-12 text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              No favorites yet
            </h2>
            <p className="mb-4 text-gray-500">
              Start swiping to find pets you love!
            </p>
            <Link href="/browse">
              <Button>Browse Pets</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((pet) => (
              <div
                key={pet.id}
                className="flex overflow-hidden rounded-xl bg-white shadow-md"
              >
                {/* Pet Image */}
                <Link href={`/pet/${pet.id}`} className="relative h-32 w-32 flex-shrink-0">
                  <Image
                    src={pet.photos[0]}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </Link>

                {/* Pet Info */}
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <Link href={`/pet/${pet.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-orange-500">
                        {pet.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600">
                      {pet.breed} · {formatAge(pet.age_years)} · {capitalize(pet.size)}
                      {pet.adoption_fee != null && (
                        <span className="ml-1 font-semibold text-orange-600"> · ${Number(pet.adoption_fee).toFixed(0)}</span>
                      )}
                    </p>
                    <p className="mt-1 flex items-center text-xs text-gray-500">
                      <MapPin className="mr-1 h-3 w-3" />
                      {pet.city}, {pet.province}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/pet/${pet.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleMessage(pet)}
                      className="rounded-lg border border-orange-200 p-2 text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
                      aria-label="Message shelter"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(pet.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-400 transition hover:bg-red-50 hover:text-red-500"
                      aria-label="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
