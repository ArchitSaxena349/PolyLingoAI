/*
  # Create demo user account

  1. New Data
    - Insert demo user into auth.users table
    - Insert corresponding profile in public.users table
  
  2. Security
    - Demo user will have same RLS policies as regular users
    - Demo account uses standard authentication flow

  3. Demo Account Details
    - Email: demo@polylingo.ai
    - Password: demo123
    - Name: Demo User
    - Plan: free
*/

-- Insert demo user into auth.users (Supabase's internal auth table)
-- Note: This is a simplified approach. In production, you'd use Supabase's admin API
-- For now, we'll ensure the public.users table has the demo user profile

-- First, let's insert the demo user profile
-- The auth user will need to be created through Supabase's signup process
INSERT INTO public.users (
  id,
  email,
  name,
  plan,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'demo@polylingo.ai',
  'Demo User',
  'free',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;