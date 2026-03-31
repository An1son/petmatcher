'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Calendar,
  Ruler,
  Zap,
  Users,
  PawPrint,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
  DollarSign,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAge, capitalize } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function PetDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [messagingLoading, setMessagingLoading] = useState(false);

  useEffect(() => {
    async function loadPet() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('pets')
        .select('*, shelter:shelters(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setPet(data);
      }
      setIsLoading(false);
    }

    loadPet();
  }, [id]);

  const handleMessageShelter = async () => {
    if (!pet?.shelter) return;
    setMessagingLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/pet/${id}`);
      return;
    }

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('adopter_id', user.id)
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
        adopter_id: user.id,
        shelter_id: pet.shelter.id,
        pet_id: pet.id,
      })
      .select('id')
      .single();

    if (!error && newConvo) {
      router.push(`/messages/${newConvo.id}`);
    }
    setMessagingLoading(false);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-bold">Pet not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    );
  }

  const photos = pet.photos?.length > 0 ? pet.photos : ['/placeholder.png'];

  return (
    <main className="min-h-dvh pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 transition"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-semibold text-gray-900">{pet.name}</h2>
        <button
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 transition"
          aria-label="Add to favorites"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Photo Gallery */}
      <div className="px-4 pt-4">
        {/* Main photo */}
        <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={photos[activePhoto]}
            alt={`${pet.name} photo ${activePhoto + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 448px) 100vw, 448px"
            unoptimized
          />
        </div>

        {/* Thumbnails (only if multiple photos) */}
        {photos.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 transition ${
                  i === activePhoto
                    ? 'border-orange-500'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={photo}
                  alt={`${pet.name} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pet Info */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
            <p className="text-gray-600">{pet.breed}</p>
          </div>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
            {capitalize(pet.species)}
          </span>
        </div>

        {/* Location & Fee */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-gray-600">
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>
              {pet.city}, {pet.province}
            </span>
          </div>
          {pet.adoption_fee != null && (
            <div className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4" />
              <span className="font-semibold text-gray-900">${Number(pet.adoption_fee).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Quick Info Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Calendar className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Age</p>
              <p className="font-medium">{formatAge(pet.age_years)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Ruler className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Size</p>
              <p className="font-medium">{capitalize(pet.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Zap className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Energy</p>
              <p className="font-medium">{capitalize(pet.energy_level)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <PawPrint className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Sex</p>
              <p className="font-medium">{capitalize(pet.sex)}</p>
            </div>
          </div>
        </div>

        {/* Compatibility */}
        <div className="mb-6">
          <h2 className="mb-3 font-semibold text-gray-900">Compatibility</h2>
          <div className="flex flex-wrap gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                pet.good_with_kids
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Users className="h-4 w-4" />
              {pet.good_with_kids ? 'Good with kids' : 'Not ideal with kids'}
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                pet.good_with_pets
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <PawPrint className="h-4 w-4" />
              {pet.good_with_pets ? 'Good with pets' : 'Prefers to be only pet'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="mb-3 font-semibold text-gray-900">About {pet.name}</h2>
          <p className="leading-relaxed text-gray-600">{pet.description}</p>
        </div>

        {/* Shelter Info + Map */}
        {pet.shelter && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Shelter details */}
            <div className="flex-1 rounded-xl bg-gray-50 p-4">
              <h2 className="mb-3 font-semibold text-gray-900">Shelter Information</h2>
              <p className="mb-2 font-medium">{pet.shelter.name}</p>
              <p className="mb-1 text-sm text-gray-600">
                {pet.shelter.address}, {pet.shelter.city}, {pet.shelter.province}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleMessageShelter}
                  disabled={messagingLoading}
                  className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  {messagingLoading ? 'Opening...' : 'Message'}
                </button>
                <a
                  href={`mailto:${pet.shelter.email}`}
                  className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
                {pet.shelter.phone && (
                  <a
                    href={`tel:${pet.shelter.phone}`}
                    className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
                {pet.shelter.website_url && (
                  <a
                    href={pet.shelter.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Google Maps */}
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div className="sm:flex-1 overflow-hidden rounded-xl">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '220px' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                    `${pet.shelter.address}, ${pet.shelter.city}, ${pet.shelter.province}`
                  )}`}
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}
      </div>

    </main>
  );
}
