/*
  # Fix authentication and RLS policies

  1. Updates
    - Drop and recreate the users INSERT policy to be more permissive
    - Allow users to insert their own profile data during signup
    - Handle edge cases for user profile creation

  2. Security
    - Maintain security while allowing proper user registration
    - Ensure users can only create their own profiles
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create a more permissive INSERT policy that handles signup properly
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR 
    auth.uid()::text = id::text
  );

-- Also ensure we can handle the case where auth.uid() might be null during certain operations
-- by creating an additional policy for service role operations
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);