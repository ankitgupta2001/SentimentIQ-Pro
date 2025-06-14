/*
  # Fix RLS policies for profiles table

  1. Security Updates
    - Drop existing RLS policies that may be causing issues
    - Create new, more robust RLS policies for profiles table
    - Ensure proper authentication checks for all operations
    
  2. Policy Changes
    - Allow authenticated users to insert their own profile during registration
    - Allow authenticated users to read their own profile
    - Allow authenticated users to update their own profile
    - Ensure policies work correctly with auth.uid()
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new INSERT policy that allows users to create their own profile
CREATE POLICY "Enable insert for authenticated users own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create new SELECT policy that allows users to read their own profile
CREATE POLICY "Enable read access for users own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create new UPDATE policy that allows users to update their own profile
CREATE POLICY "Enable update for users own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;