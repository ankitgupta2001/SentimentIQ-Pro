/*
  # Fix user registration and tier assignment

  1. Database Changes
    - Update the handle_new_user trigger function to properly read tier from metadata
    - Ensure the trigger correctly assigns the selected tier during registration

  2. Security
    - Maintain existing RLS policies
    - Ensure proper data handling during user creation
*/

-- Update the trigger function to properly handle tier assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, tier)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'tier', 'standard')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();