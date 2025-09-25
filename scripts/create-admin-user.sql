-- Script to create admin users in the database
-- Run this script to add admin users to your system

-- First, ensure the auth.users table exists and create an admin user
-- Note: In a real Supabase setup, you would use the Supabase Auth API
-- This is a simplified approach for demonstration

-- Create a simple admins table to store admin credentials
CREATE TABLE IF NOT EXISTS public.admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows admins to read their own data
CREATE POLICY "Admins can read own data" ON public.admins
  FOR SELECT USING (true);

-- Insert a default admin user (password: dss2025)
-- Note: In production, you should hash passwords properly
INSERT INTO public.admins (email, password_hash, name) 
VALUES (
  'admin@bowenuniversity.edu.ng',
  'dss2025', -- In production, this should be properly hashed
  'DSS Administrator'
) ON CONFLICT (email) DO NOTHING;

-- You can add more admin users by running:
-- INSERT INTO public.admins (email, password_hash, name) 
-- VALUES ('another-admin@bowenuniversity.edu.ng', 'hashed_password', 'Admin Name');
