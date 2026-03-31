'use client';

import Image from 'next/image';
import { Heart, MapPin, Info } from 'lucide-react';
import { formatAge, capitalize, cn } from '@/lib/utils';

export function PetCard({ pet, matchReasons = [], onClick, className }) {
  return (
    <div
      className={cn(
        'relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl',
        className
      )}
    >
      {/* Pet Image */}
      <div className="relative aspect-[3/4] w-full">
        {pet.photos && pet.photos.length > 0 ? (
          <Image
            src={pet.photos[0]}
            alt={pet.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200">
            <Heart className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Pet info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h2 className="text-2xl font-bold">{pet.name}</h2>
          <p className="text-sm opacity-90">
            {pet.breed} · {formatAge(pet.age_years)} · {capitalize(pet.size)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-sm opacity-80">
            <MapPin className="h-4 w-4" />
            <span>
              {pet.city}, {pet.province}
            </span>
          </div>
        </div>

        {/* Info button */}
        <button
          onClick={onClick}
          className="absolute right-4 top-4 rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/30"
          aria-label="View pet details"
        >
          <Info className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Match reasons */}
      {matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {matchReasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700"
            >
              {reason}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
