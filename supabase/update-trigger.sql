-- Update the handle_new_user trigger to support role from metadata
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Get role from metadata, default to 'adopter'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'adopter'::user_role
  );

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create shelter (bypasses RLS for signup flow)
CREATE OR REPLACE FUNCTION public.create_shelter_for_user(
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_city TEXT,
  p_province TEXT
)
RETURNS UUID AS $$
DECLARE
  new_shelter_id UUID;
BEGIN
  -- Update profile role to shelter
  UPDATE public.profiles
  SET role = 'shelter'
  WHERE id = p_user_id;

  -- Create shelter record
  INSERT INTO public.shelters (owner_user_id, name, email, phone, address, city, province)
  VALUES (p_user_id, p_name, p_email, p_phone, p_address, p_city, p_province)
  RETURNING id INTO new_shelter_id;

  RETURN new_shelter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
