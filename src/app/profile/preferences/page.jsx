'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function PreferencesPage() {
  const router = useRouter();
  const [preferredPetTypes, setPreferredPetTypes] = useState([]);
  const [activityLevel, setActivityLevel] = useState('medium');
  const [hasChildren, setHasChildren] = useState(false);
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [preferredProvince, setPreferredProvince] = useState('');
  const [maxAdoptionFee, setMaxAdoptionFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadPreferences = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('activity_level, has_children, has_other_pets, preferred_pet_types, preferred_province, max_adoption_fee')
          .eq('id', user.id)
          .single();

        if (data) {
          setPreferredPetTypes(data.preferred_pet_types || ['dog', 'cat']);
          setActivityLevel(data.activity_level || 'medium');
          setHasChildren(data.has_children ?? false);
          setHasOtherPets(data.has_other_pets ?? false);
          setPreferredProvince(data.preferred_province || '');
          setMaxAdoptionFee(data.max_adoption_fee != null ? String(data.max_adoption_fee) : '');
        }
      }
      setLoading(false);
    };
    loadPreferences();
  }, []);

  const togglePetType = (type) => {
    setPreferredPetTypes((current) => {
      if (current.includes(type)) {
        if (current.length > 1) return current.filter((t) => t !== type);
        return current;
      }
      return [...current, type];
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('profiles')
      .update({
        preferred_pet_types: preferredPetTypes,
        activity_level: activityLevel,
        has_children: hasChildren,
        has_other_pets: hasOtherPets,
        preferred_province: preferredProvince || null,
        max_adoption_fee: maxAdoptionFee !== '' ? Number(maxAdoptionFee) : null,
      })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
      setTimeout(() => router.back(), 1000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Pet Preferences</h1>
      </header>

      <form onSubmit={handleSave} className="mx-auto max-w-sm space-y-6 px-4 py-6">
        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === 'error'
                ? 'bg-red-50 text-red-600'
                : 'bg-green-50 text-green-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          {/* Preferred pet types */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Preferred Pet Types
            </label>
            <div className="flex flex-wrap gap-2">
              {['dog', 'cat', 'rabbit', 'other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => togglePetType(type)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    preferredPetTypes.includes(type)
                      ? 'border-orange-500 bg-orange-100 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Activity level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Activity Level
            </label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setActivityLevel(level)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    activityLevel === level
                      ? 'border-orange-500 bg-orange-100 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Has children */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Do you have children?
            </label>
            <div className="flex gap-2">
              {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(
                (opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setHasChildren(opt.value)}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      hasChildren === opt.value
                        ? 'border-orange-500 bg-orange-100 text-orange-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Has other pets */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Do you have other pets?
            </label>
            <div className="flex gap-2">
              {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(
                (opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setHasOtherPets(opt.value)}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      hasOtherPets === opt.value
                        ? 'border-orange-500 bg-orange-100 text-orange-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Location & Fee Filters */}
        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-700">Location & Budget</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Preferred Province
            </label>
            <input
              type="text"
              value={preferredProvince}
              onChange={(e) => setPreferredProvince(e.target.value)}
              placeholder="e.g., BC (leave blank for all)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Max Adoption Fee ($)
            </label>
            <input
              type="number"
              value={maxAdoptionFee}
              onChange={(e) => setMaxAdoptionFee(e.target.value)}
              placeholder="No limit"
              min="0"
              step="10"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={saving}>
          Save Preferences
        </Button>
      </form>
    </main>
  );
}
