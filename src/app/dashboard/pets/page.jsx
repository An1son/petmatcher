'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, PawPrint, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function ManagePetsPage() {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadPets();
  }, []);

  async function loadPets() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: shelter } = await supabase
      .from('shelters')
      .select('id')
      .eq('owner_user_id', user.id)
      .single();

    if (!shelter) return;

    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('shelter_id', shelter.id)
      .order('created_at', { ascending: false });

    setPets(data || []);
    setIsLoading(false);
  }

  async function handleDelete(petId) {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    setDeletingId(petId);
    const supabase = createClient();

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);

    if (!error) {
      setPets(pets.filter(p => p.id !== petId));
    }
    setDeletingId(null);
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Manage Pets</h1>
          </div>
          <Link href="/dashboard/pets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Pet
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <PawPrint className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">No pets yet</h2>
            <p className="mt-2 text-gray-600">Add your first pet to get started.</p>
            <Link href="/dashboard/pets/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Pet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${pet.photos[0] || '/placeholder.png'})` }}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                      <p className="text-sm text-gray-600">{pet.breed}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {pet.species} · {pet.age_years} yrs · {pet.size}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/pets/${pet.id}/edit`}>
                        <button className="p-2 text-gray-600 hover:text-orange-500 transition">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(pet.id)}
                        disabled={deletingId === pet.id}
                        className="p-2 text-gray-600 hover:text-red-500 transition disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {pet.good_with_kids && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Kids OK
                      </span>
                    )}
                    {pet.good_with_pets && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Pets OK
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {pet.energy_level} energy
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
