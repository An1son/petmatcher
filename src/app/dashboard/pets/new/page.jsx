'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { createClient } from '@/lib/supabase/client';

const petSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.enum(['dog', 'cat', 'rabbit', 'other']),
  customSpecies: z.string().optional(),
  breed: z.string().min(1, 'Breed is required'),
  age_years: z.coerce.number().min(0, 'Age must be 0 or greater').max(30, 'Age seems too high'),
  adoption_fee: z.coerce.number().min(0, 'Fee must be 0 or greater').optional().or(z.literal('')),
  size: z.enum(['small', 'medium', 'large']),
  sex: z.enum(['male', 'female']),
  energy_level: z.enum(['low', 'medium', 'high']),
  good_with_kids: z.boolean(),
  good_with_pets: z.boolean(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
});

export default function AddPetPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [shelterId, setShelterId] = useState(null);
  const [photos, setPhotos] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: {
      species: 'dog',
      size: 'medium',
      sex: 'male',
      energy_level: 'medium',
      good_with_kids: false,
      good_with_pets: false,
      province: 'BC',
    },
  });

  const selectedSpecies = watch('species');

  useEffect(() => {
    async function getShelter() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: shelter } = await supabase
        .from('shelters')
        .select('id, city, province')
        .eq('owner_user_id', user.id)
        .single();

      if (shelter) {
        setShelterId(shelter.id);
      }
    }
    getShelter();
  }, []);

  const onSubmit = async (data) => {
    if (!shelterId) {
      setError('Shelter not found');
      return;
    }

    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    setError(null);
    const supabase = createClient();

    const species = data.species === 'other' && data.customSpecies
      ? data.customSpecies.toLowerCase()
      : data.species;

    const { error: insertError } = await supabase.from('pets').insert({
      shelter_id: shelterId,
      name: data.name,
      species,
      breed: data.breed,
      age_years: data.age_years,
      adoption_fee: data.adoption_fee !== '' && data.adoption_fee != null ? data.adoption_fee : null,
      size: data.size,
      sex: data.sex,
      energy_level: data.energy_level,
      good_with_kids: data.good_with_kids,
      good_with_pets: data.good_with_pets,
      description: data.description,
      city: data.city,
      province: data.province,
      photos,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push('/dashboard/pets');
  };

  return (
    <main className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pets" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Add New Pet</h1>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>

            <Input
              {...register('name')}
              label="Pet Name"
              placeholder="e.g., Buddy"
              error={errors.name?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                <select
                  {...register('species')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Input
                {...register('breed')}
                label="Breed"
                placeholder="e.g., Golden Retriever"
                error={errors.breed?.message}
              />
            </div>

            {selectedSpecies === 'other' && (
              <Input
                {...register('customSpecies')}
                label="Specify Species"
                placeholder="e.g., Hamster, Parrot, Turtle"
                error={errors.customSpecies?.message}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('age_years')}
                type="number"
                step="0.5"
                label="Age (years)"
                placeholder="e.g., 2"
                error={errors.age_years?.message}
              />
              <Input
                {...register('adoption_fee')}
                type="number"
                step="0.01"
                label="Adoption Fee ($)"
                placeholder="e.g., 150"
                error={errors.adoption_fee?.message}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  {...register('size')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                <select
                  {...register('sex')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Temperament */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Temperament</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level</label>
              <select
                {...register('energy_level')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="low">Low - Calm and relaxed</option>
                <option value="medium">Medium - Balanced</option>
                <option value="high">High - Very active</option>
              </select>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('good_with_kids')}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Good with children</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('good_with_pets')}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Good with other pets</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Description</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About this pet</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Tell potential adopters about this pet's personality, history, and what makes them special..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Location</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('city')}
                label="City"
                placeholder="e.g., Vancouver"
                error={errors.city?.message}
              />
              <Input
                {...register('province')}
                label="Province"
                placeholder="e.g., BC"
                error={errors.province?.message}
              />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Photos</h2>
            <ImageUpload
              onUpload={setPhotos}
              existingImages={photos}
              maxImages={5}
              folder="pets"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/pets" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Add Pet
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
