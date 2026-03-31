'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Building2, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

const shelterProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  about: z.string().optional(),
});

export default function ShelterProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shelter, setShelter] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [contactName, setContactName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(shelterProfileSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setContactName(profile.name);
      }

      // Get shelter info
      const { data: shelterData } = await supabase
        .from('shelters')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

      if (shelterData) {
        setShelter(shelterData);
        reset({
          name: shelterData.name,
          email: shelterData.email,
          phone: shelterData.phone,
          address: shelterData.address,
          city: shelterData.city,
          province: shelterData.province,
          website_url: shelterData.website_url || '',
        });
      }

      setIsLoading(false);
    }

    loadProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    if (!shelter) return;

    setSaveSuccess(false);
    const supabase = createClient();

    const { error } = await supabase
      .from('shelters')
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        province: data.province,
        website_url: data.website_url || null,
      })
      .eq('id', shelter.id);

    if (!error) {
      setShelter({ ...shelter, ...data, website_url: data.website_url || null });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-gray-50 p-6">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Shelter Profile</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Shelter Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{shelter?.name}</h2>
              <p className="text-sm text-gray-600">Contact: {contactName}</p>
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('name')}
              label="Shelter Name"
              placeholder="e.g., Happy Paws Rescue"
              error={errors.name?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="contact@shelter.com"
                error={errors.email?.message}
              />
              <Input
                {...register('phone')}
                type="tel"
                label="Phone"
                placeholder="604-555-0123"
                error={errors.phone?.message}
              />
            </div>

            <Input
              {...register('address')}
              label="Street Address"
              placeholder="123 Pet Street"
              error={errors.address?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('city')}
                label="City"
                placeholder="Vancouver"
                error={errors.city?.message}
              />
              <Input
                {...register('province')}
                label="Province"
                placeholder="BC"
                error={errors.province?.message}
              />
            </div>

            <Input
              {...register('website_url')}
              label="Website (optional)"
              placeholder="https://www.yourshelter.com"
              error={errors.website_url?.message}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Logged in as <span className="font-medium">{shelter?.email}</span>
            </p>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
