-- PetMatcher Seed Data
-- Run this AFTER schema.sql to populate test data

-- ============================================
-- STEP 1: Create test users via Supabase Auth
-- ============================================
-- First, create users in Supabase Dashboard:
--   1. Go to Authentication → Users → Add User
--   2. Create: shelter@test.com / testpass123
--   3. Create: adopter@test.com / testpass123
--
-- OR use this SQL which works with Supabase's auth schema:

DO $$
DECLARE
  shelter_user_id UUID;
  adopter_user_id UUID;
BEGIN
  -- Check if users already exist, if not we'll use placeholder IDs
  -- The actual users should be created via Dashboard or signup flow

  -- Try to get existing user IDs
  SELECT id INTO shelter_user_id FROM auth.users WHERE email = 'shelter@test.com' LIMIT 1;
  SELECT id INTO adopter_user_id FROM auth.users WHERE email = 'adopter@test.com' LIMIT 1;

  -- If no users exist, create placeholder profiles that will work with RLS disabled
  IF shelter_user_id IS NULL THEN
    shelter_user_id := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID;
    -- Insert directly into profiles (bypassing the trigger for seeding)
    INSERT INTO profiles (id, name, email, role, has_children, has_other_pets, activity_level)
    VALUES (shelter_user_id, 'Test Shelter Owner', 'shelter@test.com', 'shelter', false, true, 'high')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Update existing profile
    UPDATE profiles SET
      role = 'shelter',
      has_children = false,
      has_other_pets = true,
      activity_level = 'high'
    WHERE id = shelter_user_id;
  END IF;

  IF adopter_user_id IS NULL THEN
    adopter_user_id := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID;
    INSERT INTO profiles (id, name, email, role, has_children, has_other_pets, activity_level, preferred_distance_km, preferred_pet_types)
    VALUES (adopter_user_id, 'Test Adopter', 'adopter@test.com', 'adopter', true, false, 'medium', 25, ARRAY['dog', 'cat']::pet_species[])
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE profiles SET
      role = 'adopter',
      has_children = true,
      has_other_pets = false,
      activity_level = 'medium',
      preferred_distance_km = 25,
      preferred_pet_types = ARRAY['dog', 'cat']::pet_species[]
    WHERE id = adopter_user_id;
  END IF;
END $$;

-- ============================================
-- STEP 2: Create shelters
-- ============================================
-- Using the placeholder shelter owner ID

INSERT INTO shelters (id, owner_user_id, name, email, phone, address, city, province, website_url) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Happy Paws Shelter',
   'info@happypaws.ca',
   '604-555-0123',
   '123 Pet Street',
   'Vancouver',
   'BC',
   'https://happypaws.ca'),
  ('22222222-2222-2222-2222-222222222222',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Second Chance Animal Rescue',
   'adopt@secondchance.ca',
   '604-555-0456',
   '456 Rescue Lane',
   'Burnaby',
   'BC',
   'https://secondchance.ca'),
  ('33333333-3333-3333-3333-333333333333',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Surrey SPCA',
   'info@surreyspca.ca',
   '604-555-0789',
   '789 Animal Ave',
   'Surrey',
   'BC',
   'https://surreyspca.ca')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Create pets
-- ============================================

INSERT INTO pets (shelter_id, name, species, breed, age_years, size, sex, energy_level, good_with_kids, good_with_pets, description, city, province, photos) VALUES

-- Happy Paws Shelter - Vancouver
('11111111-1111-1111-1111-111111111111',
 'Max',
 'dog',
 'Golden Retriever',
 3,
 'large',
 'male',
 'high',
 true,
 true,
 'Max is a friendly and energetic Golden Retriever who loves to play fetch and go for long walks. He''s great with kids and other pets!',
 'Vancouver',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600']),

('11111111-1111-1111-1111-111111111111',
 'Luna',
 'cat',
 'Siamese',
 2,
 'medium',
 'female',
 'medium',
 true,
 false,
 'Luna is a beautiful Siamese cat with striking blue eyes. She''s affectionate but prefers to be the only pet in the household.',
 'Vancouver',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600']),

('11111111-1111-1111-1111-111111111111',
 'Buddy',
 'dog',
 'Beagle',
 5,
 'medium',
 'male',
 'medium',
 true,
 true,
 'Buddy is a laid-back Beagle who enjoys sniffing around the backyard and cuddling on the couch. Perfect for a family!',
 'Vancouver',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600']),

('11111111-1111-1111-1111-111111111111',
 'Charlie',
 'dog',
 'Labrador Retriever',
 1,
 'large',
 'male',
 'high',
 true,
 true,
 'Charlie is a playful Lab puppy full of energy! He''s still learning but is very eager to please and loves water.',
 'Vancouver',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600']),

('11111111-1111-1111-1111-111111111111',
 'Cleo',
 'cat',
 'Persian',
 4,
 'medium',
 'female',
 'low',
 true,
 true,
 'Cleo is a fluffy Persian princess who loves being brushed and lounging in sunny spots. Very gentle and calm.',
 'Vancouver',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600']),

-- Second Chance Animal Rescue - Burnaby
('22222222-2222-2222-2222-222222222222',
 'Whiskers',
 'cat',
 'Maine Coon',
 4,
 'large',
 'male',
 'low',
 true,
 true,
 'Whiskers is a gentle giant who loves lounging in sunny spots. He gets along well with everyone and has a magnificent fluffy tail!',
 'Burnaby',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600']),

('22222222-2222-2222-2222-222222222222',
 'Bella',
 'dog',
 'French Bulldog',
 2,
 'small',
 'female',
 'medium',
 true,
 true,
 'Bella is an adorable Frenchie who loves attention and short walks. She''s perfect for apartment living and loves to snore on the couch!',
 'Burnaby',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600']),

('22222222-2222-2222-2222-222222222222',
 'Oreo',
 'rabbit',
 'Dutch',
 1,
 'small',
 'male',
 'low',
 true,
 false,
 'Oreo is a sweet black and white Dutch rabbit who loves to hop around and munch on hay. Great for first-time pet owners!',
 'Burnaby',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600']),

('22222222-2222-2222-2222-222222222222',
 'Mittens',
 'cat',
 'Tabby',
 8,
 'medium',
 'female',
 'low',
 false,
 false,
 'Mittens is a calm senior cat looking for a quiet home. She prefers a relaxed environment without young children or other pets.',
 'Burnaby',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600']),

('22222222-2222-2222-2222-222222222222',
 'Rocky',
 'dog',
 'German Shepherd',
 3,
 'large',
 'male',
 'high',
 false,
 false,
 'Rocky is a loyal and intelligent German Shepherd. He needs an experienced owner and would thrive as the only pet in an adult household.',
 'Burnaby',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600']),

-- Surrey SPCA
('33333333-3333-3333-3333-333333333333',
 'Daisy',
 'dog',
 'Poodle Mix',
 2,
 'small',
 'female',
 'medium',
 true,
 true,
 'Daisy is a hypoallergenic cutie who loves to learn tricks! She''s smart, playful, and great with everyone she meets.',
 'Surrey',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600']),

('33333333-3333-3333-3333-333333333333',
 'Shadow',
 'cat',
 'Black Domestic Shorthair',
 3,
 'medium',
 'male',
 'medium',
 true,
 true,
 'Shadow is a sleek black cat with golden eyes. Don''t let superstition fool you - he''s pure good luck and loves to play!',
 'Surrey',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600']),

('33333333-3333-3333-3333-333333333333',
 'Ginger',
 'cat',
 'Orange Tabby',
 1,
 'medium',
 'female',
 'high',
 true,
 true,
 'Ginger is a spunky orange tabby kitten who loves to chase toys and climb cat trees. Full of personality and mischief!',
 'Surrey',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600']),

('33333333-3333-3333-3333-333333333333',
 'Duke',
 'dog',
 'Boxer',
 4,
 'large',
 'male',
 'high',
 true,
 true,
 'Duke is a goofy Boxer who thinks he''s a lap dog! He loves to play and will keep you entertained with his silly antics.',
 'Surrey',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1543071220-6ee5bf71a54e?w=600']),

('33333333-3333-3333-3333-333333333333',
 'Cinnamon',
 'rabbit',
 'Holland Lop',
 2,
 'small',
 'female',
 'low',
 true,
 true,
 'Cinnamon is an adorable lop-eared bunny with a sweet temperament. She loves gentle pets and will binky when happy!',
 'Surrey',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600']),

('33333333-3333-3333-3333-333333333333',
 'Cooper',
 'dog',
 'Corgi',
 2,
 'medium',
 'male',
 'high',
 true,
 true,
 'Cooper is a happy Corgi with the cutest waddle! He loves herding, playing fetch, and getting belly rubs.',
 'Surrey',
 'BC',
 ARRAY['https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600']);

-- ============================================
-- STEP 4: Add sample interactions for test adopter
-- ============================================

-- Get some pet IDs and create interactions
DO $$
DECLARE
  pet_record RECORD;
  counter INTEGER := 0;
BEGIN
  FOR pet_record IN SELECT id FROM pets ORDER BY created_at LIMIT 5 LOOP
    counter := counter + 1;
    IF counter <= 2 THEN
      -- Like first 2 pets
      INSERT INTO interactions (user_id, pet_id, type)
      VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', pet_record.id, 'like')
      ON CONFLICT (user_id, pet_id) DO NOTHING;
    ELSIF counter = 3 THEN
      -- Favourite the 3rd pet
      INSERT INTO interactions (user_id, pet_id, type)
      VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', pet_record.id, 'favourite')
      ON CONFLICT (user_id, pet_id) DO NOTHING;
    ELSE
      -- Skip the rest
      INSERT INTO interactions (user_id, pet_id, type)
      VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', pet_record.id, 'skip')
      ON CONFLICT (user_id, pet_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- Done! Test accounts:
-- ============================================
-- Shelter Owner: shelter@test.com / testpass123
-- Adopter: adopter@test.com / testpass123
