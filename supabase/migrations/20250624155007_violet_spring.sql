/*
  # Add INSERT policy for users table

  1. Security
    - Add policy for authenticated users to insert their own data
    - Ensures users can only create profiles for themselves

  This migration adds the missing INSERT policy that allows authenticated users
  to create their own user profile records.
*/

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);