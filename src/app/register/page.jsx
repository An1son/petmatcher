'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Eye, EyeOff, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

const baseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['adopter', 'shelter']),
  // Adopter preference fields
  preferredPetTypes: z.array(z.string()).default(['dog', 'cat']),
  activityLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  hasChildren: z.boolean().default(false),
  hasOtherPets: z.boolean().default(false),
  // Shelter-specific fields (optional, validated conditionally)
  shelterName: z.string().optional(),
  shelterPhone: z.string().optional(),
  shelterAddress: z.string().optional(),
  shelterCity: z.string().optional(),
  shelterProvince: z.string().optional(),
});

const registerSchema = baseSchema
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'shelter') {
        return data.shelterName && data.shelterName.length >= 2;
      }
      return true;
    },
    { message: 'Shelter name is required', path: ['shelterName'] }
  )
  .refine(
    (data) => {
      if (data.role === 'shelter') {
        return data.shelterPhone && data.shelterPhone.length >= 10;
      }
      return true;
    },
    { message: 'Valid phone number is required', path: ['shelterPhone'] }
  )
  .refine(
    (data) => {
      if (data.role === 'shelter') {
        return data.shelterAddress && data.shelterAddress.length >= 5;
      }
      return true;
    },
    { message: 'Address is required', path: ['shelterAddress'] }
  )
  .refine(
    (data) => {
      if (data.role === 'shelter') {
        return data.shelterCity && data.shelterCity.length >= 2;
      }
      return true;
    },
    { message: 'City is required', path: ['shelterCity'] }
  );

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('adopter');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'adopter',
      shelterProvince: 'BC',
      preferredPetTypes: ['dog', 'cat'],
      activityLevel: 'medium',
      hasChildren: false,
      hasOtherPets: false,
    },
  });

  const preferredPetTypes = watch('preferredPetTypes');
  const activityLevel = watch('activityLevel');
  const hasChildren = watch('hasChildren');
  const hasOtherPets = watch('hasOtherPets');

  const togglePetType = (type) => {
    const current = preferredPetTypes || [];
    if (current.includes(type)) {
      if (current.length > 1) {
        setValue('preferredPetTypes', current.filter((t) => t !== type));
      }
    } else {
      setValue('preferredPetTypes', [...current, type]);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data) => {
    setError(null);
    const supabase = createClient();

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If shelter, create shelter record using database function
    if (data.role === 'shelter' && authData.user) {
      const { error: shelterError } = await supabase.rpc('create_shelter_for_user', {
        p_user_id: authData.user.id,
        p_name: data.shelterName,
        p_email: data.email,
        p_phone: data.shelterPhone,
        p_address: data.shelterAddress,
        p_city: data.shelterCity,
        p_province: data.shelterProvince || 'BC',
      });

      if (shelterError) {
        console.error('Error creating shelter:', shelterError);
        setError('Account created but failed to set up shelter. Please contact support.');
        return;
      }

      // Redirect shelter to dashboard
      router.push('/dashboard');
      router.refresh();
    } else if (authData.user) {
      // Save adopter preferences to profile
      await supabase.from('profiles').update({
        activity_level: data.activityLevel,
        has_children: data.hasChildren,
        has_other_pets: data.hasOtherPets,
        preferred_pet_types: data.preferredPetTypes,
      }).eq('id', authData.user.id);

      // Redirect adopter to browse
      router.push('/browse');
      router.refresh();
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
          <Heart className="h-8 w-8 text-orange-500" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          pet<span className="text-orange-500">Matcher</span>
        </h1>
        <p className="mt-2 text-gray-600">Create your account</p>
      </div>

      {/* Register Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Role Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">I am a...</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleChange('adopter')}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                selectedRole === 'adopter'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className="h-6 w-6" />
              <span className="text-sm font-medium">Pet Adopter</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('shelter')}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                selectedRole === 'shelter'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building2 className="h-6 w-6" />
              <span className="text-sm font-medium">Shelter/Rescue</span>
            </button>
          </div>
        </div>

        <Input
          {...register('name')}
          type="text"
          label={selectedRole === 'shelter' ? 'Contact Name' : 'Full Name'}
          placeholder="Enter your name"
          error={errors.name?.message}
          autoComplete="name"
        />

        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="Enter your email address"
          error={errors.email?.message}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a password"
            error={errors.password?.message}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <Input
          {...register('confirmPassword')}
          type={showPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <p className="text-xs text-gray-500">
          Password must be at least 8 characters with one uppercase letter and one
          number.
        </p>

        {/* Adopter preference fields */}
        {selectedRole === 'adopter' && (
          <div className="space-y-4 rounded-xl bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">Pet Preferences</h3>

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
                      preferredPetTypes?.includes(type)
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
                    onClick={() => setValue('activityLevel', level)}
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
                      onClick={() => setValue('hasChildren', opt.value)}
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
                      onClick={() => setValue('hasOtherPets', opt.value)}
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
        )}

        {/* Shelter-specific fields */}
        {selectedRole === 'shelter' && (
          <div className="space-y-4 rounded-xl bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">Shelter Information</h3>

            <Input
              {...register('shelterName')}
              type="text"
              label="Shelter/Organization Name"
              placeholder="e.g., Happy Paws Rescue"
              error={errors.shelterName?.message}
            />

            <Input
              {...register('shelterPhone')}
              type="tel"
              label="Phone Number"
              placeholder="e.g., 604-555-0123"
              error={errors.shelterPhone?.message}
            />

            <Input
              {...register('shelterAddress')}
              type="text"
              label="Street Address"
              placeholder="e.g., 123 Pet Street"
              error={errors.shelterAddress?.message}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                {...register('shelterCity')}
                type="text"
                label="City"
                placeholder="e.g., Vancouver"
                error={errors.shelterCity?.message}
              />
              <Input
                {...register('shelterProvince')}
                type="text"
                label="Province"
                placeholder="e.g., BC"
                error={errors.shelterProvince?.message}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
        >
          {selectedRole === 'shelter' ? 'Register Shelter' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-orange-500 hover:text-orange-600"
          >
            Log In
          </Link>
        </p>
      </form>
    </main>
  );
}
