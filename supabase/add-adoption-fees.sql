-- Add adoption fees to existing pets
-- Run this AFTER add-filters-migration.sql
-- Prices reflect typical Canadian shelter adoption fees

-- Dogs (typically $200-$500, puppies cost more)
UPDATE pets SET adoption_fee = 350.00 WHERE name = 'Max' AND breed = 'Golden Retriever';
UPDATE pets SET adoption_fee = 250.00 WHERE name = 'Buddy' AND breed = 'Beagle';
UPDATE pets SET adoption_fee = 450.00 WHERE name = 'Charlie' AND breed = 'Labrador Retriever';
UPDATE pets SET adoption_fee = 500.00 WHERE name = 'Bella' AND breed = 'French Bulldog';
UPDATE pets SET adoption_fee = 300.00 WHERE name = 'Rocky' AND breed = 'German Shepherd';
UPDATE pets SET adoption_fee = 275.00 WHERE name = 'Daisy' AND breed = 'Poodle Mix';
UPDATE pets SET adoption_fee = 325.00 WHERE name = 'Duke' AND breed = 'Boxer';
UPDATE pets SET adoption_fee = 400.00 WHERE name = 'Cooper' AND breed = 'Corgi';

-- Cats (typically $100-$250, kittens cost more)
UPDATE pets SET adoption_fee = 175.00 WHERE name = 'Luna' AND breed = 'Siamese';
UPDATE pets SET adoption_fee = 200.00 WHERE name = 'Cleo' AND breed = 'Persian';
UPDATE pets SET adoption_fee = 150.00 WHERE name = 'Whiskers' AND breed = 'Maine Coon';
UPDATE pets SET adoption_fee = 100.00 WHERE name = 'Mittens' AND breed = 'Tabby';
UPDATE pets SET adoption_fee = 125.00 WHERE name = 'Shadow' AND breed = 'Black Domestic Shorthair';
UPDATE pets SET adoption_fee = 200.00 WHERE name = 'Ginger' AND breed = 'Orange Tabby';

-- Rabbits (typically $50-$100)
UPDATE pets SET adoption_fee = 75.00  WHERE name = 'Oreo' AND breed = 'Dutch';
UPDATE pets SET adoption_fee = 85.00  WHERE name = 'Cinnamon' AND breed = 'Holland Lop';
