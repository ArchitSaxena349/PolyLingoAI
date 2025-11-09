/*
  # Fix User Profile Access Issues

  1. Security Updates
    - Update RLS policies for users table to ensure proper access
    - Add fallback policies using auth.uid() function
    - Ensure authenticated users can read their own profile data

  2. Changes
    - Drop existing problematic policies
    - Create new, more robust policies for user profile access
    - Add policy for service role access
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

-- Create new, more robust policies
CREATE POLICY "Enable read access for users based on user_id"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users based on user_id"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Service role policy for admin access
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;