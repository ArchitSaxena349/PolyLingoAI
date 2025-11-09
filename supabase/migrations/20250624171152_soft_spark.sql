/*
  # Add Missing Users RLS Policies

  1. Security Updates
    - Add missing RLS policies for users table
    - Allow authenticated users to insert their own profile during signup
    - Allow authenticated users to delete their own profile
    - Add service role access for administrative operations

  2. Changes
    - INSERT policy for user profile creation during signup
    - DELETE policy for account deletion
    - Service role policy for full access to users table
*/

-- Add missing INSERT policy for users table (needed during signup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Enable insert for authenticated users based on user_id'
  ) THEN
    CREATE POLICY "Enable insert for authenticated users based on user_id"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Add missing DELETE policy for users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Enable delete for users based on user_id'
  ) THEN
    CREATE POLICY "Enable delete for users based on user_id"
      ON users
      FOR DELETE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Add missing UPDATE policy for users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Enable update for users based on user_id'
  ) THEN
    CREATE POLICY "Enable update for users based on user_id"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Add service role policy for full access (needed for administrative operations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Service role full access'
  ) THEN
    CREATE POLICY "Service role full access"
      ON users
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;