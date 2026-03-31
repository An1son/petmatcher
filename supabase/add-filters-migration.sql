-- Migration: Add adoption_fee to pets, add filter preferences to profiles
-- Run this in your Supabase SQL Editor

-- Add adoption fee column to pets (nullable — some shelters may not charge)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS adoption_fee NUMERIC(8,2);

-- Add filter preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_province TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_adoption_fee NUMERIC(8,2);
