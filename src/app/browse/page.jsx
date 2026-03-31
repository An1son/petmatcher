'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, RotateCcw, Info, Loader2, SlidersHorizontal, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/bottom-nav';
import { formatAge, capitalize, getMatchReasons, scoreAndSortPets } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function BrowsePage() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastSwipedPet, setLastSwipedPet] = useState(null);
  const [likedCount, setLikedCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [userInteractions, setUserInteractions] = useState([]);
  const allPetsRef = useRef([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterMaxFee, setFilterMaxFee] = useState('');
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Fetch pets, preferences, and interactions from Supabase
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // 1. Get auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError('Please log in to browse pets.');
        setIsLoading(false);
        return;
      }
      setUserId(authUser.id);

      // 2. Fetch profile preferences, past interactions, all pets, and popularity in parallel
      const [profileRes, interactionsRes, petsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('activity_level, has_children, has_other_pets, preferred_pet_types, preferred_province, max_adoption_fee')
          .eq('id', authUser.id)
          .single(),
        supabase
          .from('interactions')
          .select('pet_id, type')
          .eq('user_id', authUser.id),
        supabase
          .from('pets')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (petsRes.error) {
        console.error('Error fetching pets:', petsRes.error);
        setError(petsRes.error.message);
        setIsLoading(false);
        return;
      }

      // Build preferences (fall back to defaults if profile fetch fails)
      const prefs = profileRes.data || {
        activity_level: 'medium',
        has_children: false,
        has_other_pets: false,
        preferred_pet_types: ['dog', 'cat'],
      };
      setUserPreferences(prefs);

      // Build interactions list
      const interactions = interactionsRes.data || [];
      setUserInteractions(interactions);

      // Store all pets for behavioral scoring
      const allPets = petsRes.data || [];
      allPetsRef.current = allPets;

      // Build available provinces and cities for filter dropdowns
      const provinces = [...new Set(allPets.map((p) => p.province).filter(Boolean))].sort();
      setAvailableProvinces(provinces);
      const cities = [...new Set(allPets.map((p) => p.city).filter(Boolean))].sort();
      setAvailableCities(cities);

      // Load saved filter preferences
      if (prefs.preferred_province) setFilterProvince(prefs.preferred_province);
      if (prefs.max_adoption_fee != null) setFilterMaxFee(String(prefs.max_adoption_fee));

      // Filter out already-seen pets
      const seenIds = new Set(interactions.map((i) => i.pet_id));
      let unseenPets = allPets.filter((p) => !seenIds.has(p.id));

      // Apply location/fee filters
      unseenPets = applyFilters(unseenPets, prefs.preferred_province || '', '', prefs.max_adoption_fee != null ? String(prefs.max_adoption_fee) : '');

      // Score and sort
      const sorted = scoreAndSortPets(unseenPets, prefs, interactions, allPets);
      setPets(sorted);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  const currentPet = pets[currentIndex];

  const handleSwipe = useCallback(
    async (direction) => {
      if (!currentPet || !userId) return;

      const interactionType = direction === 'right' ? 'like' : 'skip';

      if (direction === 'right') {
        setLikedCount((prev) => prev + 1);
      } else {
        setPassedCount((prev) => prev + 1);
      }

      setLastSwipedPet(currentPet);
      setCurrentIndex((prev) => prev + 1);

      // Save to database (upsert handles the UNIQUE constraint)
      const supabase = createClient();
      await supabase.from('interactions').upsert(
        { user_id: userId, pet_id: currentPet.id, type: interactionType },
        { onConflict: 'user_id,pet_id' }
      );

      // Update local interactions list for behavioral scoring
      setUserInteractions((prev) => [
        ...prev,
        { pet_id: currentPet.id, type: interactionType },
      ]);
    },
    [currentPet, userId]
  );

  const handleUndo = useCallback(async () => {
    if (currentIndex > 0 && lastSwipedPet) {
      setCurrentIndex((prev) => prev - 1);
      setLastSwipedPet(null);
      // Adjust counts
      if (likedCount > 0) setLikedCount((prev) => prev - 1);
      else if (passedCount > 0) setPassedCount((prev) => prev - 1);

      // Delete the interaction from DB
      if (userId) {
        const supabase = createClient();
        await supabase
          .from('interactions')
          .delete()
          .eq('user_id', userId)
          .eq('pet_id', lastSwipedPet.id);
      }

      // Remove from local interactions list
      setUserInteractions((prev) =>
        prev.filter((i) => i.pet_id !== lastSwipedPet.id)
      );
    }
  }, [currentIndex, lastSwipedPet, likedCount, passedCount, userId]);

  const handleViewDetails = useCallback(() => {
    if (currentPet) {
      router.push(`/pet/${currentPet.id}`);
    }
  }, [currentPet, router]);

  const handleStartOver = useCallback(() => {
    // Re-score and show all pets (including previously seen ones)
    if (userPreferences && allPetsRef.current.length > 0) {
      let filtered = applyFilters(allPetsRef.current, filterProvince, filterCity, filterMaxFee);
      const sorted = scoreAndSortPets(
        filtered,
        userPreferences,
        userInteractions,
        allPetsRef.current
      );
      setPets(sorted);
      setCurrentIndex(0);
    }
  }, [userPreferences, userInteractions, filterProvince, filterCity, filterMaxFee]);

  // Filter helper
  function applyFilters(petsList, province, city, maxFee) {
    let result = petsList;
    if (province) result = result.filter((p) => p.province === province);
    if (city) result = result.filter((p) => p.city.toLowerCase().includes(city.toLowerCase()));
    if (maxFee !== '' && !isNaN(Number(maxFee))) {
      const max = Number(maxFee);
      result = result.filter((p) => p.adoption_fee == null || Number(p.adoption_fee) <= max);
    }
    return result;
  }

  const handleApplyFilters = useCallback(() => {
    if (!userPreferences || allPetsRef.current.length === 0) return;

    const allPets = allPetsRef.current;
    const seenIds = new Set(userInteractions.map((i) => i.pet_id));
    let unseenPets = allPets.filter((p) => !seenIds.has(p.id));
    unseenPets = applyFilters(unseenPets, filterProvince, filterCity, filterMaxFee);

    const sorted = scoreAndSortPets(unseenPets, userPreferences, userInteractions, allPets);
    setPets(sorted);
    setCurrentIndex(0);
    setShowFilters(false);

    // Save filter preferences to profile
    const saveFilters = async () => {
      if (!userId) return;
      const supabase = createClient();
      await supabase.from('profiles').update({
        preferred_province: filterProvince || null,
        max_adoption_fee: filterMaxFee !== '' ? Number(filterMaxFee) : null,
      }).eq('id', userId);
    };
    saveFilters();
  }, [userPreferences, userInteractions, filterProvince, filterCity, filterMaxFee, userId]);

  const handleClearFilters = useCallback(() => {
    setFilterProvince('');
    setFilterCity('');
    setFilterMaxFee('');
    if (!userPreferences || allPetsRef.current.length === 0) return;

    const allPets = allPetsRef.current;
    const seenIds = new Set(userInteractions.map((i) => i.pet_id));
    const unseenPets = allPets.filter((p) => !seenIds.has(p.id));
    const sorted = scoreAndSortPets(unseenPets, userPreferences, userInteractions, allPets);
    setPets(sorted);
    setCurrentIndex(0);
    setShowFilters(false);

    // Clear saved filters
    if (userId) {
      const supabase = createClient();
      supabase.from('profiles').update({
        preferred_province: null,
        max_adoption_fee: null,
      }).eq('id', userId);
    }
  }, [userPreferences, userInteractions, userId]);

  const hasActiveFilters = filterProvince || filterCity || filterMaxFee;

  const matchReasons = currentPet && userPreferences
    ? getMatchReasons(currentPet, userPreferences, userInteractions)
    : [];

  const matchPercent = currentPet
    ? Math.round((currentPet._score / 120) * 100)
    : 0;

  return (
    <main className="flex min-h-dvh flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="text-sm">
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            Liked: {likedCount}
          </span>
        </div>
        <h1 className="text-xl font-bold">
          pet<span className="text-orange-500">Matcher</span>
        </h1>
        <div className="text-sm">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
            Passed: {passedCount}
          </span>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="border-b border-gray-200 bg-white px-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex w-full items-center justify-between py-2 text-sm text-gray-600"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                Active
              </span>
            )}
          </span>
          <ChevronUp className={`h-4 w-4 transition ${showFilters ? '' : 'rotate-180'}`} />
        </button>

        {showFilters && (
          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Province</label>
                <select
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">All Provinces</option>
                  {availableProvinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">City</label>
                <input
                  type="text"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  placeholder="Any city"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Max Adoption Fee ($)</label>
              <input
                type="number"
                value={filterMaxFee}
                onChange={(e) => setFilterMaxFee(e.target.value)}
                placeholder="No limit"
                min="0"
                step="10"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Swipe Area */}
      <div className="relative flex flex-1 items-center justify-center px-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-gray-600">Loading pets...</p>
          </div>
        ) : (
        <AnimatePresence mode="popLayout">
          {currentPet ? (
            <motion.div
              key={currentPet.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm"
            >
              {/* Pet Card */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                {/* Pet Image */}
                <div
                  className="relative aspect-[3/4] w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${currentPet.photos[0]})` }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Match percentage badge */}
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-white shadow">
                      {matchPercent}% Match
                    </span>
                  </div>

                  {/* Info button */}
                  <button
                    onClick={handleViewDetails}
                    className="absolute right-4 top-4 rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/30"
                    aria-label="View pet details"
                  >
                    <Info className="h-5 w-5 text-white" />
                  </button>

                  {/* Pet info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h2 className="text-2xl font-bold">{currentPet.name}</h2>
                    <p className="text-sm opacity-90">
                      {currentPet.breed} · {formatAge(currentPet.age_years)} ·{' '}
                      {capitalize(currentPet.size)}
                    </p>
                    <p className="mt-1 text-sm opacity-80">
                      {currentPet.city}, {currentPet.province}
                      {currentPet.adoption_fee != null && (
                        <span className="ml-2 font-semibold">${Number(currentPet.adoption_fee).toFixed(0)}</span>
                      )}
                    </p>
                  </div>
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
            </motion.div>
          ) : (
            <div className="text-center">
              {error ? (
                <>
                  <div className="mb-4 text-6xl">&#9888;&#65039;</div>
                  <h2 className="mb-2 text-xl font-bold">Error loading pets</h2>
                  <p className="mb-4 text-gray-600">{error}</p>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </>
              ) : pets.length === 0 ? (
                <>
                  <div className="mb-4 text-6xl">&#128062;</div>
                  <h2 className="mb-2 text-xl font-bold">No pets available</h2>
                  <p className="mb-4 text-gray-600">
                    There are no pets listed yet. Check back soon!
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-4 text-6xl">&#127881;</div>
                  <h2 className="mb-2 text-xl font-bold">You&apos;ve seen all pets!</h2>
                  <p className="mb-4 text-gray-600">
                    Check back later for new arrivals.
                  </p>
                  <Button onClick={handleStartOver}>Start Over</Button>
                </>
              )}
            </div>
          )}
        </AnimatePresence>
        )}
      </div>

      {/* Action Buttons */}
      {currentPet && (
        <div className="flex items-center justify-center gap-4 py-4">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={currentIndex === 0}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 text-gray-400 transition hover:border-gray-400 hover:text-gray-500 disabled:opacity-30"
            aria-label="Undo last swipe"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {/* Pass */}
          <button
            onClick={() => handleSwipe('left')}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-400 text-red-400 transition hover:bg-red-50"
            aria-label="Pass on this pet"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Like */}
          <button
            onClick={() => handleSwipe('right')}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-400 text-green-400 transition hover:bg-green-50"
            aria-label="Like this pet"
          >
            <Heart className="h-8 w-8" />
          </button>

          {/* Info */}
          <button
            onClick={handleViewDetails}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-300 text-blue-400 transition hover:border-blue-400 hover:text-blue-500"
            aria-label="View pet details"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
