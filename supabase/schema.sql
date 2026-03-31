-- PetMatcher Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('adopter', 'shelter');
CREATE TYPE activity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE pet_species AS ENUM ('dog', 'cat', 'rabbit', 'other');
CREATE TYPE interaction_type AS ENUM ('like', 'skip', 'favourite');
CREATE TYPE inquiry_status AS ENUM ('pending', 'read', 'responded');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'adopter',
  has_children BOOLEAN NOT NULL DEFAULT false,
  has_other_pets BOOLEAN NOT NULL DEFAULT false,
  activity_level activity_level NOT NULL DEFAULT 'medium',
  preferred_distance_km INTEGER NOT NULL DEFAULT 50,
  preferred_pet_types pet_species[] NOT NULL DEFAULT ARRAY['dog'::pet_species, 'cat'::pet_species],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shelters table
CREATE TABLE shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pets table
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species pet_species NOT NULL,
  breed TEXT NOT NULL,
  age_years NUMERIC(4,1) NOT NULL,
  size pet_size NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  energy_level activity_level NOT NULL,
  good_with_kids BOOLEAN NOT NULL DEFAULT false,
  good_with_pets BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  photos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interactions table (likes, skips, favourites)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

-- Inquiries table
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  message TEXT,
  status inquiry_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pets_shelter ON pets(shelter_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_interactions_user ON interactions(user_id);
CREATE INDEX idx_interactions_pet ON interactions(pet_id);
CREATE INDEX idx_inquiries_user ON inquiries(user_id);
CREATE INDEX idx_inquiries_shelter ON inquiries(shelter_id);

-- Updated_at trigger for pets
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Shelters: viewable by all, editable by owner
CREATE POLICY "Shelters are viewable by everyone" ON shelters
  FOR SELECT USING (true);

CREATE POLICY "Shelter owners can update their shelter" ON shelters
  FOR UPDATE USING (auth.uid() = owner_user_id);

CREATE POLICY "Shelter owners can insert their shelter" ON shelters
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

-- Pets: viewable by all, editable by shelter owner
CREATE POLICY "Pets are viewable by everyone" ON pets
  FOR SELECT USING (true);

CREATE POLICY "Shelter owners can manage pets" ON pets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shelters
      WHERE shelters.id = pets.shelter_id
      AND shelters.owner_user_id = auth.uid()
    )
  );

-- Interactions: users can only see and manage their own
CREATE POLICY "Users can view own interactions" ON interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Inquiries: users see their own, shelters see inquiries for their shelter
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Shelters can view their inquiries" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shelters
      WHERE shelters.id = inquiries.shelter_id
      AND shelters.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Shelters can update inquiry status" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM shelters
      WHERE shelters.id = inquiries.shelter_id
      AND shelters.owner_user_id = auth.uid()
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKET FOR PET PHOTOS
-- ============================================

-- Create a public bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can view, authenticated users can upload
CREATE POLICY "Anyone can view pet photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'pet-photos');

CREATE POLICY "Authenticated users can upload pet photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pet-photos');

CREATE POLICY "Users can update their own uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- RPC: Aggregated like counts per pet
-- ============================================
-- Returns the number of 'like' interactions each pet has received.
-- SECURITY DEFINER so any user can see popularity data without
-- seeing other users' individual interactions (bypasses RLS).
CREATE OR REPLACE FUNCTION public.get_pet_like_counts()
RETURNS TABLE(pet_id UUID, like_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT pet_id, COUNT(*) AS like_count
  FROM interactions
  WHERE type = 'like'
  GROUP BY pet_id;
$$;
