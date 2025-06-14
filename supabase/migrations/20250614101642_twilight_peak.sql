/*
  # Fix profiles table RLS policy for user registration

  1. Security Updates
    - Add missing INSERT policy for authenticated users to create their own profiles
    - This resolves the 401 error during user registration when profiles are created

  2. Changes
    - Allow authenticated users to insert their own profile record
    - Policy checks that the user ID matches the authenticated user's ID
*/

-- Add policy to allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users to insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);