/*
  # Fix system_logs RLS policy for anonymous users

  1. Security Changes
    - Update the existing INSERT policy on `system_logs` table to allow both anonymous and authenticated users
    - This enables client-side logging to work properly for guest users and authenticated users
    
  2. Policy Details
    - The policy allows INSERT operations for both 'anon' and 'authenticated' roles
    - This is necessary because the application logs events during initialization before authentication
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to insert system logs" ON system_logs;

-- Create a new policy that allows both anonymous and authenticated users to insert logs
CREATE POLICY "Allow all users to insert system logs"
  ON system_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);