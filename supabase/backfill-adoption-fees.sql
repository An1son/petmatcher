-- Backfill adoption_fee for any pets missing one, then enforce NOT NULL.
-- Run this AFTER add-adoption-fees.sql.
-- Defaults mirror typical Canadian shelter fees by species.

UPDATE pets SET adoption_fee = 300.00 WHERE adoption_fee IS NULL AND species = 'dog';
UPDATE pets SET adoption_fee = 175.00 WHERE adoption_fee IS NULL AND species = 'cat';
UPDATE pets SET adoption_fee = 75.00  WHERE adoption_fee IS NULL AND species = 'rabbit';
UPDATE pets SET adoption_fee = 100.00 WHERE adoption_fee IS NULL AND species = 'other';

-- Safety net for any remaining nulls
UPDATE pets SET adoption_fee = 100.00 WHERE adoption_fee IS NULL;

ALTER TABLE pets ALTER COLUMN adoption_fee SET NOT NULL;
ALTER TABLE pets ALTER COLUMN adoption_fee SET DEFAULT 100.00;
