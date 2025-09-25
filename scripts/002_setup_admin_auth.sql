-- Create admin user in auth.users table
-- This script sets up the admin user for authentication

-- Note: In a real Supabase setup, you would typically create users through the auth API
-- This is for demonstration purposes

-- Insert admin user into auth.users (this would normally be done through Supabase Auth API)
-- For demo purposes, we'll create a policy that allows anyone to sign up as admin

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN user_email = 'admin@bowenuniversity.edu.ng';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow admin access
DROP POLICY IF EXISTS "Authenticated users can view complaints" ON public.complaints;
CREATE POLICY "Authenticated admin can view complaints" ON public.complaints
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    is_admin_user((auth.jwt() ->> 'email')::text)
  );

DROP POLICY IF EXISTS "Authenticated users can view admin_users" ON public.admin_users;
CREATE POLICY "Authenticated admin can view admin_users" ON public.admin_users
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    is_admin_user((auth.jwt() ->> 'email')::text)
  );

-- Allow anyone to insert complaints (public submission)
-- This policy already exists from the previous script
