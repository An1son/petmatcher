-- PetMatcher Simple Seed Data
-- Just run this to get pets for testing - no user setup needed

-- Temporarily disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE shelters DISABLE ROW LEVEL SECURITY;
ALTER TABLE pets DISABLE ROW LEVEL SECURITY;

-- Create a dummy profile for the shelter owner (bypasses FK constraint)
INSERT INTO profiles (id, name, email, role)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Demo Shelter Owner', 'demo@shelter.com', 'shelter')
ON CONFLICT (id) DO NOTHING;

-- Create shelters
INSERT INTO shelters (id, owner_user_id, name, email, phone, address, city, province, website_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Happy Paws Shelter', 'info@happypaws.ca', '604-555-0123', '123 Pet Street', 'Vancouver', 'BC', 'https://happypaws.ca'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Second Chance Rescue', 'adopt@secondchance.ca', '604-555-0456', '456 Rescue Lane', 'Burnaby', 'BC', 'https://secondchance.ca'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Surrey SPCA', 'info@surreyspca.ca', '604-555-0789', '789 Animal Ave', 'Surrey', 'BC', 'https://surreyspca.ca')
ON CONFLICT (id) DO NOTHING;

-- Create pets
INSERT INTO pets (shelter_id, name, species, breed, age_years, size, sex, energy_level, good_with_kids, good_with_pets, description, city, province, photos) VALUES

-- Dogs
('11111111-1111-1111-1111-111111111111', 'Max', 'dog', 'Golden Retriever', 3, 'large', 'male', 'high', true, true,
 'Max is a friendly and energetic Golden Retriever who loves to play fetch and go for long walks. Great with kids and other pets!',
 'Vancouver', 'BC', ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600']),

('11111111-1111-1111-1111-111111111111', 'Buddy', 'dog', 'Beagle', 5, 'medium', 'male', 'medium', true, true,
 'Buddy is a laid-back Beagle who enjoys sniffing around the backyard and cuddling on the couch. Perfect for a family!',
 'Vancouver', 'BC', ARRAY['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600']),

('11111111-1111-1111-1111-111111111111', 'Charlie', 'dog', 'Labrador Retriever', 1, 'large', 'male', 'high', true, true,
 'Charlie is a playful Lab puppy full of energy! Still learning but very eager to please and loves water.',
 'Vancouver', 'BC', ARRAY['https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600']),

('22222222-2222-2222-2222-222222222222', 'Bella', 'dog', 'French Bulldog', 2, 'small', 'female', 'medium', true, true,
 'Bella is an adorable Frenchie who loves attention and short walks. Perfect for apartment living!',
 'Burnaby', 'BC', ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600']),

('22222222-2222-2222-2222-222222222222', 'Rocky', 'dog', 'German Shepherd', 3, 'large', 'male', 'high', false, false,
 'Rocky is a loyal and intelligent German Shepherd. Needs an experienced owner, would thrive as the only pet.',
 'Burnaby', 'BC', ARRAY['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600']),

('33333333-3333-3333-3333-333333333333', 'Daisy', 'dog', 'Poodle Mix', 2, 'small', 'female', 'medium', true, true,
 'Daisy is a hypoallergenic cutie who loves to learn tricks! Smart, playful, and great with everyone.',
 'Surrey', 'BC', ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600']),

('33333333-3333-3333-3333-333333333333', 'Duke', 'dog', 'Boxer', 4, 'large', 'male', 'high', true, true,
 'Duke is a goofy Boxer who thinks he is a lap dog! Loves to play and will keep you entertained.',
 'Surrey', 'BC', ARRAY['https://images.unsplash.com/photo-1543071220-6ee5bf71a54e?w=600']),

('33333333-3333-3333-3333-333333333333', 'Cooper', 'dog', 'Corgi', 2, 'medium', 'male', 'high', true, true,
 'Cooper is a happy Corgi with the cutest waddle! Loves herding, playing fetch, and belly rubs.',
 'Surrey', 'BC', ARRAY['https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600']),

-- Cats
('11111111-1111-1111-1111-111111111111', 'Luna', 'cat', 'Siamese', 2, 'medium', 'female', 'medium', true, false,
 'Luna is a beautiful Siamese cat with striking blue eyes. Affectionate but prefers to be the only pet.',
 'Vancouver', 'BC', ARRAY['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600']),

('11111111-1111-1111-1111-111111111111', 'Cleo', 'cat', 'Persian', 4, 'medium', 'female', 'low', true, true,
 'Cleo is a fluffy Persian princess who loves being brushed and lounging in sunny spots. Very gentle.',
 'Vancouver', 'BC', ARRAY['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600']),

('22222222-2222-2222-2222-222222222222', 'Whiskers', 'cat', 'Maine Coon', 4, 'large', 'male', 'low', true, true,
 'Whiskers is a gentle giant who loves lounging in sunny spots. Gets along well with everyone!',
 'Burnaby', 'BC', ARRAY['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600']),

('22222222-2222-2222-2222-222222222222', 'Mittens', 'cat', 'Tabby', 8, 'medium', 'female', 'low', false, false,
 'Mittens is a calm senior cat looking for a quiet home. Prefers a relaxed environment.',
 'Burnaby', 'BC', ARRAY['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600']),

('33333333-3333-3333-3333-333333333333', 'Shadow', 'cat', 'Black Domestic Shorthair', 3, 'medium', 'male', 'medium', true, true,
 'Shadow is a sleek black cat with golden eyes. Pure good luck and loves to play!',
 'Surrey', 'BC', ARRAY['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600']),

('33333333-3333-3333-3333-333333333333', 'Ginger', 'cat', 'Orange Tabby', 1, 'medium', 'female', 'high', true, true,
 'Ginger is a spunky orange tabby kitten who loves to chase toys. Full of personality and mischief!',
 'Surrey', 'BC', ARRAY['https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600']),

-- Rabbits
('22222222-2222-2222-2222-222222222222', 'Oreo', 'rabbit', 'Dutch', 1, 'small', 'male', 'low', true, false,
 'Oreo is a sweet black and white Dutch rabbit who loves to hop around and munch on hay.',
 'Burnaby', 'BC', ARRAY['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600']),

('33333333-3333-3333-3333-333333333333', 'Cinnamon', 'rabbit', 'Holland Lop', 2, 'small', 'female', 'low', true, true,
 'Cinnamon is an adorable lop-eared bunny with a sweet temperament. Will binky when happy!',
 'Surrey', 'BC', ARRAY['https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600']);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Done! You now have:
-- 8 dogs, 6 cats, 2 rabbits across 3 shelters
